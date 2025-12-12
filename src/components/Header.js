import React, { useEffect, useState } from "react";
import "./header.css";

const Header = ({ onLogout }) => {
  const [adminInfo, setAdminInfo] = useState({
    role: "",
    state: "",
    district: "",
  });

  useEffect(() => {
    // Read data saved during login
    const role = localStorage.getItem("adminRole");
    const state = localStorage.getItem("adminState");
    const district = localStorage.getItem("adminDistrict");

    setAdminInfo({ role, state, district });
  }, []);

  // -------------------------------------------
  // ROLE DISPLAY TEXT
  // -------------------------------------------
  const getRoleText = () => {
    if (adminInfo.role === "SUPER_ADMIN") {
      return "Super Admin";
    }

    if (adminInfo.role === "STATE_ADMIN") {
      return `${adminInfo.state} · State Admin`;
    }

    if (adminInfo.role === "DISTRICT_ADMIN") {
      return `${adminInfo.district}, ${adminInfo.state} · District Admin`;
    }

    return "";
  };

  return (
    <header className="header-bar">

      {/* LEFT SECTION */}
      <div className="header-left">
        <div className="logo-box"></div>

        <div>
          <div className="header-title">SmartGaon AI-Admin Portal</div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="header-right">

        {/* 🔥 Dynamic Role Display */}
        <div className="user-tag">{getRoleText()}</div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

    </header>
  );
};

export default Header;
