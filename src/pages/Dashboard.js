// src/pages/Dashboard.jsx
import React, { useState } from "react";
import UserManagement from "./UserManagement";
import "./dashboard.css"; // adjust path
import ModuleButtons from "./components/ModuleButtons";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState("Dashboard");

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
              <h2 className="stats-value">3,245</h2>
            </div>

            <div className="stats-card">
              <p className="stats-title">Farmers</p>
              <h2 className="stats-value">687</h2>
            </div>
          </div>

          <div className="section-card">
            <h2 className="section-heading">Admin Dashboard</h2>
            <p className="section-info">Monitor activities and update success stories.</p>
          </div>
        </>
      )}

      {selectedModule === "User Mgmt" && <UserManagement />}
    </div>
  );
};

export default Dashboard;
