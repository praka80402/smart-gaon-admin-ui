// import { useEffect, useState } from "react";
// import "./successStory.css";

// import {
//   fetchSuccessStories,
//   createSuccessStory,
//   updateSuccessStory,
//   deleteSuccessStory,
// } from "./successStoryService";

// const STATES = ["BIHAR", "JHARKHAND", "UP", "MAHARASHTRA", "GUJARAT"];

// export default function AdminSuccessStory() {
//   const [tab, setTab] = useState("CREATE");
//   const [stories, setStories] = useState([]);
//   const [editId, setEditId] = useState(null);
//   const [imageModal, setImageModal] = useState(null);

//   const [form, setForm] = useState({
//     title: "",
//     userName: "",
//     story: "",
//     state: "BIHAR",
//     pincode: "",
//     profileImage: null,
//   });

//   const loadStories = async () => {
//     const data = await fetchSuccessStories();
//     setStories(data);
//   };

//   useEffect(() => {
//     loadStories();
//   }, []);

//   const submit = async () => {
//     if (!form.title || !form.userName || !form.story || !form.pincode) {
//       alert("All fields are mandatory");
//       return;
//     }

//     if (!editId && !form.profileImage) {
//       alert("Profile image is mandatory");
//       return;
//     }

//     editId
//       ? await updateSuccessStory(editId, form)
//       : await createSuccessStory(form);

//     resetForm();
//     setTab("VIEW");
//     loadStories();
//   };

//   const edit = (s) => {
//     setEditId(s.id);
//     setTab("CREATE");
//     setForm({
//       title: s.title,
//       userName: s.userName,
//       story: s.story,
//       state: s.state,
//       pincode: s.pincode,
//       profileImage: null,
//     });
//   };

//   const remove = async (id) => {
//     if (!window.confirm("Delete this story?")) return;
//     await deleteSuccessStory(id);
//     loadStories();
//   };

//   const resetForm = () => {
//     setEditId(null);
//     setForm({
//       title: "",
//       userName: "",
//       story: "",
//       state: "BIHAR",
//       pincode: "",
//       profileImage: null,
//     });
//   };

//   return (
//     <div className="ss-admin">
//       <h2 className="donation-title">Success Story</h2>

//       {/* TABS */}
//       <div className="ss-tabs">
//         <button
//           className={tab === "CREATE" ? "active" : ""}
//           onClick={() => {
//             resetForm();
//             setTab("CREATE");
//           }}
//         >
//           {editId ? "Edit Story" : "Create Story"}
//         </button>
//         <button
//           className={tab === "VIEW" ? "active" : ""}
//           onClick={() => setTab("VIEW")}
//         >
//           View Stories
//         </button>
//       </div>

//       {/* CREATE / EDIT */}
//       {tab === "CREATE" && (
//         <div className="ss-form">
//           {/* <h3>{editId ? "Edit Success Story" : "Add Success Story"}</h3> */}

//           <input
//             placeholder="Title"
//             value={form.title}
//             onChange={(e) => setForm({ ...form, title: e.target.value })}
//           />

//           <input
//             placeholder="Name"
//             value={form.userName}
//             onChange={(e) => setForm({ ...form, userName: e.target.value })}
//           />

//           <select
//             value={form.state}
//             onChange={(e) => setForm({ ...form, state: e.target.value })}
//           >
//             {STATES.map((s) => (
//               <option key={s} value={s}>{s}</option>
//             ))}
//           </select>

//           <input
//             placeholder="Pincode"
//             maxLength={6}
//             value={form.pincode}
//             onChange={(e) => setForm({ ...form, pincode: e.target.value })}
//           />

//           <textarea
//             rows={6}
//             placeholder="Write success story..."
//             value={form.story}
//             onChange={(e) => setForm({ ...form, story: e.target.value })}
//           />

//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) =>
//               setForm({ ...form, profileImage: e.target.files[0] })
//             }
//           />

//           <button onClick={submit}>
//             {editId ? "Update Story" : "Publish Story"}
//           </button>
//         </div>
//       )}

//       {/* VIEW */}
//       {tab === "VIEW" && (
//         <div className="ss-table-wrapper">
//           <table className="ss-table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Title</th>
//                 <th>User</th>
//                 <th>State</th>
//                 <th>Pincode</th>
//                 <th>Story</th>
//                 <th>Image</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {stories.length === 0 && (
//                 <tr>
//                   <td colSpan="8" style={{ textAlign: "center" }}>
//                     No stories found
//                   </td>
//                 </tr>
//               )}

//               {stories.map((s, i) => (
//                 <tr key={s.id}>
//                   <td>{i + 1}</td>
//                   <td>{s.title}</td>
//                   <td>{s.userName}</td>
//                   <td>{s.state}</td>
//                   <td>{s.pincode}</td>
//                   <td className="story-cell">{s.story}</td>
//                   <td>
//                     <button
//                       type="button"
//                       className="view-btn"
//                       onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         setImageModal(s.profileImageUrl);
//                       }}
//                     >
//                       View
//                     </button>
//                   </td>
//                   <td>
//                     <button onClick={() => edit(s)}>Edit</button>
//                     <button className="danger" onClick={() => remove(s.id)}>
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* IMAGE MODAL */}
//       {imageModal && (
//         <div className="ss-modal-overlay" onClick={() => setImageModal(null)}>
//           <div className="ss-modal" onClick={(e) => e.stopPropagation()}>
//             <button
//               className="ss-modal-close"
//               onClick={() => setImageModal(null)}
//             >
//               ✕
//             </button>
//             <img src={imageModal} alt="Profile" />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import "./successStory.css";

