// import React, { useState, useEffect } from "react";
// import "./dashboard.css";

// import TodayTipsList from "./today-tips/TodayTipsList";
// import HomeLayoutAdmin from "./home-layout/HomeLayoutAdmin";
// import BannerAdmin from "./banners/bannerAdmin";
// import SchemeAdmin from "./scheme/schemeAdmin";
// import { getUserCount } from "./userService";

// const Dashboard = () => {
//   const [activeSection, setActiveSection] = useState(null); // null = show dashboard cards
//   const [totalUsers, setTotalUsers] = useState(0);

//   useEffect(() => {
//     loadUserCount();
//   }, []);

//   const loadUserCount = async () => {
//     try {
//       const count = await getUserCount();
//       setTotalUsers(count);
//     } catch (error) {
//       console.error("Failed to fetch user count", error);
//     }
//   };

//   // ── If a section is active, render it full page with a Back button ──
//   if (activeSection) {
//     return (
//       <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
//         <button
//           onClick={() => setActiveSection(null)}
//           style={{
//             marginBottom: "16px",
//             padding: "8px 18px",
//             backgroundColor: "#1976d2",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: "pointer",
//             fontWeight: "600",
//             fontSize: "14px",
//             display: "flex",
//             alignItems: "center",
//             gap: "6px",
//           }}
//         >
//           ← 
//         </button>

// {activeSection === "TIPS" && (
//   <TodayTipsList onClose={() => setActiveSection(null)} />
// )}
//         {/* {activeSection === "TIPS"   && <TodayTipsList />} */}
//         {activeSection === "SCHEME" && <SchemeAdmin />}
//         {activeSection === "BANNER" && (
//   <BannerAdmin onClose={() => setActiveSection(null)} />
// )}
//         {/* {activeSection === "BANNER" && <BannerAdmin />} */}
//         {activeSection === "HOME" && (
//   <HomeLayoutAdmin onClose={() => setActiveSection(null)} />
// )}
//         {/* {activeSection === "HOME"   && <HomeLayoutAdmin />} */}
//       </div>
//     );
//   }

//   // ── Default: show dashboard cards ──
//   return (
//     <div className="dashboard-container">
//       <div className="dashboard-title">
//         <h1>Admin Dashboard</h1>
//       </div>

//       <div className="stats-wrapper">
//         <div className="stats-grid">

//           <div className="stats-card color-1">
//             <p className="stats-title">{totalUsers} <br /> Total Users</p>
//           </div>

//           <div className="stats-card" onClick={() => setActiveSection("TIPS")}>
//             <h2 className="stats-click">Today Tips</h2>
//           </div>

//           <div className="stats-card color-2" onClick={() => setActiveSection("SCHEME")}>
//             <h2 className="stats-click">Schemes</h2>
//           </div>

//           <div className="stats-card color-3" onClick={() => setActiveSection("BANNER")}>
//             <h2 className="stats-click">Banners</h2>
//           </div>

//           <div className="stats-card color-4" onClick={() => setActiveSection("HOME")}>
//             <h2 className="stats-click">Home Layout</h2>
//           </div>

//           <div className="stats-card color-5">
//             <h2 className="stats-click">More</h2>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from "react";
import "./dashboard.css";

import Modal from "../components/Modal";
import TodayTipsList from "./today-tips/TodayTipsList";
import HomeLayoutAdmin from "./home-layout/HomeLayoutAdmin";
import BannerAdmin from "./banners/bannerAdmin";
import SchemeAdmin from "./scheme/schemeAdmin";
import { getUserCount } from "./userService";

const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadUserCount();
  }, []);

  const loadUserCount = async () => {
    try {
      const count = await getUserCount();
      setTotalUsers(count);
    } catch (error) {
      console.error("Failed to fetch user count", error);
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="dashboard-container">

      <div className="dashboard-title">
        <h1>Admin Dashboard</h1>
      </div>

      {/* ── Cards ── */}
      <div className="stats-wrapper">
        <div className="stats-grid">

          <div className="stats-card color-1">
            <p className="stats-title">{totalUsers}<br />Total Users</p>
          </div>

          {/* ✅ Added color-2 — was missing before */}
          <div className="stats-card color-2" onClick={() => setActiveModal("TIPS")}>
            <h2 className="stats-click">Today Tips</h2>
          </div>

          <div className="stats-card color-3" onClick={() => setActiveModal("SCHEME")}>
            <h2 className="stats-click">Schemes</h2>
          </div>

          <div className="stats-card color-4" onClick={() => setActiveModal("BANNER")}>
            <h2 className="stats-click">Banners</h2>
          </div>

          <div className="stats-card color-5" onClick={() => setActiveModal("HOME")}>
            <h2 className="stats-click">Home Layout</h2>
          </div>

          <div className="stats-card color-6">
            <h2 className="stats-click">More</h2>
          </div>

        </div>
      </div>

      {/* ── Modals ── */}
      <Modal open={activeModal === "TIPS"} onClose={closeModal}>
        <TodayTipsList onClose={closeModal} />
      </Modal>

      <Modal open={activeModal === "SCHEME"} onClose={closeModal}>
        <SchemeAdmin onClose={closeModal} />
      </Modal>

      <Modal open={activeModal === "BANNER"} onClose={closeModal}>
        <BannerAdmin onClose={closeModal} />
      </Modal>

      <Modal open={activeModal === "HOME"} onClose={closeModal}>
        <HomeLayoutAdmin onClose={closeModal} />
      </Modal>

    </div>
  );
};

export default Dashboard;