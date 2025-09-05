from flask import Flask, request, jsonify, send_file
import pandas as pd
import tempfile
import os

app = Flask(__name__)

def assign_rooms(file_path, selected_days, save_path):
    sheet_lessons = "Sheet1"
    sheet_rooms = "Sheet2"

    lessons = pd.read_excel(file_path, sheet_name=sheet_lessons)
    rooms = pd.read_excel(file_path, sheet_name=sheet_rooms)

    lessons["assigned_room"] = None

    rooms["priority"] = rooms["room_num"].astype(str).str[0].astype(int)
    rooms = rooms.sort_values(by=["priority", "room_capacity"])

    room_schedule = {day: {room: [] for room in rooms["room_num"]} for day in range(1, 8)}

    lessons = lessons.sort_values(
        by=["day_id", "start", "stu_capacity"],
        ascending=[True, True, False]
    )

    if not selected_days:
        selected_days = list(range(1, 8))

    lessons = lessons[lessons["day_id"].isin(selected_days)].copy()

    for idx, lesson in lessons.iterrows():
        day = lesson["day_id"]
        needed_capacity = lesson["stu_capacity"]
        start = lesson["start"]
        stop = lesson["stop"]

        if needed_capacity == 0:
            lessons.at[idx, "assigned_room"] = "Empty"
            continue

        assigned = False
        for _, room in rooms.iterrows():
            room_num = room["room_num"]
            room_cap = room["room_capacity"]

            if room_cap >= needed_capacity:
                conflicts = False
                for s, e in room_schedule[day][room_num]:
                    if not (stop <= s or start >= e):
                        conflicts = True
                        break

                if not conflicts:
                    lessons.at[idx, "assigned_room"] = room_num
                    room_schedule[day][room_num].append((start, stop))
                    assigned = True
                    break

        if not assigned:
            lessons.at[idx, "assigned_room"] = "No room available"

    lessons.to_excel(save_path, index=False)


@app.route("/assign", methods=["POST"])
def assign_endpoint():
    file = request.files["file"]
    days = request.form.getlist("days")  # مثلا ["1", "2", "3"]
    days = list(map(int, days))

    # فایل موقت بسازیم
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_input:
        file.save(tmp_input.name)
        tmp_output = tmp_input.name.replace(".xlsx", "_out.xlsx")

        assign_rooms(tmp_input.name, days, tmp_output)

        return send_file(tmp_output, as_attachment=True, download_name="assigned.xlsx")


if __name__ == "__main__":
    app.run(debug=True)