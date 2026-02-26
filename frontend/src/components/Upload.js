import React, { useState } from "react";
import axios from "axios";

function Upload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/upload", formData);
      alert("File uploaded successfully");
    } catch (error) {
      console.log(error);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Upload CSV File</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
        Upload
      </button>
    </div>
  );
}

export default Upload;
