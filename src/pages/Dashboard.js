import React from "react";
import DashboardCard from "../components/DashboardCard";

const Dashboard = () => {
  const stats = [
    { title: "Total Users", value: "1,245", desc: "Active village users" },
    { title: "Active Schemes", value: "12", desc: "Govt. schemes running" },
    { title: "Jobs Posted", value: "87", desc: "In Seva Bazar this month" },
    { title: "Products Listed", value: "234", desc: "In Gaon Bazar" },
    { title: "Donations Raised", value: "₹8.5L", desc: "This quarter" },
    { title: "Weather Alerts", value: "3", desc: "Active alerts sent" },
  ];

  return (
    <div className="panel">
      <h1 className="service-title">Dashboard Overview</h1>
      <div className="dashboard-grid">
        {stats.map((s, idx) => (
          <DashboardCard key={idx} {...s} />
        ))}
      </div>
      <h2>Recent Activities</h2>
      <ul>
        <li>New user registered: Ramesh Kumar (Village User)</li>
        <li>Scheme updated: PM Kisan Samman Nidhi</li>
        <li>Job posted: Plumber needed in Siswan</li>
        <li>Product sold: 5kg Wheat from Gaon Bazar</li>
      </ul>
    </div>
  );
};

export default Dashboard;
