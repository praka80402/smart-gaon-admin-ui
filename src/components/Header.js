import React from "react";
import "./header.css";

const Header = () => {
  return (
    <div className="header">
      
      {/* LEFT SIDE */}
      <div className="header-left">
        <span className="welcome">Welcome, Manish Anand</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="header-right">
        <button className="logout-btn">Logout</button>
      </div>

    </div>
  );
};

export default Header;
