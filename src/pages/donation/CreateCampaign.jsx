// // import React, { useState } from "react";
// // import api from "./services/axiosInstance";
// // import "./donation.css";

// // const CreateCampaign = () => {

// //   const [form, setForm] = useState({
// //     title: "",
// //     description: "",
// //     type: "PROJECT",
// //     state: "",
// //     targetAmount: ""
// //   });

// //   const [scope, setScope] = useState("ALL");
// //   const [image, setImage] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   const handleChange = (e) => {
// //     setForm({ ...form, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!form.targetAmount || Number(form.targetAmount) <= 0) {
// //       alert("Target amount required");
// //       return;
// //     }

// //     try {
// //       setLoading(true);

// //       const formData = new FormData();

// //       formData.append("title", form.title.trim());
// //       formData.append("description", form.description.trim());
// //       formData.append("type", form.type);

// //       // state handling
// //       const selectedState = scope === "ALL" ? "BIHAR" : form.state;
// //       formData.append("state", selectedState);

// //       // ALWAYS send target for both PROGRAM & PROJECT
// //       formData.append("targetAmount", String(form.targetAmount));

// //       if (image) {
// //         formData.append("image", image);
// //       }

// //       await api.post("/admin/donation/campaign", formData, {
// //         headers: {
// //           Authorization: `Bearer ${localStorage.getItem("adminToken")}`
// //         }
// //       });

// //       alert("Campaign Created Successfully ✅");

// //       setForm({
// //         title: "",
// //         description: "",
// //         type: "PROJECT",
// //         state: "",
// //         targetAmount: ""
// //       });

// //       setImage(null);
// //       setScope("ALL");

// //     } catch (err) {
// //       console.error("SERVER ERROR:", err.response?.data || err);
// //       alert(err.response?.data?.message || "Upload failed ❌");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="donation-card">
// //       <h3>Create Donation Campaign</h3>

// //       <form onSubmit={handleSubmit} className="donation-form">

// //         <input
// //           type="text"
// //           name="title"
// //           placeholder="Campaign Title"
// //           value={form.title}
// //           onChange={handleChange}
// //           required
// //         />

// //         <textarea
// //           name="description"
// //           placeholder="Campaign Description"
// //           value={form.description}
// //           onChange={handleChange}
// //           required
// //         />

// //         <label>Campaign Type</label>
// //         <select name="type" value={form.type} onChange={handleChange}>
// //           <option value="PROJECT">Project</option>
// //           <option value="PROGRAM">Program</option>
// //         </select>

// //         <label>Campaign Coverage</label>

// //         <div className="scope-box">
// //           <label>
// //             <input
// //               type="radio"
// //               checked={scope === "ALL"}
// //               onChange={() => setScope("ALL")}
// //             />
// //             All India
// //           </label>

// //           <label>
// //             <input
// //               type="radio"
// //               checked={scope === "STATE"}
// //               onChange={() => setScope("STATE")}
// //             />
// //             Specific State
// //           </label>
// //         </div>

// //         {scope === "STATE" && (
// //           <>
// //             <label>Select State</label>
// //             <select name="state" value={form.state} onChange={handleChange} required>
// //               <option value="">-- Select State --</option>
// //               <option value="BIHAR">BIHAR</option>
// //               <option value="JHARKHAND">JHARKHAND</option>
// //               <option value="UTTAR_PRADESH">UTTAR_PRADESH</option>
// //               <option value="MAHARASHTRA">MAHARASHTRA</option>
// //               <option value="GUJARAT">GUJARAT</option>
// //             </select>
// //           </>
// //         )}

// //         <label>Target Amount</label>
// //         <input
// //           type="number"
// //           name="targetAmount"
// //           placeholder="Enter Target Amount"
// //           value={form.targetAmount}
// //           onChange={handleChange}
// //           required
// //         />

// //         <label>Upload Campaign Image</label>
// //         <input
// //           type="file"
// //           accept="image/*"
// //           onChange={(e) => setImage(e.target.files[0])}
// //           required
// //         />

// //         <button type="submit" className="approve" disabled={loading}>
// //           {loading ? "Creating..." : "Create Campaign"}
// //         </button>

// //       </form>
// //     </div>
// //   );
// // };

// // export default CreateCampaign;


// import React, { useState } from "react";
// import api from "./services/axiosInstance";
// import "./donation.css";

// const CreateCampaign = () => {

