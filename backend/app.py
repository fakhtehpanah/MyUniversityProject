from flask import Flask, request, send_file
from flask_cors import CORS
import pandas as pd
import os
from assignment import assign_rooms

app = Flask(__name__)
CORS(app)  # اجازه میده React بتونه به Flask وصل بشه

@app.route("/upload", methods=["POST"])
def assign():
    try:
        file = request.files["file"]
        selected_days = request.form.getlist("days", type=int)

        input_path = "input.xlsx"
        output_path = "output.xlsx"

        file.save(input_path)

        assign_rooms(input_path, selected_days, output_path)

        return send_file(output_path, as_attachment=True)
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)