
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./header.css";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [adminInfo, setAdminInfo] = useState({
    name: "",
    role: "",
    state: "",
    district: "",
  });

  const [showDropdown, setShowDropdown] = useState(false);

  

  useEffect(() => {
  const loadAdmin = () => {
    setAdminInfo({
      name: localStorage.getItem("adminName") || "",
      role: localStorage.getItem("adminRole") || "",
      state: localStorage.getItem("adminState") || "",
      district: localStorage.getItem("adminDistrict") || "",
    });
  };

  loadAdmin();
  window.addEventListener("storage", loadAdmin);

  return () => window.removeEventListener("storage", loadAdmin);
}, []);

const getInitial = () => {
  const name = (adminInfo.name || localStorage.getItem("adminEmail"))?.trim();
  if (!name) return "J";
  return name[0].toUpperCase();
};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleText = () => {
    if (adminInfo.role === "SUPER_ADMIN") return "Super Admin";
    if (adminInfo.role === "STATE_ADMIN")
      return `${adminInfo.state} State Admin`;
    if (adminInfo.role === "DISTRICT_ADMIN")
      return `${adminInfo.district}, ${adminInfo.state} District Admin`;
    if (adminInfo.role === "JUDGE") return "Judge";
    return "";
  };
 


 
  const allMenuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "User Management", path: "/users" },
  { name: "Shiksha Sahayak", path: "/shiksha" },
  { name: "Gaon Connect", path: "/gaon-connect" },
  { name: "Donation", path: "/donation" },
  { name: "Seva Bazar", path: "/seva-bazar" },
  { name: "Gaon Saathi", path: "/gaon-saathi" },
  { name: "Media & Press", path: "/media_press" },
];

const menuItems =
  adminInfo.role === "ACCOUNT_ADMIN"
    ? [{ name: "Donation", path: "/donation" }]
    : adminInfo.role === "JUDGE"
    ? [{ name: "School Competition", path: "/judge-portal" }]
    : allMenuItems;

  return (
    <header className="header-bar">

      {/* LEFT */}
      <div className="header-left">
        <div className="logo"></div>
        <div className="brand-text" onClick={() => navigate("/dashboard")}>
  <div className="brand-main">SmartGaon AI</div>
  <div className="brand-sub">Admin Portal</div>
</div>
      </div>

      {/* MENU */}
      <div className="header-menu">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`menu-item ${
              location.pathname.startsWith(item.path) ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </div>
        ))}
      </div>

      {/* PROFILE */}
      <div className="profile-container" ref={dropdownRef}>
        <div
          className="avatar"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {getInitial()}
        </div>

        {showDropdown && (
          <div className="dropdown">
  <div className="dropdown-name">{adminInfo.name}</div>
  <div className="dropdown-role">{getRoleText()}</div>

  <div className="dropdown-divider"></div>

  {/* <div
    className="dropdown-item"
    onClick={() => {
      window.location.href = "/profilepage";
    }}
  >
    Profile
  </div> */}

  <div
  className="dropdown-item"
  onClick={() => {
    navigate("/profilepage");
    setShowDropdown(false);
  }}
>
  Profile
</div>

  <div className="dropdown-item" onClick={onLogout}>
    Logout
  </div>
</div>
          // <div className="dropdown">
          //   <div className="dropdown-name">{adminInfo.name}</div>
          //   <div className="dropdown-role">{getRoleText()}</div>

          //   <div className="dropdown-divider"></div>
          //   <div className="dropdown-item" onClick={onLogout}>
          //     Logout
          //   </div>
   

          // </div>
        )}
      </div>
    </header>
  );
};

export default Header;