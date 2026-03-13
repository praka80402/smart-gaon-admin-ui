
// import { useEffect, useState } from "react";
// import {
//   collection,
//   getDocs,
//   orderBy,
//   query,
//   where,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "../../firebase";
// import AddTodayTip from "./AddTodayTip";
// import "./todaytips.css";

// export default function TodayTipsList() {
//   const role = localStorage.getItem("adminRole");

//   const canEdit =
//     role === "SUPER_ADMIN" || role === "STATE_ADMIN";

//   const [tips, setTips] = useState([]);
//   const [openAddModal, setOpenAddModal] = useState(false);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [editingTip, setEditingTip] = useState(null);

//   const formatDate = (iso) => {
//     const [y, m, d] = iso.split("-");
//     return `${d}-${m}-${y}`;
//   };

//   useEffect(() => {
//     const todayISO = new Date().toISOString().split("T")[0];
//     setSelectedDate(todayISO);
//     loadTips(formatDate(todayISO));
//   }, []);

//   const loadTips = async (formattedDate) => {
//     try {
//       const q = query(
//         collection(db, "today_tips"),
//         where("date", "==", formattedDate),
//         orderBy("createdAt", "desc")
//       );

//       const snapshot = await getDocs(q);
//       setTips(snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })));
//     } catch (err) {
//       console.error("Error loading tips:", err);
//     }
//   };

//   const handleDateChange = (iso) => {
//     setSelectedDate(iso);
//     loadTips(formatDate(iso));
//   };

//   const handleDelete = async (id) => {
//     if (!canEdit) return;

//     const ok = window.confirm("Do you want to delete this tip?");
//     if (!ok) return;

//     try {
//       await deleteDoc(doc(db, "today_tips", id));
//       loadTips(formatDate(selectedDate));
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   const handleEdit = (tip) => {
//     if (!canEdit) return;
//     setEditingTip(tip);
//     setOpenAddModal(true);
//   };

//   const handleCloseForm = () => {
//     setOpenAddModal(false);
//     setEditingTip(null);
//   };

//   return (
//     <div className="tips-page">

//       {/* Header */}
//       <div className="tips-header">
//         <h2>Today Tips</h2>

//         {canEdit && !openAddModal && (
//           <button
//             className="btn-add"
//             onClick={() => {
//               setEditingTip(null);
//               setOpenAddModal(true);
//             }}
//           >
//             + Add Tip
//           </button>
//         )}
//       </div>

//       {/* If Form is Open → Show Only Form */}
//       {openAddModal ? (
//         <div className="inline-modal">
//           <div className="inline-header">
//             <h3>{editingTip ? "Edit Tip" : "Add New Tip"}</h3>
//             <button
//               className="inline-close"
//               onClick={handleCloseForm}
//             >
//               ×
//             </button>
//           </div>

//           <AddTodayTip
//             onSuccess={() => {
//               handleCloseForm();
//               loadTips(formatDate(selectedDate));
//             }}
//             initialData={
//               editingTip
//                 ? {
//                     title: editingTip.title,
//                     category: editingTip.category,
//                     description: editingTip.description,
//                     date: editingTip.date,
//                     imageBase64: editingTip.imageBase64 || "",
//                   }
//                 : null
//             }
//             docId={editingTip ? editingTip.id : null}
//           />
//         </div>
//       ) : (
//         <>
//           {/* Date Picker */}
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => handleDateChange(e.target.value)}
//             className="input"
//           />

//           {/* Tips List */}
//           {tips.length === 0 ? (
//             <p style={{ color: "#777" }}>
//               No tips available for this date.
//             </p>
//           ) : (
//             tips.map((tip) => (
//               <div className="tip-card" key={tip.id}>

//                 {tip.imageBase64 && (
//                   <img
//                     src={tip.imageBase64}
//                     alt={tip.title}
//                     className="tip-image"
//                   />
//                 )}

//                 <div className="tip-content">
//                   <h3 className="tip-title">{tip.title}</h3>
//                   <p className="tip-category">{tip.category}</p>
//                   <p className="tip-description">{tip.description}</p>
//                   <p className="tip-date">{tip.date}</p>
//                 </div>

