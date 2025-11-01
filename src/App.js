import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/User";
import "./App.css";

const App = () => {
  const [activePage, setActivePage] = useState("users"); // default = admin page

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <Users />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* ✅ Always show Header */}
      <Header />

      {/* ✅ Sidebar stays fixed on left */}
      <Sidebar activePage={activePage} onSelect={setActivePage} />

      {/* ✅ Main content area (below header, beside sidebar) */}
      <main className="main">{renderPage()}</main>
    </div>
  );
};

export default App;
