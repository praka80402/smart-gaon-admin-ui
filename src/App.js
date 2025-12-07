import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import GaonConnect from "./pages/gaonconnect/GaonConnect";
import Login from "./pages/auth/Login";

import "./App.css";

function App() {
  // Track login state
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isAdminLoggedIn") === "true"
  );

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    setIsLoggedIn(false);
  };

  // When login happens in Login.jsx
  const handleLogin = () => {
    localStorage.setItem("isAdminLoggedIn", "true");
    setIsLoggedIn(true);
  };

  return (
    <Router>
      {/* Show header only if logged in */}
      {isLoggedIn && <Header onLogout={handleLogout} />}

      <main className={isLoggedIn ? "content-area" : ""}>
        <Routes>

          {/* Default route */}
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
            }
          />

          {/* LOGIN ROUTE */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={handleLogin} />    // <-- FIXED HERE
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

          {/* GAON CONNECT */}
          <Route
            path="/gaon-connect"
            element={
              isLoggedIn ? <GaonConnect /> : <Navigate to="/login" />
            }
          />

        </Routes>
      </main>
    </Router>
  );
}

export default App;
