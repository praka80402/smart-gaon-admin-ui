import React, { useState, useEffect } from "react";
import "./dashboard.css";

import ModuleButtons from "./components/ModuleButtons";
import UserManagement from "./UserManagement";
import GaonConnect from "./gaonconnect/GaonConnect";
import DonationAdmin from "./donation/DonationAdmin";
import TodayTipsList from "./today-tips/TodayTipsList";
import HomeLayoutAdmin from "./home-layout/HomeLayoutAdmin";
import BannerAdmin from "./banners/bannerAdmin";
import SchemeAdmin from "./scheme/schemeAdmin";
import NcertMain from "./shikshasahayak/Shikshsahayak";

import Modal from "../components/Modal";
import { getUserCount } from "./userService";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState("Dashboard");

  // Modals
  const [activeModal, setActiveModal] = useState(null);

  // Stats
  const [totalUsers, setTotalUsers] = useState(0);

  const modules = [
    { name: "Dashboard", icon: "🏠" },
    { name: "User Mgmt", icon: "👥" },
    { name: "Shiksha Sahayak", icon: "📘" },
    { name: "Gaon Connect", icon: "🚜" },
    { name: "Donation", icon: "💰" },
    { name: "Seva Bazar", icon: "🛍️" },
    { name: "Gaon Saathi", icon: "🎙️" },
  ];

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
      {/* LEFT MODULE BUTTONS */}
      <ModuleButtons
        modules={modules}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
      />

      {/* ================= DASHBOARD ================= */}
      {selectedModule === "Dashboard" && (
        <>
          <div className="stats-wrapper">
            <div className="stats-grid">
              <div className={`stats-card color-${1}`}>
                <p className="stats-title">Total Users</p>
                <h2 className="stats-value">{totalUsers}</h2>
              </div>

              <div
                className="stats-card"
                onClick={() => setActiveModal("TIPS")}
              >
                <h2 className="stats-click">Today Tips</h2>
              </div>

              <div
                 className={`stats-card color-${2}`}
                onClick={() => setActiveModal("SCHEME")}
              >
                <h2 className="stats-click">Schemes</h2>
              </div>

              <div
                className={`stats-card color-${3}`}
                onClick={() => setActiveModal("BANNER")}
              >
                <h2 className="stats-click">Banners</h2>
              </div>

              <div
                className={`stats-card color-${4}`}
                onClick={() => setActiveModal("HOME")}
              >
                <h2 className="stats-click">Home Layout</h2>
              </div>

              <div  className={`stats-card color-${5}`}>
                <h2 className="stats-click">More</h2>
              </div>
            </div>
          </div>

          {/* ================= MODALS ================= */}
          <Modal  className="home-layout-modal" open={activeModal === "TIPS"} onClose={closeModal}>
            <TodayTipsList onClose={closeModal} />
          </Modal>

          <Modal  className="home-layout-modal" open={activeModal === "SCHEME"} onClose={closeModal}>
            <SchemeAdmin />
          </Modal>

          <Modal open={activeModal === "BANNER"} onClose={closeModal}>
            <BannerAdmin />
          </Modal>

          <Modal
            open={activeModal === "HOME"}
            onClose={closeModal}
            className="home-layout-modal"
          >
            <HomeLayoutAdmin />
          </Modal>
        </>
      )}

      {/* ================= OTHER MODULES ================= */}
      {selectedModule === "User Mgmt" && <UserManagement />}
      {selectedModule === "Gaon Connect" && <GaonConnect />}
      {selectedModule === "Donation" && <DonationAdmin />}
      {selectedModule === "Shiksha Sahayak" && <NcertMain />}
    </div>
  );
};

export default Dashboard;
