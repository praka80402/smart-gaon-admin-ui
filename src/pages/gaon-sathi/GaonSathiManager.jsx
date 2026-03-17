import React, { useState } from "react";
import GaonSathiGallery from "./gaonsathiAvatar";
import GaonSathiQA from "./GaonSathiQA";
import "./gaonsathi.css";
function GaonSathiManager() {

  const [activeTab, setActiveTab] = useState("gallery");

  return (
    <div className="gaon-container">

      <div className="tabs">
        <button
          className={activeTab === "gallery" ? "active" : ""}
          onClick={() => setActiveTab("gallery")}
        >
          Avatar Gallery
        </button>

        <button
          className={activeTab === "qa" ? "active" : ""}
          onClick={() => setActiveTab("qa")}
        >
          Question & Answer Upload
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "gallery" && <GaonSathiGallery />}
        {activeTab === "qa" && <GaonSathiQA />}
      </div>

    </div>
  );
}

export default GaonSathiManager;