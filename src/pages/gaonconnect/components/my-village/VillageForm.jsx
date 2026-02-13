
// import { useEffect, useState } from "react";
// import "./VillageForm.css";

// const BASE_URL = "http://localhost:9090/admin";

// export default function VillageForm({ data, onClose }) {

//   const isEdit = !!data?.id;

//   const [form, setForm] = useState({
//     name: "",
//     city: "",
//     state: "",
//     description: ""
//   });

//   const [existingImages, setExistingImages] = useState([]);
//   const [newImages, setNewImages] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);

//   const [allDevelopments, setAllDevelopments] = useState([]);
//   const [selectedDevelopments, setSelectedDevelopments] = useState({});

//   /* LOAD DATA */
//   useEffect(() => {

//     setForm({
//       name: data?.name || "",
//       city: data?.city || "",
//       state: data?.state || "",
//       description: data?.description || ""
//     });

//     setExistingImages(data?.images || []);
//     setNewImages([]);
//     setPreviewUrls([]);

//     // load development master
//     fetch(`${BASE_URL}/developments`, {
//       headers: { Authorization: "Bearer " + localStorage.getItem("adminToken") }
//     })
//       .then(res => res.json())
//       .then(devs => setAllDevelopments(devs));

//     // load selected developments
//     if (data?.developments) {
//       const map = {};
//       data.developments.forEach(d => map[d.developmentId] = d);
//       setSelectedDevelopments(map);
//     }

//   }, [data]);

//   /* TEXT CHANGE */
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   /* SELECT NEW IMAGES */
//   const handleImageChange = (e) => {
//     const files = [...e.target.files];
//     setNewImages(files);
//     setPreviewUrls(files.map(file => URL.createObjectURL(file)));
//   };

//   /* REMOVE OLD IMAGE */
//   const removeExistingImage = (img) => {
//     setExistingImages(existingImages.filter(i => i !== img));
//   };

//   /* REMOVE NEW IMAGE */
//   const removeNewImage = (index) => {
//     setNewImages(newImages.filter((_, i) => i !== index));
//     setPreviewUrls(previewUrls.filter((_, i) => i !== index));
//   };

//   /* DEVELOPMENT SELECT */
//   const toggleDevelopment = (devId) => {

//     const updated = { ...selectedDevelopments };

//     if (updated[devId]) delete updated[devId];
//     else updated[devId] = {
//       developmentId: devId,
//       workDescription: "",
//       benefit: "",
//       workStatus: ""
//     };

//     setSelectedDevelopments(updated);
//   };

//   const updateDevField = (devId, field, value) => {
//     setSelectedDevelopments({
//       ...selectedDevelopments,
//       [devId]: {
//         ...selectedDevelopments[devId],
//         [field]: value
//       }
//     });
//   };

//   /* SAVE (MATCHES CURL API) */
//   const handleSubmit = async () => {

//     try {

//       const fd = new FormData();

//       fd.append("name", form.name);
//       fd.append("city", form.city);
//       fd.append("state", form.state);
//       fd.append("description", form.description);

//       // send existing images
//       existingImages.forEach(img => fd.append("existingImages", img));

//       // send new images
//       newImages.forEach(img => fd.append("images", img));

//       // send developments JSON
//       fd.append("developments", JSON.stringify(Object.values(selectedDevelopments)));

//       const url = isEdit
//         ? `${BASE_URL}/villages/${data.id}/upload`
//         : `${BASE_URL}/villages/upload`;

//       const method = isEdit ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("adminToken")
//         },
//         body: fd
//       });

//       if (!res.ok) {
//         const txt = await res.text();
//         alert(txt);
//         return;
//       }

//       const updatedVillage = await res.json();

//       alert("Village saved successfully");
//       onClose(updatedVillage);

//     } catch (err) {
//       console.error(err);
//       alert("Save failed");
//     }
//   };

//   return (
//     <div className="village-form-wrapper">

