import React, { useState } from "react";
import CreateCampaign from "./CreateCampaign";
import ProjectList from "./DonationProject";
import ProgramList from "./DonationProgram";

import "./donation.css";
import YearlyReportTabs from "./YearlyReportTabs";

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

        <button
          className={activeTab === "programs" ? "active" : ""}
          onClick={() => setActiveTab("programs")}
        >
          View Program
        </button>

        {/* ⭐ NEW REPORT TAB */}
        <button
          className={activeTab === "report" ? "active" : ""}
          onClick={() => setActiveTab("report")}
        >
          Yearly Report
        </button>

      </div>

      {activeTab === "create" && <CreateCampaign />}
      {activeTab === "projects" && <ProjectList />}
      {activeTab === "programs" && <ProgramList />}
      {activeTab === "report" && <YearlyReportTabs />}

    </div>
  );
};

export default DonationAdmin;
