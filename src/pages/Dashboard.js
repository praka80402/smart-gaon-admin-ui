import React, { useState, useEffect } from "react";
import "./dashboard.css";

import ModuleButtons from "./components/ModuleButtons";
import UserManagement from "./UserManagement";
import GaonConnect from "./gaonconnect/GaonConnect";
import DonationAdmin from "./donation/DonationAdmin";
import TodayTipsList from "./today-tips/TodayTipsList";
import HomeLayoutAdmin from "./home-layout/HomeLayoutAdmin";

import Modal from "../components/Modal";
import { getUserCount } from "./userService";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState("Dashboard");

  // Modals
  const [openTipsModal, setOpenTipsModal] = useState(false);
  const [openHomeLayoutModal, setOpenHomeLayoutModal] = useState(false);

  // Stats
  const [totalUsers, setTotalUsers] = useState(0);

  const modules = [
    { name: "Dashboard", icon: "🏠" },
    { name: "User Mgmt", icon: "👥" },
    { name: "Shiksha Sahayak", icon: "📘" },
    { name: "Gaon Connect", icon: "🚜" },
    { name: "Seva Bazar", icon: "🛍️" },
    { name: "Weather", icon: "🌞" },
    { name: "Donation", icon: "💰" },
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
            {/* TOTAL USERS */}
            <div className="stats-card">
              <p className="stats-title">Total Users</p>
              <h2 className="stats-value">{totalUsers}</h2>
            </div>

            {/* TODAY TIPS */}
            <div
              className="stats-card"
              onClick={() => setOpenTipsModal(true)}
              style={{ cursor: "pointer" }}
            >
              <h2 className="today-tips-value">Today Tips</h2>
            </div>

            {/* HOME LAYOUT */}
            <div
              className="stats-card"
              onClick={() => setOpenHomeLayoutModal(true)}
              style={{ cursor: "pointer" }}
            >
              <h2 className="today-tips-value">Home Layout</h2>
            </div>
          </div>

          {/* TODAY TIPS MODAL */}
          <Modal open={openTipsModal} onClose={() => setOpenTipsModal(false)}>
            <TodayTipsList onClose={() => setOpenTipsModal(false)} />
          </Modal>

          {/* HOME LAYOUT MODAL */}
          <Modal
            open={openHomeLayoutModal}
            className="home-layout-modal"
            onClose={() => setOpenHomeLayoutModal(false)}
          >
            <HomeLayoutAdmin />
          </Modal>

          {/* DASHBOARD INFO */}
          <div className="section-card">
            <h2 className="section-heading">Admin Dashboard</h2>
            <p className="section-info">
              Monitor activities and manage mobile app content dynamically.
            </p>
          </div>
        </>
      )}

      {/* ================= OTHER MODULES ================= */}
      {selectedModule === "User Mgmt" && <UserManagement />}
      {selectedModule === "Gaon Connect" && <GaonConnect />}
      {selectedModule === "Donation" && <DonationAdmin />}
    </div>
  );
};

export default Dashboard;
