import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import Papa from "papaparse";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import KPI from "./components/KPI";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date("2025-01-01"));
  const [endDate, setEndDate] = useState(new Date("2025-12-31"));
  const exportPDF = () => {
    const input = document.getElementById("dashboard");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 100);
      pdf.save("dashboard.pdf");
    });
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "dashboard.xlsx");
  };

  const handleFile = (e) => {
    Papa.parse(e.target.files[0], {
      header: true,
      complete: (result) => {
        setData(result.data);
      },
    });
  };

  const filtered = data;

  const totalRevenue = filtered.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const chartData = {
    labels: filtered.map((item) => item.category),
    datasets: [
      {
        label: "Revenue",
        data: filtered.map((item) => item.value),
        backgroundColor: ["blue", "green", "orange", "red"],
      },
    ],
  };

  return (
    <div id="dashboard" style={{ width: "900px", margin: "auto", paddingTop: "40px" }}>

    
      <h2>Business Intelligence Dashboard</h2>

      <KPI total={totalRevenue} />

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label>Start Date</label>
          <DatePicker selected={startDate} onChange={setStartDate} />
        </div>

        <div>
          <label>End Date</label>
          <DatePicker selected={endDate} onChange={setEndDate} />
        </div>

        <div>
          <label>Upload CSV</label>
          <input type="file" accept=".csv" onChange={handleFile} />
        </div>
      </div>
      <div style={{ marginBottom: "20px" }}>
  <button onClick={exportPDF}>Export PDF</button>
  <button onClick={exportExcel} style={{ marginLeft: "10px" }}>
    Export Excel
  </button>
</div>


      <h3>Bar Chart</h3>
      <Bar data={chartData} />

      <h3>Pie Chart</h3>
      <Pie data={chartData} />
    </div>
  );
}

export default App;









