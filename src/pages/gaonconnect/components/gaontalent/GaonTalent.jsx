import React, { useState } from "react";
import Dashboard from "./Dashboard";
import Competitions from "./Competitions";
// import Participants from "./Participants";
import "./styles.css";
import Engagement from "./Engagement";
// import Winners from "./Winners";

export default function GaonTalent() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="gt-container">
      {/* TOP NAV */}
     

      {/* SUB NAV */}
      <div className="sub-nav">
        <span
          className={tab === "dashboard" ? "active-sub" : ""}
          onClick={() => setTab("dashboard")}
        >
          Dashboard
        </span>
        <span
          className={tab === "competitions" ? "active-sub" : ""}
          onClick={() => setTab("competitions")}
        >
          Competitions
        </span>
        {/* <span
          className={tab === "participants" ? "active-sub" : ""}
          onClick={() => setTab("participants")}
        >
          Participants
        </span> */}
        <span
  className={tab === "engagement" ? "active-sub" : ""}
  onClick={() => setTab("engagement")}
>
  Engagement
</span>
  {/* <span
  className={tab === "winners" ? "active-sub" : ""}
  onClick={() => setTab("winners")}
>
  Winners
</span> */}


      </div>

      {/* CONTENT */}
      <div className="content-box">
        {tab === "dashboard" && <Dashboard />}
        {tab === "competitions" && <Competitions />}
        {/* {tab === "participants" && <Participants />}
        {tab === "winners" && <Winners />} */}

        {tab === "engagement" && <Engagement />}
      </div>
    </div>
  );
}
