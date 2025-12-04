import React, { useState } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/User";
import "./App.css";

const App = () => {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard setActivePage={setActivePage} />;
      case "users":
        return <Users />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-wrapper">
      <Header />

      {/* Main Content (below header) */}
      <main className="content-area">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
