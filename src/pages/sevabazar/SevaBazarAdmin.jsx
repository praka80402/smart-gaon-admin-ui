import React, { useState } from "react";
import JobAdmin from "./Jobs/JobAdmin";

import "./sevaBazarAdmin.css";
import BusinessAdmin from "./business/BusinessAdmin";

const SevaBazarAdmin = () => {

  const [activeTab, setActiveTab] = useState("jobs");

  return (

    <div className="seva-container">

      <h2>Seva Bazar Management</h2>

      {/* Tabs */}
      <div className="seva-tabs">

        <button
          className={activeTab === "jobs" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("jobs")}
        >
          Jobs
        </button>

        <button
          className={activeTab === "business" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("business")}
        >
          Business
        </button>

      </div>

      {/* JOBS TAB */}
      {activeTab === "jobs" && (
        <JobAdmin />
      )}

      {/* BUSINESS TAB */}
      {activeTab === "business" && (
        <BusinessAdmin/>
       
      )}

    </div>
  );
};

export default SevaBazarAdmin;
