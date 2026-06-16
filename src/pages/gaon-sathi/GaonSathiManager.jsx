import React, { useState } from "react";
import GaonSathiGallery from "./gaonsathiAvatar";
import GaonSathiQA from "./GaonSathiQA";
import NavigationTab from "./NavigationTab";
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

        <button
          className={activeTab === "navigation" ? "active" : ""}
          onClick={() => setActiveTab("navigation")}
        >
          Navigation
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "gallery" && <GaonSathiGallery />}
        {activeTab === "qa" && <GaonSathiQA />}
        {activeTab === "navigation" && <NavigationTab />}
      </div>

    </div>
  );
}

export default GaonSathiManager;
