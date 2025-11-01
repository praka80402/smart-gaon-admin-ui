import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/User";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Header />
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" />} />   {/* 👈 Default route */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Users />} />             {/* 👈 Admin page */}
        </Routes>
      </main>
    </Router>
  );
};

export default App;
