// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./login.css";
// import { loginAdmin } from "../userService"; 
// import logo from "../../assets/logo.svg";  // ✅ ADD LOGO

// const Login = ({ onLogin }) => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await loginAdmin(email, password);

//       // SAVE ADMIN DETAILS
//       localStorage.setItem("adminToken", res.token);
//       localStorage.setItem("adminRole", res.role || "");
//       localStorage.setItem("adminState", res.state || "");
//       localStorage.setItem("adminDistrict", res.district || "");
//       localStorage.setItem("isAdminLoggedIn", "true");

//       onLogin();
//       navigate("/dashboard", { replace: true });

//     } catch (err) {
//       setError("Invalid email or password");
//     }
//   };

//   return (
//     <div className="login-container">

//       <div className="login-card">

//         {/* 🔥 LOGO AT TOP */}
//         <img 
//           src={logo} 
//           alt="SmartGaon Logo" 
//           className="login-logo" 
//         />

//         <h2 className="login-title">SmartGaon AI</h2>
//         <p className="login-subtitle">Admin Login</p>

//         {error && <p className="error-message">{error}</p>}

//         <form onSubmit={handleSubmit}>
//           <label>Email</label>
//           <input
//             type="email"
//             placeholder="Enter admin email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <label>Password</label>
//           <input
//             type="password"
//             placeholder="Enter admin password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <button type="submit" className="login-btn">
//             Login
//           </button>
//         </form>

//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { loginAdmin, loadMyAdminProfile } from "../userService";
import logo from "../../assets/logo.svg";

const Login = ({ onLogin }) => {

const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const handleSubmit = async (e) => {
e.preventDefault();
setError("");


try {
  // LOGIN
  const res = await loginAdmin(email, password);

  // CLEAR OLD DATA
  localStorage.clear();

  // SAVE BASIC
  localStorage.setItem("adminToken", res.token);
  localStorage.setItem("adminRole", res.role);
  localStorage.setItem("adminEmail", res.email);
  // localStorage.setItem("isAdminLoggedIn", "true")

    if (res.role !== "ACCOUNT_ADMIN" && res.role !== "JUDGE") {
      try {
        await loadMyAdminProfile(res.token, res.email);
      } catch (profileErr) {
        console.warn("Could not load admin profile details", profileErr);
      }
    }

    localStorage.setItem("isAdminLoggedIn", "true");
    onLogin();
    if (res.role === "ACCOUNT_ADMIN") {
      navigate("/donation/DonationAdmin", { replace: true });
    } else if (res.role === "JUDGE") {
      navigate("/judge-portal", { replace: true });
    } else if (res.role === "SCHOOL_ADMIN") {
      navigate("/school-admin/entries", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  // navigate("/dashboard", { replace: true });

} catch (err) {
  const serverErrMsg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || "Invalid email or password");
  setError(serverErrMsg);
}


};

return ( <div className="login-container"> <div className="login-card">

    <img src={logo} alt="SmartGaon Logo" className="login-logo" />

    <h2 className="login-title">SmartGaon AI</h2>
    <p className="login-subtitle">Admin Login</p>

    {error && <p className="error-message">{error}</p>}

    <form onSubmit={handleSubmit}>
      <label>Email</label>
      <input
        type="email"
        placeholder="Enter admin email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>Password</label>
      <input
        type="password"
        placeholder="Enter admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" className="login-btn">
        Login
      </button>
    </form>

  </div>
</div>


);
};

export default Login;
