import React from "react";

function KPI({ total }) {
  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
      <div style={{ padding: "20px", background: "#007bff", color: "white" }}>
        <h3>Total Revenue</h3>
        <h2>₹ {total}</h2>
      </div>
    </div>
  );
}

export default KPI;




