// import React, { useState } from "react";
// import JobAdmin from "./Jobs/JobAdmin";

// import "./sevaBazarAdmin.css";
// import BusinessAdmin from "./business/BusinessAdmin";

// const SevaBazarAdmin = () => {

//   const [activeTab, setActiveTab] = useState("jobs");

//   return (

//     <div className="seva-container">

//       <h2>Seva Bazar Management</h2>

//       {/* Tabs */}
//       <div className="seva-tabs">

//         <button
//           className={activeTab === "jobs" ? "active-tab" : "tab"}
//           onClick={() => setActiveTab("jobs")}
//         >
//           Jobs
//         </button>

//         <button
//           className={activeTab === "business" ? "active-tab" : "tab"}
//           onClick={() => setActiveTab("business")}
//         >
//           Business
//         </button>

//       </div>

//       {/* JOBS TAB */}
//       {activeTab === "jobs" && (
//         <JobAdmin />
//       )}

//       {/* BUSINESS TAB */}
//       {activeTab === "business" && (
//         <BusinessAdmin/>
       
//       )}

//     </div>
//   );
// };

// export default SevaBazarAdmin;


import React, { useState } from "react";
import JobAdmin from "./Jobs/JobAdmin";
import BusinessAdmin from "./business/BusinessAdmin";

import CreateJob from "./GovtPrivateJobs/CreateJob";
import GovtJobsList from "./GovtPrivateJobs/GovtJobsList";
import PrivateJobsList from "./GovtPrivateJobs/PrivateJobsList";

import "./sevaBazarAdmin.css";

const SevaBazarAdmin = () => {

  const [activeTab, setActiveTab] = useState("jobs");

  // Govt/Private sub tabs
  const [gpTab, setGpTab] = useState("create");

  return (
    <div className="seva-container">

      <h2>Seva Bazar Management</h2>

      {/* MAIN TABS */}
      <div className="seva-tabs">

        <button
          className={activeTab === "jobs" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("jobs")}
        >
          Jobs
        </button>

        <button
          className={activeTab === "gpjobs" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("gpjobs")}
        >
          Govt/Private Jobs
        </button>

        <button
          className={activeTab === "business" ? "active-tab" : "tab"}
          onClick={() => setActiveTab("business")}
        >
          Business
        </button>

      </div>

      {/* ================= JOBS (OLD - NO CHANGE) ================= */}
      {activeTab === "jobs" && <JobAdmin />}

      {/* ================= NEW GOVT/PRIVATE SECTION ================= */}
      {activeTab === "gpjobs" && (
        <div>

          {/* SUB TABS */}
          <div className="seva-tabs">

            <button
              className={gpTab === "create" ? "active-tab" : "tab"}
              onClick={() => setGpTab("create")}
            >
              Create Job
            </button>

            <button
              className={gpTab === "govt" ? "active-tab" : "tab"}
              onClick={() => setGpTab("govt")}
            >
              Govt Jobs
            </button>

            <button
              className={gpTab === "private" ? "active-tab" : "tab"}
              onClick={() => setGpTab("private")}
            >
              Private Jobs
            </button>

          </div>

          {/* SCREENS */}
          {gpTab === "create" && <CreateJob />}
          {gpTab === "govt" && <GovtJobsList />}
          {gpTab === "private" && <PrivateJobsList />}

        </div>
      )}

      {/* ================= BUSINESS ================= */}
      {activeTab === "business" && <BusinessAdmin />}

    </div>
  );
};

export default SevaBazarAdmin;
