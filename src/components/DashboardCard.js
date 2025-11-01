import React from "react";

const DashboardCard = ({ title, value, desc }) => (
  <div className="dashboard-card">
    <h3>{title}</h3>
    <div className="number">{value}</div>
    <div className="desc">{desc}</div>
  </div>
);

export default DashboardCard;
