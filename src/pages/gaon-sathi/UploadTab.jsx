import React, { useState, useRef } from "react";
import { uploadQAExcel } from "./QAApi";

function UploadTab() {

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadExcel = async () => {

    if (!file) {
      alert("Please select file");
      return;
    }

    setLoading(true);

    try {
      const res = await uploadQAExcel(file);
      alert(res);

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) {
      alert("Upload failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: "20px" }}>

      <h4 style={{ marginBottom: "15px" }}>Upload Excel</h4>

      <input
        ref={fileInputRef}
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
        disabled={loading}
        style={{
          padding: "8px 15px",
          background: loading ? "#ccc" : "#2e7d32",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          borderRadius: "4px"
        }}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {loading && (
        <div
          style={{
            marginTop: "15px",
            color: "#1976d2",
            fontWeight: "bold",
            textAlign: "center"
          }}
        >
          Uploading file, please wait...
        </div>
      )}

    </div>
  );
}

export default UploadTab;