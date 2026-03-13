// import React, { useEffect, useState } from "react";
// import "./header.css";

// const Header = ({ onLogout }) => {
//   const [adminInfo, setAdminInfo] = useState({
//     role: "",
//     state: "",
//     district: "",
//   });

//   useEffect(() => {
//     // Read data saved during login
//     const role = localStorage.getItem("adminRole");
//     const state = localStorage.getItem("adminState");
//     const district = localStorage.getItem("adminDistrict");

//     setAdminInfo({ role, state, district });
//   }, []);

//   // -------------------------------------------
//   // ROLE DISPLAY TEXT
//   // -------------------------------------------
//   const getRoleText = () => {
//     if (adminInfo.role === "SUPER_ADMIN") {
//       return "Super Admin";
//     }

//     if (adminInfo.role === "STATE_ADMIN") {
//       return `${adminInfo.state} · State Admin`;
//     }

//     if (adminInfo.role === "DISTRICT_ADMIN") {
//       return `${adminInfo.district}, ${adminInfo.state} · District Admin`;
//     }

//     return "";
//   };

//   return (
//     <header className="header-bar">

//       {/* LEFT SECTION */}
//       <div className="header-left">
//         <div className="logo-box"></div>

//         <div>
//           <div className="header-title">SmartGaon AI-Admin Portal</div>
//         </div>
//       </div>

//       {/* RIGHT SECTION */}
//       <div className="header-right">

//         {/* 🔥 Dynamic Role Display */}
//         <div className="user-tag">{getRoleText()}</div>

//         <button className="logout-btn" onClick={onLogout}>
//           Logout
//         </button>
//       </div>

//     </header>
//   );
// };

// export default Header;


// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "./header.css";

// const Header = ({ onLogout }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [adminInfo, setAdminInfo] = useState({
//     role: "",
//     state: "",
//     district: "",
//   });

//   useEffect(() => {
//     const role = localStorage.getItem("adminRole");
//     const state = localStorage.getItem("adminState");
//     const district = localStorage.getItem("adminDistrict");

//     setAdminInfo({ role, state, district });
//   }, []);

//   const getRoleText = () => {
//     if (adminInfo.role === "SUPER_ADMIN") return "Super Admin";

//     if (adminInfo.role === "STATE_ADMIN")
//       return `${adminInfo.state} · State Admin`;

//     if (adminInfo.role === "DISTRICT_ADMIN")
//       return `${adminInfo.district}, ${adminInfo.state} · District Admin`;

//     return "";
//   };

//   // ✅ Role Based Menu
//   const menuItems =
//     adminInfo.role === "ACCOUNT_ADMIN"
//       ? [{ name: "Donation", path: "/donation" }]
//       : [
//           { name: "Dashboard", path: "/dashboard" },
//           { name: "User Mgmt", path: "/users" },
//           { name: "Shiksha Sahayak", path: "/shiksha" },
//           { name: "Gaon Connect", path: "/gaon-connect" },
//           { name: "Donation", path: "/donation" },
//           { name: "Seva Bazar", path: "/seva-bazar" },
//           { name: "Gaon Saathi", path: "/gaon-saathi" },
//         ];

//   return (
//     <header className="header-bar">
      
//       {/* LEFT SECTION */}
//       <div className="header-left">
//         <div className="logo-box"></div>

//         <div
//           className="header-title clickable"
//           onClick={() => navigate("/dashboard")}
//         >
//           SmartGaon AI <br/>
//           Admin Portal
//         </div>
//       </div>

//       {/* CENTER MENU */}
//       <div className="header-menu">
//         {menuItems.map((item, index) => (
//           <div
//             key={index}
//             className={`menu-item ${
//               location.pathname.startsWith(item.path)
//                 ? "active-menu"
//                 : ""
//             }`}
//             onClick={() => navigate(item.path)}
//           >
//             {item.name}
//           </div>
//         ))}
//       </div>

//       {/* RIGHT SECTION */}
//       <div className="header-right">
//         <div className="user-tag">{getRoleText()}</div>

//         <button className="logout-btn" onClick={onLogout}>
//           Logout
//         </button>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./header.css";

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [adminInfo, setAdminInfo] = useState({
    name: "",
    role: "",
    state: "",
    district: "",
  });

  const [showDropdown, setShowDropdown] = useState(false);

  

  useEffect(() => {
  const loadAdmin = () => {
    setAdminInfo({
      name: localStorage.getItem("adminName") || "",
      role: localStorage.getItem("adminRole") || "",
      state: localStorage.getItem("adminState") || "",
      district: localStorage.getItem("adminDistrict") || "",
    });
  };

  loadAdmin();
  window.addEventListener("storage", loadAdmin);

  return () => window.removeEventListener("storage", loadAdmin);
}, []);

const getInitial = () => {
  const name = adminInfo.name?.trim();
  if (!name) return "A";
  return name[0].toUpperCase();
};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleText = () => {
    if (adminInfo.role === "SUPER_ADMIN") return "Super Admin";
    if (adminInfo.role === "STATE_ADMIN")
      return `${adminInfo.state} State Admin`;
    if (adminInfo.role === "DISTRICT_ADMIN")
      return `${adminInfo.district}, ${adminInfo.state} District Admin`;
    return "";
  };
 


 
  const allMenuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "User Mgmt", path: "/users" },
  { name: "Shiksha Sahayak", path: "/shiksha" },
  { name: "Gaon Connect", path: "/gaon-connect" },
  { name: "Donation", path: "/donation" },
  { name: "Seva Bazar", path: "/seva-bazar" },
  { name: "Gaon Saathi", path: "/gaon-saathi" },
];

const menuItems =
  adminInfo.role === "ACCOUNT_ADMIN"
    ? [{ name: "Donation", path: "/donation" }]
    : allMenuItems;

  return (
    <header className="header-bar">

      {/* LEFT */}
      <div className="header-left">
        <div className="logo"></div>
        <div className="title" onClick={() => navigate("/dashboard")}>
          SmartGaon AI <br/>
          Admin Portal
        </div>
      </div>

      {/* MENU */}
      <div className="header-menu">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`menu-item ${
              location.pathname.startsWith(item.path) ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </div>
        ))}
      </div>

      {/* PROFILE */}
      <div className="profile-container" ref={dropdownRef}>
        <div
          className="avatar"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {getInitial()}
        </div>

        {showDropdown && (
          <div className="dropdown">
  <div className="dropdown-name">{adminInfo.name}</div>
  <div className="dropdown-role">{getRoleText()}</div>

  <div className="dropdown-divider"></div>

  {/* <div
    className="dropdown-item"
    onClick={() => {
      window.location.href = "/profilepage";
    }}
  >
    Profile
  </div> */}

  <div
  className="dropdown-item"
  onClick={() => {
    navigate("/profilepage");
    setShowDropdown(false);
  }}
>
  Profile
</div>

  <div className="dropdown-item" onClick={onLogout}>
    Logout
  </div>
</div>
          // <div className="dropdown">
          //   <div className="dropdown-name">{adminInfo.name}</div>
          //   <div className="dropdown-role">{getRoleText()}</div>

          //   <div className="dropdown-divider"></div>
          //   <div className="dropdown-item" onClick={onLogout}>
          //     Logout
          //   </div>
   

          // </div>
        )}
      </div>
    </header>
  );
};

export default Header;