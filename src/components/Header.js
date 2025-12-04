import React from "react";
import "./header.css";

const Header = ({ onLogout }) => {
  return (
    <header className="header-bar">

      {/* Left Section */}
      <div className="header-left">
        <div className="logo-box"></div>
        <div>
          <div className="header-title">SmartGaon AI</div>
          <div className="header-subtitle">Admin Portal</div>
        </div>
      </div>

      {/* Right Section */}
      <div className="header-right">
        <div className="user-tag">
          Village Admin · Rajesh Kumar · Rampur Panchayat
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

    </header>
  );
};

export default Header;
