import { NavLink, Outlet } from "react-router-dom";
import "./dashboardManagement.css";

export default function DashboardManagement() {

  return (

    <div className="dashboard-management-wrapper">

      {/* HEADER */}
      <div className="dashboard-management-header">

        {/* TITLE */}
        <div className="dashboard-management-left">

          <h2 className="dashboard-management-title">
            Dashboard Management
          </h2>

        </div>

        {/* TABS */}
        <div className="dashboard-management-right">

          <div className="dashboard-tabs">

            {/* COMPETITION TAB */}
            <NavLink
              to="competition"
              className={({ isActive }) =>
                isActive
                  ? "dashboard-tab active-dashboard-tab"
                  : "dashboard-tab"
              }
            >

              {/* ICON */}
              <div className="dashboard-tab-icon">
                🏅
              </div>

              {/* CONTENT */}
              <div className="dashboard-tab-content">

                <h3>
                  SmartGaon Impact
                </h3>

                <p>
                  Manage contests
                </p>

              </div>

              {/* BADGE */}
              <div className="dashboard-tab-badge">
                LIVE
              </div>

            </NavLink>

            {/* ENGAGEMENT TAB */}
            <NavLink
              to="engagement"
              className={({ isActive }) =>
                isActive
                  ? "dashboard-tab active-dashboard-tab"
                  : "dashboard-tab"
              }
            >

              {/* ICON */}
              <div className="dashboard-tab-icon">
                🤝
              </div>

              {/* CONTENT */}
              <div className="dashboard-tab-content">

                <h3>
                  SmartGaon Insights
                </h3>

                <p>
                  Track Counts & Engagement
                </p>

              </div>

              {/* ADMIN */}
              <div className="dashboard-tab-admin">
                LIVE
              </div>

            </NavLink>

          </div>

        </div>

      </div>

      {/* CONTENT */}
      <div className="dashboard-management-card">

        <Outlet />

      </div>

    </div>

  );

}