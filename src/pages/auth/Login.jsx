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

  // LOAD LOCATION DATA
  await loadMyAdminProfile(res.token, res.email);

  localStorage.setItem("isAdminLoggedIn", "true");

  onLogin();
  navigate("/dashboard", { replace: true });

} catch (err) {
  setError("Invalid email or password");
}


};

return ( <div className="login-container"> <div className="login-card">

```
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
