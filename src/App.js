
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/dashboard/pages/Dashboard";
import GaonConnect from "./pages/gaonconnect/GaonConnect";
import Login from "./pages/auth/Login";
import Loader from "./Loader";
import ImpactPage from "./pages/dashboard/management/impact/ImpactPage";
import InsightsPage from "./pages/dashboard/management/insights/InsightsPage";
import DashboardManagement from "./pages/dashboard/management/DashboardManagement";
import KnowledgeBank from "./pages/kno-bank/KnowledgeBank";


// ✅ ADD THESE IMPORTS
import UserManagement from "./pages/UserManagement";
import DonationAdmin from "./pages/donation/DonationAdmin";
import NcertMain from "./pages/shikshasahayak/Shikshsahayak";
import SevaBazarAdmin from "./pages/sevabazar/SevaBazarAdmin";
import GaonSathiManager from "./pages/gaon-sathi/GaonSathiManager";
import MediaPressAdminPage from "./pages/media_press/media_press";

import BannerManagement from "./pages/dashboard/management/banner/BannerManagement";
import EventManagement from "./pages/dashboard/management/event/EventManagement";

import "./App.css";
import ProfilePage from "./components/profilepage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isAdminLoggedIn") === "true"
  );

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    localStorage.setItem("isAdminLoggedIn", "true");
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Loader />

      {/* Header only when logged in */}
      {isLoggedIn && <Header onLogout={handleLogout} />}

      <main className={isLoggedIn ? "content-area" : ""}>
        <Routes>

          {/* DEFAULT ROUTE */}
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? <Dashboard /> : <Navigate to="/login" />
            }
          />

          {/* USER MANAGEMENT */}
          <Route
            path="/users"
            element={
              isLoggedIn ? <UserManagement /> : <Navigate to="/login" />
            }
          />

          {/* GAON CONNECT */}
          <Route
            path="/gaon-connect"
            element={
              isLoggedIn ? <GaonConnect /> : <Navigate to="/login" />
            }
          />

          {/* DONATION */}
          <Route
            path="/donation"
            element={
              isLoggedIn ? <DonationAdmin /> : <Navigate to="/login" />
            }
          />

          {/* SHIKSHA SAHAYAK */}
          <Route
            path="/shiksha"
            element={
              isLoggedIn ? <NcertMain /> : <Navigate to="/login" />
            }
          />

          {/* SEVA BAZAR */}
          <Route
            path="/seva-bazar"
            element={
              isLoggedIn ? <SevaBazarAdmin /> : <Navigate to="/login" />
            }
          />

          {/* GAON SAATHI */}
          <Route
            path="/gaon-saathi"
            element={
              isLoggedIn ? <GaonSathiManager /> : <Navigate to="/login" />
            }
          />

          {/* MEDIA & PRESS */}
          <Route
            path="/media_press"
            element={
              isLoggedIn ? <MediaPressAdminPage /> : <Navigate to="/login" />
            }
          />
          <Route path="/admin" element={<Dashboard />} />
 <Route 
 path="/admin/KnowledgeBank" 
 element={isLoggedIn ? <KnowledgeBank /> : <Navigate to="/login"/>} 
 />


<Route
  path="/profilepage"
  element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
/>

<Route
  path="/dashboard/management"
  element={isLoggedIn ? <DashboardManagement /> : <Navigate to="/login" />}
>
  <Route index element={<Navigate to="banner" />} />

  <Route path="banner" element={<BannerManagement />} />

  <Route path="event" element={<EventManagement />} />

  <Route path="impact" element={<ImpactPage />} />

  <Route path="insight" element={<InsightsPage />} />

</Route>

        </Routes>
      </main>
    </Router>
  );
}

export default App;