//   const [scope, setScope] = useState("ALL");
//   const [manualLocation, setManualLocation] = useState(false);

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     type: "PROJECT",
//     state: "",
//     pincode: "",
//     district: "",
//     village: "",
//     targetAmount: ""
//   });

//   const [villages, setVillages] = useState([]);
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // 🔹 PINCODE FETCH
//   const handlePincode = async (e) => {
//     const value = e.target.value;
//     setForm(prev => ({ ...prev, pincode: value }));

//     if (value.length === 6 && scope === "STATE") {
//       try {
//         const res = await api.get(`/location/pincode/${value}`);

//         // API failed → manual entry
//         if (!res.data || res.data.error || !res.data.state) {
//           setManualLocation(true);
//           setVillages([]);
//           return;
//         }

//         setManualLocation(false);

//         const apiState = res.data.state.toUpperCase().replace(" ", "_");

//         setForm(prev => ({
//           ...prev,
//           state: apiState,
//           district: res.data.district,
//           village: ""
//         }));

//         setVillages(res.data.villages || []);

//       } catch {
//         setManualLocation(true);
//         setVillages([]);
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append("title", form.title.trim());
//       formData.append("description", form.description.trim());
//       formData.append("type", form.type);
//       formData.append("targetAmount", form.targetAmount);

//       if (scope === "ALL") {
//         formData.append("state", "ALL");
//         formData.append("pincode", "");
//         formData.append("district", "");
//         formData.append("village", "");
//       } else {
//         formData.append("state", form.state);
//         formData.append("pincode", form.pincode);
//         formData.append("district", form.district);
//         formData.append("village", form.village);
//       }

//       if (image) formData.append("image", image);

//       await api.post("/admin/donation/campaign", formData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`
//         }
//       });

//       alert("Campaign Created Successfully ✅");

//       setForm({
//         title: "",
//         description: "",
//         type: "PROJECT",
//         state: "",
//         pincode: "",
//         district: "",
//         village: "",
//         targetAmount: ""
//       });

//       setVillages([]);
//       setImage(null);
//       setScope("ALL");
//       setManualLocation(false);

//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Upload failed ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="donation-card">
//       <h3>Create Donation Campaign</h3>

//       <form onSubmit={handleSubmit} className="donation-form">

//         <input
//           type="text"
//           name="title"
//           placeholder="Campaign Title"
//           value={form.title}
//           onChange={handleChange}
//           required
//         />

//         <textarea
//           name="description"
//           placeholder="Campaign Description"
//           value={form.description}
//           onChange={handleChange}
//           required
//         />

//         <label>Campaign Type</label>
//         <select name="type" value={form.type} onChange={handleChange}>
//           <option value="PROJECT">Project</option>
//           <option value="PROGRAM">Program</option>
//         </select>

//         <label>Coverage</label>
//         <div className="scope-box">
//           <label>
//             <input type="radio" checked={scope === "ALL"} onChange={() => setScope("ALL")} />
//             All India
//           </label>
//           <label>
//             <input type="radio" checked={scope === "STATE"} onChange={() => setScope("STATE")} />
//             Specific State
//           </label>
//         </div>

//         {scope === "STATE" && (
//           <>
//             <label>Pincode</label>
//             <input
//               type="number"
//               name="pincode"
//               placeholder="Enter 6 digit pincode"
//               value={form.pincode}
//               onChange={handlePincode}
//               required
//             />

//             <label>State</label>
//             {manualLocation ? (
//               <select name="state" value={form.state} onChange={handleChange} required>
//                 <option value="">-- Select State --</option>
//                 <option value="BIHAR">BIHAR</option>
//                 <option value="JHARKHAND">JHARKHAND</option>
//                 <option value="UTTAR_PRADESH">UTTAR_PRADESH</option>
//                 <option value="MAHARASHTRA">MAHARASHTRA</option>
//                 <option value="GUJARAT">GUJARAT</option>
//               </select>
//             ) : (
//               <input type="text" value={form.state} readOnly />
//             )}

//             <label>District</label>
//             <input
//               type="text"
//               name="district"
//               value={form.district}
//               onChange={handleChange}
//               placeholder="District"
//               required
//             />

//             <label>Village</label>
//             {villages.length > 0 ? (
//               <select name="village" value={form.village} onChange={handleChange} required>
//                 <option value="">-- Select Village --</option>
//                 {villages.map((v, i) => (
//                   <option key={i} value={v}>{v}</option>
//                 ))}
//               </select>
//             ) : (
//               <input
//                 type="text"
//                 name="village"
//                 value={form.village}
//                 onChange={handleChange}
//                 placeholder="Enter village manually"
//                 required
//               />
//             )}
//           </>
//         )}

