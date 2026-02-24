// // src/pages/communityNews/CommunityNewsWrapper.jsx
// import React, { useState } from "react";
// import CreateNews from "./tabs/CreateNews";
// import CreateEvent from "./tabs/CreateEvent";
// import ViewNews from "./tabs/ViewNews";
// import ViewEvents from "./tabs/ViewEvents";
// import "./communityNews.css";

// export default function CommunityNewsWrapper() {
//   const [tab, setTab] = useState("createNews");

//   return (
//     <div className="cn-wrapper">
//       {/* TOP TABS */}
//       <div className="cn-tabs">
//         <button className={tab === "createNews" ? "active" : ""} onClick={() => setTab("createNews")}>
//           Create News
//         </button>

//         {/* <button className={tab === "createEvent" ? "active" : ""} onClick={() => setTab("createEvent")}>
//           Create Event
//         </button> */}

//         <button className={tab === "viewNews" ? "active" : ""} onClick={() => setTab("viewNews")}>
//           View News
//         </button>

//         <button className={tab === "viewEvents" ? "active" : ""} onClick={() => setTab("viewEvents")}>
//           View Events
//         </button>
//       </div>

//       {/* TAB CONTENT */}
//       {tab === "createNews" && <CreateNews />}
//       {tab === "createEvent" && <CreateEvent />}
//       {tab === "viewNews" && <ViewNews />}
//       {tab === "viewEvents" && <ViewEvents />}
//     </div>
//   );
// }


// src/pages/communityNews/CommunityNewsWrapper.jsx
import React, { useState, useEffect } from "react";
import CreateNews from "./tabs/CreateNews";
import CreateEvent from "./tabs/CreateEvent";
import ViewNews from "./tabs/ViewNews";
import ViewEvents from "./tabs/ViewEvents";
import "./communityNews.css";

export default function CommunityNewsWrapper() {

  const role = localStorage.getItem("adminRole");

  const canCreate =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [tab, setTab] = useState(
    canCreate ? "createNews" : "viewNews"
  );

  // If role changes or unauthorized tab selected
  useEffect(() => {
    if (!canCreate && tab === "createNews") {
      setTab("viewNews");
    }
  }, [canCreate, tab]);

  return (
    <div className="cn-wrapper">

      {/* TOP TABS */}
      <div className="cn-tabs">

        {canCreate && (
          <button
            className={tab === "createNews" ? "active" : ""}
            onClick={() => setTab("createNews")}
          >
            Create News
          </button>
        )}

        <button
          className={tab === "viewNews" ? "active" : ""}
          onClick={() => setTab("viewNews")}
        >
          View News
        </button>

        <button
          className={tab === "viewEvents" ? "active" : ""}
          onClick={() => setTab("viewEvents")}
        >
          View Events
        </button>

      </div>

      {/* TAB CONTENT */}
      {canCreate && tab === "createNews" && <CreateNews />}
      {tab === "viewNews" && <ViewNews />}
      {tab === "viewEvents" && <ViewEvents />}

    </div>
  );
}