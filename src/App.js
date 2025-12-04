import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/login";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      {/* If logged in, show header */}
      {isLoggedIn && <Header onLogout={() => setIsLoggedIn(false)} />}

      <main className={isLoggedIn ? "content-area" : ""}>
        <Routes>

          {/* Default Route */}
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Login Page */}
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" />
              ) : (
                <Login onLogin={() => setIsLoggedIn(true)} />
              )
            }
          />

          {/* Dashboard Page (Protected) */}
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                <Dashboard />
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
