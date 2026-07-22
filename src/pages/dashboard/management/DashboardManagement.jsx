import { NavLink, Outlet } from "react-router-dom";
import "./dashboardManagement.css";

export default function DashboardManagement() {

  return (

    <div className="dashboard-management-wrapper">

      <div className="dashboard-management-header">

        <div className="dashboard-management-left">
          <h2 className="dashboard-management-title">
            Dashboard Management
          </h2>
        </div>

        <div className="dashboard-management-right">

          <div className="dashboard-tabs">

            {/* BANNER */}
            <NavLink
              to="banner"
              className={({ isActive }) =>
                isActive
                  ? "dashboard-tab active-dashboard-tab"
                  : "dashboard-tab"
              }
            >
              <div className="dashboard-tab-icon">🖼️</div>

              <div className="dashboard-tab-content">
                <h3>Banner</h3>
                <p>Manage Landing & Home Banners</p>
              </div>

              <div className="dashboard-tab-admin">
                LIVE
              </div>
            </NavLink>

            {/* EVENT */}
            <NavLink
              to="event"
              className={({ isActive }) =>
                isActive
                  ? "dashboard-tab active-dashboard-tab"
                  : "dashboard-tab"
              }
            >
              <div className="dashboard-tab-icon">📅</div>

              <div className="dashboard-tab-content">
                <h3>Event</h3>
                <p>Manage Landing & Home Events</p>
              </div>

              <div className="dashboard-tab-admin">
                LIVE
              </div>
            </NavLink>

            {/* IMPACT */}
            <NavLink
              to="impact"
              className={({ isActive }) =>
                isActive
                  ? "dashboard-tab active-dashboard-tab"
                  : "dashboard-tab"
              }
            >
              <div className="dashboard-tab-icon">🏅</div>

              <div className="dashboard-tab-content">
                <h3>SmartGaon Impact</h3>
                <p>Manage contests</p>
              </div>

              <div className="dashboard-tab-badge">
                LIVE
              </div>
            </NavLink>

            {/* INSIGHT */}
            <NavLink
              to="insight"
              className={({ isActive }) =>
                isActive
                  ? "dashboard-tab active-dashboard-tab"
                  : "dashboard-tab"
              }
            >
              <div className="dashboard-tab-icon">📊</div>

              <div className="dashboard-tab-content">
                <h3>SmartGaon Insight</h3>
                <p>Track Counts & Engagement</p>
              </div>

              <div className="dashboard-tab-admin">
                LIVE
              </div>
            </NavLink>

          </div>

        </div>

      </div>

      <div className="dashboard-management-card">
        <Outlet />
      </div>

    </div>

  );

}