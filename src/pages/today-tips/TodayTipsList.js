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
import Modal from "../../components/Modal";
import AddTodayTip from "./AddTodayTip";
import "../today-tips/todaytips.css";

export default function TodayTipsList() {
  const [tips, setTips] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [editingTip, setEditingTip] = useState(null); // store tip object for editing

  // Convert yyyy-mm-dd → dd-mm-yyyy
  const formatDate = (iso) => {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  // Load today's tips on page load
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
      setTips(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error loading tips:", err);
    }
  };

  const handleDateChange = (iso) => {
    setSelectedDate(iso);
    loadTips(formatDate(iso));
  };

  // --- DELETE tip ---
  const handleDelete = async (id) => {
    const ok = window.confirm("Do you want to delete this tip?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "today_tips", id));
      loadTips(formatDate(selectedDate));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete. Check console.");
    }
  };

  // --- EDIT tip ---
  const handleEdit = (tip) => {
    setEditingTip(tip);
    setOpenAddModal(true);
  };

  // on closing modal
  const handleModalClose = () => {
    setOpenAddModal(false);
    setEditingTip(null);
  };

  return (
    <div className="tips-page">

      {/* Header */}
      <div className="tips-header">
        <h2>Today Tips</h2>

        <button
          className="btn-add"
          onClick={() => {
            setEditingTip(null); // ensure clean form
            setOpenAddModal(true);
          }}
        >
          + Add Tip
        </button>
      </div>

      {/* Date Picker */}
      <input
        id="date"
        type="date"
        value={selectedDate}
        onChange={(e) => handleDateChange(e.target.value)}
        className="input"
        style={{ maxWidth: 140, marginBottom: 16 }}
      />

      {/* Tips List */}
      {tips.length === 0 ? (
        <p style={{ color: "#777" }}>No tips available for this date.</p>
      ) : (
        tips.map((tip) => (
          <div className="tip-card" key={tip.id}>
            {tip.imageBase64 && (
              <img
                src={tip.imageBase64}
                alt={tip.title}
                className="tip-image"
              />
            )}

            <div style={{ flex: 1 }}>
              <h3 className="tip-title">{tip.title}</h3>
              <p className="tip-category">{tip.category}</p>
              <p className="tip-description">{tip.description}</p>
              <p className="tip-date">{tip.date}</p>
            </div>

            {/* Edit + Delete Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => handleEdit(tip)}
                style={{
                  background: "#fff",
                  border: "1px solid #ccc",
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                ✏️ Edit
              </button>

              <button
                onClick={() => handleDelete(tip.id)}
                style={{
                  background: "#fff",
                  border: "1px solid #ffb3b3",
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* Add / Edit Tip Modal */}
      <Modal open={openAddModal} onClose={handleModalClose}>
        <div className="modal-box">
          <AddTodayTip
            onSuccess={() => {
              handleModalClose();
              loadTips(formatDate(selectedDate));
            }}
            initialData={editingTip ? {
              title: editingTip.title,
              category: editingTip.category,
              description: editingTip.description,
              date: editingTip.date,             // dd-mm-yyyy
              imageBase64: editingTip.imageBase64 || "",
            } : null}
            docId={editingTip ? editingTip.id : null}
          />
        </div>
      </Modal>

    </div>
  );
}
