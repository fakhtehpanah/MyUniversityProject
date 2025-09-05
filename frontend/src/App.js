import './index.css';
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [allDays, setAllDays] = useState(false);
  const [showDays, setShowDays] = useState(false);
  const [days, setDays] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");

  const daysOfWeek = [
    { label: "شنبه", value: "1" },
    { label: "یکشنبه", value: "2" },
    { label: "دوشنبه", value: "3" },
    { label: "سه‌شنبه", value: "4" },
    { label: "چهارشنبه", value: "5" },
    { label: "پنجشنبه", value: "6" },
    { label: "جمعه", value: "7" },
  ];

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const toggleAllDays = () => {
    setAllDays(true);
    setShowDays(false);
    setDays(daysOfWeek.map(d => d.value)); // همه روزها انتخاب میشن
  };

  const toggleShowDays = () => {
    setShowDays(true);
    setAllDays(false);
    setDays([]); // روزهای تکی خالی میشن
  };

  const handleDayChange = (value) => {
    if (days.includes(value)) {
      setDays(days.filter(d => d !== value));
    } else {
      setDays([...days, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    days.forEach((day) => formData.append("days", day));

    const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    setDownloadUrl(url);
  };

  return (
    <div className="p-5 border my-10 mx-5 flex flex-col gap-y-5 items-center">
      <h2 className="text-xl p-3">📊 آپلود فایل اکسل و تخصیص اتاق</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className=' p-3' type="file" onChange={handleFileChange} required />

        {/* دو گزینه اصلی */}
        <div className="flex gap-4 mb-2">
          <label
            className={`p-4 rounded cursor-pointer ${allDays ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={toggleAllDays}
          >
            <input type="checkbox" checked={allDays} readOnly className="mr-2" />
            همه روزهای هفته
          </label>

          <label
            className={`p-4 rounded cursor-pointer ${showDays ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={toggleShowDays}
          >
            <input type="checkbox" checked={showDays} readOnly className="mr-2" />
            روزهای هفته
          </label>
        </div>

        {/* روزهای تک وقتی showDays true باشه */}
        {showDays && (
          <div className="flex gap-2 flex-wrap">
            {daysOfWeek.map(day => (
              <label
                key={day.value}
                className={`px-4 py-2 rounded cursor-pointer ${
                  days.includes(day.value) ? "bg-yellow-200 text-black" : "bg-gray-200"
                }`}
              >
                <input
                  type="checkbox"
                  value={day.value}
                  checked={days.includes(day.value)}
                  onChange={() => handleDayChange(day.value)}
                  className="mr-2"
                />
                {day.label}
              </label>
            ))}
          </div>
        )}

        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          🚀 اجرا
        </button>
      </form>

      {downloadUrl && (
        <a href={downloadUrl} download="result.xlsx" className="my-4 inline-block text-blue-600 underline">
          📥 دانلود خروجی
        </a>
      )}
    </div>
  );
}

export default App;