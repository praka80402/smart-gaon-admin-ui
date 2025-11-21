import React from "react";
import "./header.css";
import logo from "../logo.svg";


const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "User Management" },
  { key: "schemes", label: "Sarkari Seva" },
  { key: "education", label: "Shiksha Sahayak" },
  { key: "farming", label: "Kisan Mitra" },
  { key: "jobs", label: "Seva Bazar" },
  { key: "market", label: "Gaon Bazar" },
  { key: "weather", label: "Weather Report" },
  { key: "donation", label: "Donation" },
  { key: "doctor", label: "Gram Doctor" },
  { key: "voice", label: "My Village (AI)" },
];

const Sidebar = ({ activePage, onSelect }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img 
         src={logo}
          alt="SmartGaon Logo"
        />
        SmartGaon Admin
     
      </div>

      <ul className="menu-list">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`menu-item ${activePage === item.key ? "active" : ""}`}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
