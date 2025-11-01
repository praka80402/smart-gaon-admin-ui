import React from "react";

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
      <h2>Admin Panel</h2>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={activePage === item.key ? "active" : ""}
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
