// src/pages/communityNews/CommunityNewsWrapper.jsx
import React, { useState } from "react";
import CreateNews from "./tabs/CreateNews";
import CreateEvent from "./tabs/CreateEvent";
import ViewNews from "./tabs/ViewNews";
import ViewEvents from "./tabs/ViewEvents";
import "./communityNews.css";

export default function CommunityNewsWrapper() {
  const [tab, setTab] = useState("createNews");

  return (
    <div className="cn-wrapper">
      {/* TOP TABS */}
      <div className="cn-tabs">
        <button className={tab === "createNews" ? "active" : ""} onClick={() => setTab("createNews")}>
          Create News
        </button>

        {/* <button className={tab === "createEvent" ? "active" : ""} onClick={() => setTab("createEvent")}>
          Create Event
        </button> */}

        <button className={tab === "viewNews" ? "active" : ""} onClick={() => setTab("viewNews")}>
          View News
        </button>

        <button className={tab === "viewEvents" ? "active" : ""} onClick={() => setTab("viewEvents")}>
          View Events
        </button>
      </div>

      {/* TAB CONTENT */}
      {tab === "createNews" && <CreateNews />}
      {tab === "createEvent" && <CreateEvent />}
      {tab === "viewNews" && <ViewNews />}
      {tab === "viewEvents" && <ViewEvents />}
    </div>
  );
}