import {
  fetchSuccessStories,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
} from "./successStoryService";

const STATES = ["BIHAR", "JHARKHAND", "UP", "MAHARASHTRA", "GUJARAT"];

export default function AdminSuccessStory() {

  const role = localStorage.getItem("adminRole");

  const canEdit =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [tab, setTab] = useState(canEdit ? "CREATE" : "VIEW");
  const [stories, setStories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [imageModal, setImageModal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    userName: "",
    story: "",
    state: "BIHAR",
    pincode: "",
    profileImage: null,
  });

  const loadStories = async () => {
    const data = await fetchSuccessStories();
    setStories(data);
  };

  useEffect(() => {
    loadStories();
  }, []);

  const submit = async () => {

    if (!canEdit) return;

    if (!form.title || !form.userName || !form.story || !form.pincode) {
      alert("All fields are mandatory");
      return;
    }

    if (!editId && !form.profileImage) {
      alert("Profile image is mandatory");
      return;
    }

    if (editId) {
      await updateSuccessStory(editId, form);
    } else {
      await createSuccessStory(form);
    }

    resetForm();
    setTab("VIEW");
    loadStories();
  };

  const edit = (s) => {

    if (!canEdit) return;

    setEditId(s.id);
    setTab("CREATE");

    setForm({
      title: s.title,
      userName: s.userName,
      story: s.story,
      state: s.state,
      pincode: s.pincode,
      profileImage: null,
    });
  };

  const remove = async (id) => {

    if (!canEdit) return;

    if (!window.confirm("Delete this story?")) return;

    await deleteSuccessStory(id);
    loadStories();
  };

  const resetForm = () => {
    setEditId(null);
    setForm({
      title: "",
      userName: "",
      story: "",
      state: "BIHAR",
      pincode: "",
      profileImage: null,
    });
  };

  return (
    <div className="ss-admin">
      <h2 className="donation-title">Success Story</h2>

      {/* TABS */}
      <div className="ss-tabs">

        {canEdit && (
          <button
            className={tab === "CREATE" ? "active" : ""}
            onClick={() => {
              resetForm();
              setTab("CREATE");
            }}
          >
            {editId ? "Edit Story" : "Create Story"}
          </button>
        )}

        <button
          className={tab === "VIEW" ? "active" : ""}
          onClick={() => setTab("VIEW")}
        >
          View Stories
        </button>

      </div>

      {/* CREATE / EDIT FORM */}
      {canEdit && tab === "CREATE" && (
        <div className="ss-form">

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <input
            placeholder="Name"
            value={form.userName}
            onChange={(e) =>
              setForm({ ...form, userName: e.target.value })
            }
          />

          <select
            value={form.state}
            onChange={(e) =>
              setForm({ ...form, state: e.target.value })
            }
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            placeholder="Pincode"
            maxLength={6}
            value={form.pincode}
            onChange={(e) =>
              setForm({ ...form, pincode: e.target.value })
            }
          />

          <textarea
            rows={6}
            placeholder="Write success story..."
            value={form.story}
            onChange={(e) =>
              setForm({ ...form, story: e.target.value })
            }
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({ ...form, profileImage: e.target.files[0] })
            }
          />

          <button onClick={submit}>
            {editId ? "Update Story" : "Publish Story"}
          </button>

        </div>
      )}

      {/* VIEW TABLE */}
      {tab === "VIEW" && (
        <div className="ss-table-wrapper">
          <table className="ss-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>User</th>
                <th>State</th>
                <th>Pincode</th>
                <th>Story</th>
                <th>Image</th>
                {canEdit && <th>Action</th>}
              </tr>
            </thead>

            <tbody>

              {stories.length === 0 && (
                <tr>
                  <td
                    colSpan={canEdit ? 8 : 7}
                    style={{ textAlign: "center" }}
                  >
                    No stories found
                  </td>
                </tr>
              )}

              {stories.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.title}</td>
                  <td>{s.userName}</td>
                  <td>{s.state}</td>
                  <td>{s.pincode}</td>
                  <td className="story-cell">{s.story}</td>

                  <td>
                    <button
                      type="button"
                      className="view-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImageModal(s.profileImageUrl);
                      }}
                    >
                      View
                    </button>
                  </td>

                  {canEdit && (
                    <td>
                      <button onClick={() => edit(s)}>Edit</button>
                      <button
                        className="danger"
                        onClick={() => remove(s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}

      {/* IMAGE MODAL */}
      {imageModal && (
        <div
          className="ss-modal-overlay"
          onClick={() => setImageModal(null)}
        >
          <div
            className="ss-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="ss-modal-close"
              onClick={() => setImageModal(null)}
            >
              ✕
            </button>
            <img src={imageModal} alt="Profile" />
          </div>
        </div>
      )}

    </div>
  );
}