//         <label>Target Amount</label>
//         <input
//           type="number"
//           name="targetAmount"
//           placeholder="Enter Target Amount"
//           value={form.targetAmount}
//           onChange={handleChange}
//           required
//         />

//         <label>Upload Campaign Image</label>
//         <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />

//         <button type="submit" className="approve" disabled={loading}>
//           {loading ? "Creating..." : "Create Campaign"}
//         </button>

//       </form>
//     </div>
//   );
// };

// export default CreateCampaign;

import React, { useState } from "react";
import api from "./services/axiosInstance";
import "./donation.css";

const CreateCampaign = () => {

  const [scope, setScope] = useState("ALL");

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "PROJECT",
    state: "",
    pincode: "",
    district: "",
    village: "",
    targetAmount: ""
  });

  const [villages, setVillages] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePincode = async (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, pincode: value }));

    if (value.length === 6 && scope === "STATE") {
      try {
        const res = await api.get(`/location/pincode/${value}`);

        if (!res.data || res.data.error || !res.data.state) {
          setVillages([]);
          return;
        }

        const apiState = res.data.state.toUpperCase().replace(/ /g, "_");

        setForm(prev => ({
          ...prev,
          state: apiState,
          district: res.data.district || "",
          village: ""
        }));

        setVillages(res.data.villages || []);

      } catch {
        setVillages([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("type", form.type);
      formData.append("targetAmount", form.targetAmount);

      if (scope === "ALL") {
        formData.append("state", "ALL");
        formData.append("pincode", "");
        formData.append("district", "");
        formData.append("village", "");
      } else {
        formData.append("state", form.state);
        formData.append("pincode", form.pincode);
        formData.append("district", form.district);
        formData.append("village", form.village);
      }

      if (image) formData.append("image", image);

      await api.post("/admin/donation/campaign", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      alert("Campaign Created Successfully ✅");

      setForm({
        title: "",
        description: "",
        type: "PROJECT",
        state: "",
        pincode: "",
        district: "",
        village: "",
        targetAmount: ""
      });

      setVillages([]);
      setImage(null);
      setScope("ALL");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-card">
      <h3>Create Donation Campaign</h3>

      <form onSubmit={handleSubmit} className="donation-form">

        <input
          type="text"
          name="title"
          placeholder="Campaign Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Campaign Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <label>Campaign Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="PROJECT">Project</option>
          <option value="PROGRAM">Program</option>
        </select>

        <label>Coverage</label>
        <div className="scope-box">
          <label>
            <input type="radio" checked={scope === "ALL"} onChange={() => setScope("ALL")} />
            All India
          </label>
          <label>
            <input type="radio" checked={scope === "STATE"} onChange={() => setScope("STATE")} />
            Specific State
          </label>
        </div>

        {scope === "STATE" && (
          <>
            <label>Pincode</label>
            <input
              type="number"
              name="pincode"
              placeholder="Enter 6 digit pincode"
              value={form.pincode}
              onChange={handlePincode}
              required
            />

            <label>State</label>
            <select name="state" value={form.state} onChange={handleChange} required>
              <option value="">-- Select State --</option>
              <option value="BIHAR">BIHAR</option>
              <option value="JHARKHAND">JHARKHAND</option>
              <option value="UTTAR_PRADESH">UTTAR_PRADESH</option>
              <option value="MAHARASHTRA">MAHARASHTRA</option>
              <option value="GUJARAT">GUJARAT</option>
            </select>

            <label>District</label>
            <input
              type="text"
              name="district"
              value={form.district}
              onChange={handleChange}
              placeholder="District"
              required
            />

            <label>Village</label>
            {villages.length > 0 ? (
              <select name="village" value={form.village} onChange={handleChange} required>
                <option value="">-- Select Village --</option>
                {villages.map((v, i) => (
                  <option key={i} value={v}>{v}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="village"
                value={form.village}
                onChange={handleChange}
                placeholder="Enter village manually"
                required
              />
            )}
          </>
        )}

        <label>Target Amount</label>
        <input
          type="number"
          name="targetAmount"
          placeholder="Enter Target Amount"
          value={form.targetAmount}
          onChange={handleChange}
          required
        />

        <label>Upload Campaign Image</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />

        <button type="submit" className="approve" disabled={loading}>
          {loading ? "Creating..." : "Create Campaign"}
        </button>

      </form>
    </div>
  );
};

export default CreateCampaign;
