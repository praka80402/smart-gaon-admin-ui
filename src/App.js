import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/dashboard/pages/Dashboard";
import GaonConnect from "./pages/gaonconnect/GaonConnect";
import Login from "./pages/auth/Login";
import Loader from "./Loader";
import ImpactPage from "./pages/dashboard/management/impact/ImpactPage";
import InsightsPage from "./pages/dashboard/management/insights/InsightsPage";
import DashboardManagement from "./pages/dashboard/management/DashboardManagement";
import KnowledgeBank from "./pages/kno-bank/KnowledgeBank";
import VillageList from "./pages/myvillage/VillageList";
import CreateVillage from "./pages/myvillage/CreateVillage";
import DevelopmentCatalogue from "./pages/myvillage/DevelopmentCatalogue";
import UserManagement from "./pages/UserManagement";
import DonationAdmin from "./pages/donation/DonationAdmin";
import NcertMain from "./pages/shikshasahayak/Shikshsahayak";
import SevaBazarAdmin from "./pages/sevabazar/SevaBazarAdmin";
import GaonSathiManager from "./pages/gaon-sathi/GaonSathiManager";
import MediaPressAdminPage from "./pages/media_press/media_press";
import AdminQuickServices from "./pages/quick/AdminQuickServices";
import BannerManagement from "./pages/dashboard/management/banner/BannerManagement";
import EventManagement from "./pages/dashboard/management/event/EventManagement";
import GaonDoctorAdmin from "./pages/doctor/GaonDoctorAdmin";
import JudgePortal from "./pages/shikshasahayak/JudgePortal";
import AdminCompetitionManager from "./pages/shikshasahayak/AdminCompetitionManager";
import SchoolAdminEntries from "./pages/school-admin/SchoolAdminEntries";
import "./App.css";
import ProfilePage from "./components/profilepage";

// Restricts a SCHOOL_ADMIN to only their own entries page.
// Runs on every route change; redirects away from anything else.
function SchoolAdminGate() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("adminRole");
    const allowed = ["/school-admin/entries", "/login"];
    if (role === "SCHOOL_ADMIN" && !allowed.includes(location.pathname)) {
      navigate("/school-admin/entries", { replace: true });
    }
  }, [location, navigate]);

  return null;
}

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

  const isSchoolAdmin = localStorage.getItem("adminRole") === "SCHOOL_ADMIN";

  return (
    <Router>
      <Loader />
      <SchoolAdminGate />

      {/* Header only when logged in, and never for SCHOOL_ADMIN (no other pages to navigate to) */}
      {isLoggedIn && !isSchoolAdmin && <Header onLogout={handleLogout} />}

      <main className={isLoggedIn ? "content-area" : ""}>
        <Routes>

          {/* DEFAULT ROUTE */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                localStorage.getItem("adminRole") === "JUDGE" ? (
                  <Navigate to="/judge-portal" />
                ) : localStorage.getItem("adminRole") === "ACCOUNT_ADMIN" ? (
                  <Navigate to="/donation/DonationAdmin" />
                ) : localStorage.getItem("adminRole") === "SCHOOL_ADMIN" ? (
                  <Navigate to="/school-admin/entries" />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                localStorage.getItem("adminRole") === "JUDGE" ? (
                  <Navigate to="/judge-portal" />
                ) : localStorage.getItem("adminRole") === "ACCOUNT_ADMIN" ? (
                  <Navigate to="/donation/DonationAdmin" />
                ) : localStorage.getItem("adminRole") === "SCHOOL_ADMIN" ? (
                  <Navigate to="/school-admin/entries" />
                ) : (
                  <Navigate to="/dashboard" />
                )
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
  path="/dashboard/management"
  element={isLoggedIn ? <GaonDoctorAdmin /> : <Navigate to="/login" />}
/>
 <Route
  path="/dashboard/management"
  element={isLoggedIn ? <AdminQuickServices /> : <Navigate to="/login" />}
/>
<Route
  path="/profilepage"
  element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
/>
{/* SMART GAON — VILLAGES */}
<Route
  path="/admin/villages"
  element={isLoggedIn ? <VillageList /> : <Navigate to="/login" />}
/>

<Route
  path="/admin/villages/create"
  element={isLoggedIn ? <CreateVillage /> : <Navigate to="/login" />}
/>

<Route
  path="/admin/developments"
  element={isLoggedIn ? <DevelopmentCatalogue /> : <Navigate to="/login" />}
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
<Route
  path="/judge-portal"
  element={isLoggedIn ? <JudgePortal /> : <Navigate to="/login" />}
/>
<Route
  path="/admin/school-competition"
  element={isLoggedIn ? <AdminCompetitionManager /> : <Navigate to="/login" />}
/>

{/* SCHOOL ADMIN — restricted single page */}
<Route
  path="/school-admin/entries"
  element={
    isLoggedIn ? (
      <SchoolAdminEntries onLogout={handleLogout} />
    ) : (
      <Navigate to="/login" />
    )
  }
/>

        </Routes>
      </main>
    </Router>
  );
}

export default App;
