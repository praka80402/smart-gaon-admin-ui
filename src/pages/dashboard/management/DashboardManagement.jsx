import { NavLink, Outlet } from "react-router-dom";
import "./dashboardManagement.css";

export default function DashboardManagement() {
  return (
    <div className="management-wrapper">

      {/* HEADER */}
      <div className="management-header">

        {/* LEFT: Title */}
        <div className="management-left">
          <h2 className="management-title">
            Dashboard Management
          </h2>
        </div>

        {/* RIGHT: Tabs */}
        <div className="management-right">
          <div className="tabs">
            <NavLink
              to="impact"
              className={({ isActive }) =>
                isActive ? "tab active" : "tab"
              }
            >
              SmartGaon Impact
            </NavLink>

            <NavLink
              to="insights"
              className={({ isActive }) =>
                isActive ? "tab active" : "tab"
              }
            >
              SmartGaon Insights
            </NavLink>
          </div>
        </div>

      </div>

      {/* CONTENT CARD */}
      <div className="management-card">
        <Outlet />
      </div>

    </div>
  );
}