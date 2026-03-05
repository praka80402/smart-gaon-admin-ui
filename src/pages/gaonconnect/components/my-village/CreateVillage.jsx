// import { useEffect, useState } from "react";
// import {
//   getAllDevelopment,
//   getByStatus,
//   deleteDevelopment,
// } from "././service/developmentservice";
// import DevelopmentForm from "./DevelopmentForm";
// import "./development.css";

// export default function DevelopmentAdmin() {

//   const [list, setList] = useState([]);
//   const [filter, setFilter] = useState("ALL");
//   const [selected, setSelected] = useState(null);

//   const fetchData = async () => {
//     if (filter === "ALL") {
//       const res = await getAllDevelopment();
//       setList(res.data);
//     } else {
//       const res = await getByStatus(filter);
//       setList(res.data);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [filter]);

//   return (
//     <div className="dev-container">

//       <h2>Village Development Phases</h2>

//       {/* FILTER */}
//       <div className="dev-filter">
//         <button onClick={() => setFilter("ALL")}>All</button>
//         <button onClick={() => setFilter("ONGOING")}>Ongoing</button>
//         <button onClick={() => setFilter("COMPLETE")}>Completed</button>
//         <button onClick={() => setSelected({})}>+ Add Phase</button>
//       </div>

//       {/* FORM MODAL */}
//       {selected !== null && (
//         <DevelopmentForm
//           data={selected.id ? selected : null}
//           onClose={() => {
//             setSelected(null);
//             fetchData();
//           }}
//         />
//       )}

//       {/* LIST */}
//       <div className="dev-grid">
//         {list.map((item) => (
//           <div className="dev-card" key={item.id}>

//             <h4>Phase {item.phaseNumber}</h4>

//             {item.mainImageUrl && (
//               <img src={item.mainImageUrl} alt="" />
//             )}

//             <h3>{item.title}</h3>
//             <p>{item.developmentArea}</p>

//             {/* Progress */}
//             <div className="progress-bar">
//               <div
//                 className="progress"
//                 style={{ width: `${item.totalCompletion}%` }}
//               />
//             </div>
//             <p>{item.totalCompletion}% Complete</p>

//             <p>
//               {item.startDate} → {item.endDate}
//             </p>

//             <span
//               className={
//                 item.status === "ONGOING"
//                   ? "status ongoing"
//                   : "status complete"
//               }
//             >
//               {item.status}
//             </span>

//             <div className="card-actions">
//               <button onClick={() => setSelected(item)}>Edit</button>
//               <button
//                 onClick={() => {
//                   deleteDevelopment(item.id).then(fetchData);
//                 }}
//               >
//                 Delete
//               </button>
//             </div>

//           </div>
//         ))}
//       </div>

//     </div>
//   );
// }
import { useState } from "react";
import { createVillage } from "./service/villageservice";
import "./createVillage.css";

export default function CreateVillage() {

  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    description: "",
    smartGaon: false
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("description", form.description);
      formData.append("smartGaon", form.smartGaon);

      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }

      await createVillage(formData);

      alert("Village Created Successfully ✅");

      setForm({
        name: "",
        city: "",
        state: "",
        description: "",
        smartGaon: false
      });

      setImages([]);

    } catch (error) {
      console.error(error);
      alert("Failed to create village ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="village-container">
      <div className="village-card">

        <h2>Create Village</h2>

        <form onSubmit={handleSubmit} className="village-form">

          <input
            type="text"
            name="name"
            placeholder="Village Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Village Description"
            value={form.description}
            onChange={handleChange}
          />

          {/* Smart Gaon Checkbox */}
         {/* Smart Gaon Checkbox */}
<div className="checkbox-group">
  <label className="checkbox-label">
    <input
      type="checkbox"
      name="smartGaon"
      checked={form.smartGaon}
      onChange={handleChange}
    />
    <span>Smart Gaon?</span>
  </label>
</div>

          {/* Image Upload */}
          <input
            type="file"
            multiple
            onChange={(e) => setImages(e.target.files)}
          />

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Village"}
          </button>

        </form>

      </div>
    </div>
  );
}