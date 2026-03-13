import React, { useState } from "react";
import axios from "axios";

function UpdateProfile() {

const [formData, setFormData] = useState({
  name: localStorage.getItem("adminName") || "",
  email: localStorage.getItem("adminEmail") || "",
  role: localStorage.getItem("adminRole") || "",
  state: localStorage.getItem("adminState") || "",
  district: localStorage.getItem("adminDistrict") || "",
  pincode: localStorage.getItem("adminPincode") || "",
});

const role = formData.role;
const token = localStorage.getItem("adminToken");

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.put(
      "http://localhost:9090/admin/user/update-profile",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (formData.name) {
      localStorage.setItem("adminName", formData.name);
    }

    alert(res.data);

  } catch (error) {
    alert("Profile update failed");
  }
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

const labelStyle = {
  fontWeight: "600",
  color: "#333"
};

return (
<div style={{
  width:"420px",
  margin:"60px auto",
  background:"#fff",
  padding:"30px",
  borderRadius:"10px",
  boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
  fontFamily:"Arial"
}}>

<h2 style={{
  textAlign:"center",
  marginBottom:"25px",
  color:"#246d38"
}}>
Update Profile
</h2>

<form onSubmit={handleSubmit}>

<label style={labelStyle}>Name</label>
<input
  style={inputStyle}
  type="text"
  name="name"
  placeholder="Enter your name"
  value={formData.name}
  onChange={handleChange}
/>

<br/><br/>

<label style={labelStyle}>Email</label>
<input
  style={{...inputStyle, background:"#f1f1f1"}}
  type="email"
  value={formData.email}
  disabled
/>

<br/><br/>

<label style={labelStyle}>Role</label>
<input
  style={{...inputStyle, background:"#f1f1f1"}}
  type="text"
  value={formData.role}
  disabled
/>

<br/><br/>

{(role === "STATE_ADMIN" || role === "DISTRICT_ADMIN" || role === "VILLAGE_ADMIN") && (
<>
<label style={labelStyle}>State</label>
<input
  style={inputStyle}
  type="text"
  name="state"
  placeholder="Enter state"
  value={formData.state}
  onChange={handleChange}
/>

<br/><br/>
</>
)}

{(role === "DISTRICT_ADMIN" || role === "VILLAGE_ADMIN") && (
<>
<label style={labelStyle}>District</label>
<input
  style={inputStyle}
  type="text"
  name="district"
  placeholder="Enter district"
  value={formData.district}
  onChange={handleChange}
/>

<br/><br/>
</>
)}

{role === "VILLAGE_ADMIN" && (
<>
<label style={labelStyle}>Pincode</label>
<input
  style={inputStyle}
  type="text"
  name="pincode"
  placeholder="Enter pincode"
  value={formData.pincode}
  onChange={handleChange}
/>

<br/><br/>
</>
)}

<button
type="submit"
style={{
  width:"100%",
  padding:"12px",
  background:"#246d38",
  color:"#fff",
  border:"none",
  borderRadius:"6px",
  fontWeight:"600",
  fontSize:"15px",
  cursor:"pointer"
}}
>
Update Profile
</button>

</form>
</div>
);
}

export default UpdateProfile;