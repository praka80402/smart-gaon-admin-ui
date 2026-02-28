import { useState } from "react";
 import "./shiksha.css";


import AdminSuccessStory from "./successstory";
import NcertDashboard from "./Ncert/Dashboard";

const NcertMain = () => {

  const [activePage, setActivePage] = useState("Success Story");

  const tabs = [
    "Success Story",
    "NCERT Syllabus"
    
  ];

  return (
    <div className="ncert-container">

      <div className="ncert-top-divider"></div>

      {/* Tabs */}
      <div className="ncert-subheader">

        {tabs.map((tab) => (
          <div
            key={tab}
            className={`ncert-sub-item ${
               activePage === tab ? "ncert-active-tab" : ""
            }`}
            onClick={() => setActivePage(tab)}
          >
            {tab}
          </div>
        ))}

      </div>

      {/* Pages */}
      {activePage === "Success Story" && <AdminSuccessStory/>}

      {activePage === "NCERT Syllabus" && <NcertDashboard />}

    </div>
  );
};

export default NcertMain;
