import React, { useState } from "react";
import CreateProject from "./CreateProject";
import ProjectList from "./ProjectList";
import "./donation.css";

const DonationAdmin = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="donation-container">
      <h2 className="donation-title">Donation Management</h2>

      <div className="donation-tabs">
        <button
          className={activeTab === "create" ? "active" : ""}
          onClick={() => setActiveTab("create")}
        >
          Create Project
        </button>

        <button
          className={activeTab === "projects" ? "active" : ""}
          onClick={() => setActiveTab("projects")}
        >
          View Projects
        </button>
      </div>

      {activeTab === "create" && <CreateProject />}
      {activeTab === "projects" && <ProjectList />}
    </div>
  );
};

export default DonationAdmin;
