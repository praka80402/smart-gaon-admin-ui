// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import UserManagement from "./UserManagement";
import "./dashboard.css";
import ModuleButtons from "./components/ModuleButtons";
import GaonConnect from "./gaonconnect/GaonConnect";
import Modal from "../components/Modal";
import TodayTipsList from "./today-tips/TodayTipsList";
import { getUserCount } from "./userService";
import DonationAdmin from "./donation/DonationAdmin";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState("Dashboard");
  const [openTipsModal, setOpenTipsModal] = useState(false);

  // NEW: Real total user count
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

  // Load total users from backend
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
      <ModuleButtons
        modules={modules}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
      />

      {selectedModule === "Dashboard" && (
        <>
          <div className="stats-wrapper">
            <div className="stats-card">
              <p className="stats-title">Total Users</p>

              {/* 📌 Show Real User Count Here */}
              <h2 className="stats-value">{totalUsers}</h2>
            </div>

            {/* <div className="stats-card">
              <p className="stats-title">Farmers</p>
              <h2 className="stats-value">687</h2>
            </div> */}

            <div
              className="stats-card"
              onClick={() => setOpenTipsModal(true)}
              style={{ cursor: "pointer" }}
            >
              <h2 className="today-tips-value">Today Tips</h2>
            </div>

            {/* Today Tips Modal */}
            <Modal open={openTipsModal} onClose={() => setOpenTipsModal(false)}>
              <TodayTipsList onClose={() => setOpenTipsModal(false)} />
            </Modal>
          </div>

          <div className="section-card">
            <h2 className="section-heading">Admin Dashboard</h2>
            <p className="section-info">Monitor activities and update success stories.</p>
          </div>
        </>
      )}

      {selectedModule === "User Mgmt" && <UserManagement />}
      {selectedModule === "Gaon Connect" && <GaonConnect />}
      {selectedModule === "Donation" && <DonationAdmin />}

    </div>
  );
};

export default Dashboard;
