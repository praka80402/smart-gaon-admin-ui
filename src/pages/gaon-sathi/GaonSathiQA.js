import React, { useState } from "react";
import UploadTab from "./UploadTab";
import SearchTab from "./SearchTab";

function GaonSathiQA() {

  const [activeSubTab, setActiveSubTab] = useState("upload");

  return (
    <div style={{ marginTop: "20px" }}>

      <h3 style={{ marginBottom: "15px" }}>Q&A Management</h3>

      <div style={{ marginBottom: "15px" }}>
        <button
          style={{
            padding: "8px 15px",
            marginRight: "10px",
            border: "none",
            background: activeSubTab === "upload" ? "#2e7d32" : "#ddd",
            color: activeSubTab === "upload" ? "white" : "black",
            cursor: "pointer"
          }}
          onClick={() => setActiveSubTab("upload")}
        >
          Upload Questions
        </button>

        <button
          style={{
            padding: "8px 15px",
            border: "none",
            background: activeSubTab === "search" ? "#2e7d32" : "#ddd",
            color: activeSubTab === "search" ? "white" : "black",
            cursor: "pointer"
          }}
          onClick={() => setActiveSubTab("search")}
        >
          Get Answer
        </button>
      </div>

      <hr />

      <div style={{ marginTop: "15px" }}>
        {activeSubTab === "upload" && <UploadTab />}
        {activeSubTab === "search" && <SearchTab />}
      </div>

    </div>
  );
}

export default GaonSathiQA;