//                 {canEdit && (
//                   // <div className="tip-actions">
//                   //   <button
//                   //     className="edit-btn"
//                   //     onClick={() => handleEdit(tip)}
//                   //   >
//                   //     Edit
//                   //   </button>

//                   //   <button
//                   //     className="delete-btn"
//                   //     onClick={() => handleDelete(tip.id)}
//                   //   >
//                   //     Delete
//                   //   </button>
//                   // </div>
//                   <div className="todaytips-actions">
//   <button
//     className="todaytips-edit"
//     onClick={() => handleEdit(tip)}
//   >
//     Edit
//   </button>

//   <button
//     className="todaytips-delete"
//     onClick={() => handleDelete(tip.id)}
//   >
//     Delete
//   </button>
// </div>
//                 )}

//               </div>
//             ))
//           )}
//         </>
//       )}

//     </div>
//   );
// }

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import AddTodayTip from "./AddTodayTip";
import "./todaytips.css";

export default function TodayTipsList() {

  const role = localStorage.getItem("adminRole");

  const canEdit =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [tips, setTips] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [editingTip, setEditingTip] = useState(null);

  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  useEffect(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    setSelectedDate(todayISO);
    loadTips(formatDate(todayISO));
  }, []);

  const loadTips = async (formattedDate) => {
    try {
      const q = query(
        collection(db, "today_tips"),
        where("date", "==", formattedDate),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      setTips(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

    } catch (err) {
      console.error("Error loading tips:", err);
    }
  };

  const handleDateChange = (iso) => {
    setSelectedDate(iso);
    loadTips(formatDate(iso));
  };

  const handleDelete = async (id) => {

    if (!canEdit) return;

    const ok = window.confirm("Delete this tip?");
    if (!ok) return;

    await deleteDoc(doc(db, "today_tips", id));

    loadTips(formatDate(selectedDate));
  };

  const handleEdit = (tip) => {
    setEditingTip(tip);
    setOpenAddModal(true);
  };

  const handleCloseForm = () => {
    setOpenAddModal(false);
    setEditingTip(null);
  };

  return (

    <div className="todaytips-page">

      {/* HEADER */}
      <div className="todaytips-header">

        <h2>Today Tips</h2>

        {canEdit && !openAddModal && (
          <button
            className="todaytips-add-btn"
            onClick={() => {
              setEditingTip(null);
              setOpenAddModal(true);
            }}
          >
            + Add Tip
          </button>
        )}

      </div>


      {openAddModal ? (

        <div className="todaytips-modal">

          <div className="todaytips-modal-header">

            <h3>{editingTip ? "Edit Tip" : "Add Tip"}</h3>

            <button
              className="todaytips-close"
              onClick={handleCloseForm}
            >
              ×
            </button>

          </div>

          <AddTodayTip
            onSuccess={() => {
              handleCloseForm();
              loadTips(formatDate(selectedDate));
            }}
            initialData={editingTip}
            docId={editingTip?.id}
          />

        </div>

      ) : (

        <>

          {/* DATE */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="todaytips-date-input"
          />

          {/* LIST */}
          {/* Tips List */}
{tips.length === 0 ? (
  <p style={{ color: "#777" }}>No tips available</p>
) : (
  tips.map((tip) => (
    <div
      key={tip.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        marginBottom: "15px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
      }}
    >
      {/* Tip Content */}
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: "6px" }}>{tip.title}</h3>
        <p style={{ margin: "4px 0" }}>{tip.category}</p>
        <p style={{ margin: "4px 0" }}>{tip.description}</p>
        <p style={{ color: "#777", marginTop: "6px" }}>{tip.date}</p>
      </div>

      {/* Edit Delete Buttons */}
      {canEdit && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginLeft: "20px"
          }}
        >
          <button
            onClick={() => handleEdit(tip)}
            style={{
              padding: "6px 12px",
              border: "none",
              background: "#22c55e",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(tip.id)}
            style={{
              padding: "6px 12px",
              border: "none",
              background: "#ef4444",
              color: "#fff",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  ))
)}

        </>

      )}

    </div>

  );
}