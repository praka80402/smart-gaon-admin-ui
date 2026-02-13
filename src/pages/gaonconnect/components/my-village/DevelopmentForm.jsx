// import { useEffect, useState } from "react";

// const BASE_URL = "http://localhost:9090/admin";

// export default function DevelopmentForm({ data, onClose }) {

//   const isEdit = !!data?.id;

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     imageUrl: ""
//   });

//   useEffect(() => {
//     setForm({
//       title: data?.title || "",
//       description: data?.description || "",
//       imageUrl: data?.imageUrl || ""
//     });
//   }, [data]);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {

//     const url = isEdit
//       ? `${BASE_URL}/developments/${data.id}`
//       : `${BASE_URL}/developments`;

//     const method = isEdit ? "PUT" : "POST";

//     const res = await fetch(url, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("adminToken"),
//       },
//       body: JSON.stringify(form),
//     });

//     if (!res.ok) {
//       alert("Failed to save");
//       return;
//     }

//     alert("Saved successfully");
//     onClose();
//   };

//   return (
//     <div className="card">

//       <h2>{isEdit ? "Edit Development" : "Add Development"}</h2>

//       <label>Title</label>
//       <input name="title" value={form.title} onChange={handleChange} />

//       <label>Description</label>
//       <textarea name="description" value={form.description} onChange={handleChange} />

//       <label>Image URL</label>
//       <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />

//       <div style={{ marginTop: "10px" }}>
//         <button className="save-btn" onClick={handleSubmit}>
//           Save
//         </button>
//         <button className="cancel-btn" onClick={onClose}>
//           Cancel
//         </button>
//       </div>

//     </div>
//   );
// }

import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:9090/admin";

export default function DevelopmentForm({ data, onClose }) {

  const isEdit = !!data?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  /* ------------ LOAD EXISTING DATA ------------ */
  useEffect(() => {
    setTitle(data?.title || "");
    setDescription(data?.description || "");
    setPreview(data?.imageUrl || null);
    setImageFile(null);
  }, [data]);

  /* ------------ IMAGE PICK ------------ */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ------------ SUBMIT ------------ */
  const handleSubmit = async () => {

    if (!title.trim()) {
      alert("Title required");
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);

    if (imageFile) {
      fd.append("image", imageFile);
    }

    const url = isEdit
      ? `${BASE_URL}/developments/${data.id}/upload`
      : `${BASE_URL}/developments/upload`;

    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("adminToken"),
        },
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        alert(text || "Failed to save");
        return;
      }

      alert("Development saved successfully");
      onClose();

    } catch (err) {
      console.error(err);
      alert("Server not reachable");
    }
  };

  return (
    <div className="card">

      <h2>{isEdit ? "Edit Development" : "Add Development"}</h2>

      <label>Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter development title"
      />

      <label>Description</label>
      <textarea
        rows="3"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Upload Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={preview}
            alt="preview"
            style={{
              width: "140px",
              height: "140px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>
      )}

      <div style={{ marginTop: "15px" }}>
        <button className="save-btn" onClick={handleSubmit}>
          {isEdit ? "Update" : "Create"}
        </button>

        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>

    </div>
  );
}
