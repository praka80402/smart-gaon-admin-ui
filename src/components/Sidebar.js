import React from "react";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "User Management" },
  { key: "users", label: "Sarkari Seva" },
  { key: "users", label: "Shiksha Sahayak" },
  { key: "users", label: "Kisan Mitra" },
  { key: "users", label: "Seva Bazar" },
  { key: "users", label: "Gaon Bazar" },
  { key: "users", label: "Weather Report" },
  { key: "users", label: "Donation" },
  { key: "users", label: "Gram Doctor" },
  { key: "users", label: "My Village (AI)" },
];

const Sidebar = ({ activePage, onSelect }) => (
  <div className="sidebar">
    <h2>Admin Panel</h2>
    <ul>
      {menuItems.map((item) => (
        <li
          key={item.key}
          className={activePage === item.key ? "active" : ""}
          onClick={() => (item.key)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  </div>
);

export default Sidebar;
