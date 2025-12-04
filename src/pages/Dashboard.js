import React, { useState } from "react";
import "./dashboard.css";

const Dashboard = () => {
  const [storyTitle, setStoryTitle] = useState("");
  const [village, setVillage] = useState("Rampur");
  const [stateName, setStateName] = useState("Bihar");
  const [description, setDescription] = useState("");

  return (
    <div className="dash-container">

      {/* Navigation Tiles */}
      <div className="tile-row">
        {[
          { label: "Dashboard", emoji: "🏠", active: true },
          { label: "User Mgmt", emoji: "👥" },
          { label: "Shiksha Sahayak", emoji: "📚" },
          { label: "Gaon Connect", emoji: "🚜" },
          { label: "Seva Bazar", emoji: "🧑‍🌾" },
          { label: "Weather", emoji: "☀️" },
          { label: "Donation", emoji: "💰" },
          { label: "Gaon Saathi", emoji: "🎙️" },
        ].map((item, i) => (
          <div
            key={i}
            className={`nav-tile ${item.active ? "active" : ""}`}
          >
            <span className="emoji">{item.emoji}</span> {item.label}
          </div>
        ))}
      </div>

      {/* Top Cards */}
      <div className="card-row">
        <div className="card wide">
          <p className="card-label">Total Users</p>
          <h1 className="card-number">3,245</h1>
          <p className="card-sub">Registered Users</p>
        </div>

        <div className="card">
          <p className="card-label">Farmers</p>
          <h1 className="card-number">687</h1>
          <p className="card-sub">Registered farmers</p>
        </div>
      </div>

      {/* Admin Info */}
      <div className="card full">
        <h3 className="section-title">Admin Dashboard</h3>
        <p className="section-desc">
          Monitor your panchayat’s activity and update success stories and impact numbers.
        </p>
      </div>

      {/* Success Stories */}
      <div className="card full">
        <h3 className="section-title">Update Success Stories</h3>

        <div className="form-row">
          <div>
            <label>Story Title</label>
            <input
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="e.g. Smart Classroom in Rampur"
            />
          </div>

          <div>
            <label>Village</label>
            <input
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </div>

          <div>
            <label>State</label>
            <input
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            />
          </div>
        </div>

        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the initiative and impact."
        ></textarea>

        <button className="save-btn">Save Story</button>
      </div>
    </div>
  );
};

export default Dashboard;
