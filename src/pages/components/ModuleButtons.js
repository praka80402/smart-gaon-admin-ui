import React from "react";
import "./moduleButtons.css";

const ModuleButtons = ({ modules, selectedModule, setSelectedModule }) => {
  return (
    <div className="modules-wrapper">
      {modules.map((item, index) => (
        <div
          key={index}
          className={`module-card ${
            selectedModule === item.name ? "active" : ""
          }`}
          onClick={() => setSelectedModule(item.name)}
        >
          <div className="module-icon">{item.icon}</div>
          <p className="module-text">{item.name}</p>
        </div>
      ))}
    </div>
  );
};

export default ModuleButtons;
