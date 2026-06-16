import React, { useState } from "react";
import UploadTab from "./UploadTab";
import SearchTab from "./SearchTab";
import "./gaonsathi.css";

function GaonSathiQA() {
  const [activeSubTab, setActiveSubTab] = useState("upload");

  return (
    <div className="qa-container">
      <div className="qa-card">
        <h2 className="page-title">
          Q&A Management
        </h2>

        {/* Sub Tabs */}
        <div className="qa-tabs">
          <button
            className={
              activeSubTab === "upload"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSubTab("upload")
            }
          >
            Upload Questions
          </button>

          <button
            className={
              activeSubTab === "search"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSubTab("search")
            }
          >
            Get Answer
          </button>
        </div>

        <div className="qa-content">
          {activeSubTab === "upload" && (
            <UploadTab />
          )}

          {activeSubTab === "search" && (
            <SearchTab />
          )}
        </div>
      </div>
    </div>
  );
}

export default GaonSathiQA;