//       <h2>{isEdit ? "Edit Village" : "Add Village"}</h2>

//       <label>Village Name</label>
//       <input name="name" value={form.name} onChange={handleChange} />

//       <label>City</label>
//       <input name="city" value={form.city} onChange={handleChange} />

//       <label>State</label>
//       <input name="state" value={form.state} onChange={handleChange} />

//       <label>Description</label>
//       <textarea name="description" value={form.description} onChange={handleChange} />

//       {/* NEW IMAGES */}
//       <label>Add Images</label>
//       <input type="file" multiple accept="image/*" onChange={handleImageChange} />

//       <div className="image-preview-grid">
//         {previewUrls.map((img, i) => (
//           <div key={i} className="preview-box">
//             <img src={img} className="preview-img" />
//             <button type="button" onClick={() => removeNewImage(i)}>✕</button>
//           </div>
//         ))}
//       </div>

//       {/* OLD IMAGES */}
//       {isEdit && (
//         <>
//           <h4>Existing Images</h4>
//           <div className="image-preview-grid">
//             {existingImages.map((img, i) => (
//               <div key={i} className="preview-box">
//                 <img src={img + "?t=" + Date.now()} className="preview-img" />
//                 <button type="button" onClick={() => removeExistingImage(img)}>✕</button>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {/* DEVELOPMENT */}
//       <h3>Village Developments</h3>

//       {allDevelopments.map(dev => (
//         <div key={dev.id} className="dev-card">

//           <label className="dev-title">
//             <input
//               type="checkbox"
//               checked={!!selectedDevelopments[dev.id]}
//               onChange={() => toggleDevelopment(dev.id)}
//             />
//             {dev.title}
//           </label>

//           {selectedDevelopments[dev.id] && (
//             <div className="dev-fields">

//               <textarea
//                 placeholder="Work Description"
//                 value={selectedDevelopments[dev.id].workDescription}
//                 onChange={e => updateDevField(dev.id, "workDescription", e.target.value)}
//               />

//               <textarea
//                 placeholder="Benefit"
//                 value={selectedDevelopments[dev.id].benefit}
//                 onChange={e => updateDevField(dev.id, "benefit", e.target.value)}
//               />

//               <input
//                 placeholder="Work Status"
//                 value={selectedDevelopments[dev.id].workStatus}
//                 onChange={e => updateDevField(dev.id, "workStatus", e.target.value)}
//               />

//             </div>
//           )}

//         </div>
//       ))}

//       <div className="form-btn-row">
//         <button className="save-btn" onClick={handleSubmit}>Save</button>
//         <button className="cancel-btn" onClick={() => onClose(null)}>Cancel</button>
//       </div>

//     </div>
//   );
// }

import { useEffect, useState } from "react";
import "./VillageForm.css";

const BASE_URL = "http://localhost:9090/admin";

