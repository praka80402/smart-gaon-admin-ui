// import React, { useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// import Header from "./components/Header";
// import Dashboard from "./pages/Dashboard";
// import GaonConnect from "./pages/gaonconnect/GaonConnect";
// import Login from "./pages/auth/Login";
// import Loader from "./Loader";

// import "./App.css";

// function App() {
//   // Track login state
//   const [isLoggedIn, setIsLoggedIn] = useState(
//     localStorage.getItem("isAdminLoggedIn") === "true"
//   );

//   // Handle logout
//   const handleLogout = () => {
//     localStorage.removeItem("isAdminLoggedIn");
//     setIsLoggedIn(false);
//   };

//   // When login happens in Login.jsx
//   const handleLogin = () => {
//     localStorage.setItem("isAdminLoggedIn", "true");
//     setIsLoggedIn(true);
//   };

//   return (
  
//     <Router>
//        <Loader />
//       {/* Show header only if logged in */}
//       {isLoggedIn && <Header onLogout={handleLogout} />}

//       <main className={isLoggedIn ? "content-area" : ""}>
//         <Routes>

//           {/* Default route */}
//           <Route
//             path="/"
//             element={
//               isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
//             }
//           />

//           {/* LOGIN ROUTE */}
//           <Route
//             path="/login"
//             element={
//               isLoggedIn ? (
//                 <Navigate to="/dashboard" />
//               ) : (
//                 <Login onLogin={handleLogin} />    // <-- FIXED HERE
//               )
//             }
//           />

//           {/* DASHBOARD */}
//           <Route
//             path="/dashboard"
//             element={
//               isLoggedIn ? <Dashboard /> : <Navigate to="/login" />
//             }
//           />

//           {/* GAON CONNECT */}
//           <Route
//             path="/gaon-connect"
//             element={
//               isLoggedIn ? <GaonConnect /> : <Navigate to="/login" />
//             }
//           />

//         </Routes>
//       </main>
//     </Router>
//   );
// }

// export default App;

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import GaonConnect from "./pages/gaonconnect/GaonConnect";
import Login from "./pages/auth/Login";
import Loader from "./Loader";

// ✅ ADD THESE IMPORTS
import UserManagement from "./pages/UserManagement";
import DonationAdmin from "./pages/donation/DonationAdmin";
import NcertMain from "./pages/shikshasahayak/Shikshsahayak";
import SevaBazarAdmin from "./pages/sevabazar/SevaBazarAdmin";
// import GaonSaathi from "./pages/gaonsaathi/GaonSaathi";

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
          {/* <Route
            path="/gaon-saathi"
            element={
              isLoggedIn ? <GaonSaathi /> : <Navigate to="/login" />
            }
          /> */}

<Route
  path="/profilepage"
  element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />}
/>

        </Routes>
      </main>
    </Router>
  );
}

export default App;