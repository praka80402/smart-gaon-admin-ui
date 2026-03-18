import React, { useState } from "react";
import { uploadQAExcel } from "./QAApi";

function UploadTab() {

  const [file, setFile] = useState(null);

  const uploadExcel = async () => {

    if (!file) {
      alert("Please select file");
      return;
    }

    try {
      const res = await uploadQAExcel(file);
      alert(res);
    } catch (err) {
      alert("Upload failed");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>

      <h4 style={{ marginBottom: "15px" }}>Upload Excel</h4>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginBottom: "15px"
        }}
      />

      <br />

      <button
        onClick={uploadExcel}
        style={{
          padding: "8px 15px",
          background: "#2e7d32",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "4px"
        }}
      >
        Upload
      </button>

    </div>
  );
}

export default UploadTab;