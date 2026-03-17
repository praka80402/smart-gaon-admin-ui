import { useState } from "react";
import "./gaonconnect.css";

import Forum from "./components/Forum";
import Directory from "./components/Directory";
import Suggestions from "./components/UserSuggestion/Suggestions";
import GaonTalent from "./components/gaontalent/GaonTalent";
import CommunityNewsWrapper from "./components/communityNews/CommunityNewsWrapper";
import MyVillage from "./components/my-village/MyVilage";
import AdminProblems from "./components/ReportProblem/Reportproblem";

const GaonConnect = () => {
  const [activePage, setActivePage] = useState("Community Wall");

  const tabs = [
    "Community Wall",
    "Forum",
    "GaonTalent",
    "Village Directory",
    "My Village",
    "Report Problem",
    "Suggestions"
    
  ];

  return (
    <div className="gc-container">
      

      <div className="gc-top-divider"></div>

      <div className="gc-subheader">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`gc-sub-item ${activePage === tab ? "active" : ""}`}
            onClick={() => setActivePage(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      {activePage === "Community Wall" && <CommunityNewsWrapper />}
      {/* {activePage === "Community Wall" && <NewsEvents />} */}
      {activePage === "Forum" && <Forum />}
      {activePage === "GaonTalent" && <GaonTalent />}
      {activePage === "Village Directory" && <Directory />}
      {activePage === "Suggestions" && <Suggestions />}
       {activePage === "My Village" && <MyVillage />}
       {activePage === "Report Problem" && <AdminProblems />}
    </div>
  );
};

export default GaonConnect;