export default function VillageForm({ data, onClose }) {

  const isEdit = !!data?.id;

  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    description: ""
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [allDevelopments, setAllDevelopments] = useState([]);
  const [selectedDevelopments, setSelectedDevelopments] = useState({});

  useEffect(() => {

    setForm({
      name: data?.name || "",
      city: data?.city || "",
      state: data?.state || "",
      description: data?.description || ""
    });

    setExistingImages(data?.images || []);
    setNewImages([]);
    setPreviewUrls([]);

    fetch(`${BASE_URL}/developments`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("adminToken") }
    })
      .then(res => res.json())
      .then(devs => setAllDevelopments(devs));

    if (data?.developments) {
      const map = {};
      data.developments.forEach(d => map[d.developmentId] = d);
      setSelectedDevelopments(map);
    }

  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = [...e.target.files];
    setNewImages(files);
    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
  };

  const removeExistingImage = (img) => {
    setExistingImages(existingImages.filter(i => i !== img));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const toggleDevelopment = (devId) => {

    const updated = { ...selectedDevelopments };

    if (updated[devId]) delete updated[devId];
    else updated[devId] = {
      developmentId: devId,
      workDescription: "",
      benefit: "",
      progressPercent: 0
    };

    setSelectedDevelopments(updated);
  };

  const updateDevField = (devId, field, value) => {
    setSelectedDevelopments({
      ...selectedDevelopments,
      [devId]: {
        ...selectedDevelopments[devId],
        [field]: value
      }
    });
  };

  const handleSubmit = async () => {

    try {

      const fd = new FormData();

      fd.append("name", form.name);
      fd.append("city", form.city);
      fd.append("state", form.state);
      fd.append("description", form.description);

      existingImages.forEach(img => fd.append("existingImages", img));
      newImages.forEach(img => fd.append("images", img));

      fd.append("developments", JSON.stringify(Object.values(selectedDevelopments)));

      const url = isEdit
        ? `${BASE_URL}/villages/${data.id}/upload`
        : `${BASE_URL}/villages/upload`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: "Bearer " + localStorage.getItem("adminToken") },
        body: fd
      });

      if (!res.ok) {
        const txt = await res.text();
        alert(txt);
        return;
      }

      const updatedVillage = await res.json();
      alert("Village saved successfully");
      onClose(updatedVillage);

    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <div className="village-form-wrapper">

      <h2>{isEdit ? "Edit Village" : "Add Village"}</h2>

      <label>Village Name</label>
      <input name="name" value={form.name} onChange={handleChange} />

      <label>City</label>
      <input name="city" value={form.city} onChange={handleChange} />

      <label>State</label>
      <input name="state" value={form.state} onChange={handleChange} />

      <label>Description</label>
      <textarea name="description" value={form.description} onChange={handleChange} />

      <label>Add Images</label>
      <input type="file" multiple accept="image/*" onChange={handleImageChange} />

      <div className="image-preview-grid">
        {previewUrls.map((img, i) => (
          <div key={i} className="preview-box">
            <img src={img} className="preview-img" />
            <button type="button" onClick={() => removeNewImage(i)}>✕</button>
          </div>
        ))}
      </div>

      {isEdit && (
        <>
          <h4>Existing Images</h4>
          <div className="image-preview-grid">
            {existingImages.map((img, i) => (
              <div key={i} className="preview-box">
                <img src={img + "?t=" + Date.now()} className="preview-img" />
                <button type="button" onClick={() => removeExistingImage(img)}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}

      <h3>Village Developments</h3>

      {allDevelopments.map(dev => (
        <div key={dev.id} className="dev-card">

          <label className="dev-title">
            <input
              type="checkbox"
              checked={!!selectedDevelopments[dev.id]}
              onChange={() => toggleDevelopment(dev.id)}
            />
            {dev.title}
          </label>

          {selectedDevelopments[dev.id] && (
            <div className="dev-fields">

              <textarea
                placeholder="Work Description"
                value={selectedDevelopments[dev.id].workDescription}
                onChange={e => updateDevField(dev.id, "workDescription", e.target.value)}
              />

              <textarea
                placeholder="Benefit"
                value={selectedDevelopments[dev.id].benefit}
                onChange={e => updateDevField(dev.id, "benefit", e.target.value)}
              />

              <label>Progress: {selectedDevelopments[dev.id].progressPercent}%</label>

              <input
                type="range"
                min="0"
                max="100"
                value={selectedDevelopments[dev.id].progressPercent}
                onChange={e => updateDevField(dev.id, "progressPercent", Number(e.target.value))}
              />

              <input
                type="number"
                min="0"
                max="100"
                value={selectedDevelopments[dev.id].progressPercent}
                onChange={e => updateDevField(dev.id, "progressPercent", Number(e.target.value))}
              />

            </div>
          )}

        </div>
      ))}

      <div className="form-btn-row">
        <button className="save-btn" onClick={handleSubmit}>Save</button>
        <button className="cancel-btn" onClick={() => onClose(null)}>Cancel</button>
      </div>

    </div>
  );
}
