import React, { useEffect, useState } from "react";
import "./insights.css";
import {
  getInsightsData,
  addInsight,
  updateInsight,
  deleteInsight,
} from "./insights.service";

const InsightsPage = () => {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [count, setCount] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getInsightsData();
    setData(res || []);
  };

  // ➕ Add / ✏ Update
  const handleSubmit = async () => {
    if (!name || !count) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      name,
      count: Number(count),
    };

    if (editId) {
      await updateInsight(editId, payload);
    } else {
      await addInsight(payload);
    }

    setName("");
    setCount("");
    setEditId(null);
    loadData();
  };

  // ✏ Edit
  const handleEdit = (item) => {
    setName(item.name);
    setCount(item.count);
    setEditId(item.id);
  };

  // 🗑 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    await deleteInsight(id);
    loadData();
  };

  return (
    <div className="insights-container">
      <h2>Gaon Talent Engagement</h2>

      {/* 🔹 FORM */}
      <div className="insight-form">
        <input
          type="text"
          placeholder="Name (Villages, Students...)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Count"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* 🔹 CARDS */}
      <div className="insight-cards">
        {data.map((item) => (
          <div className="insight-card" key={item.id}>
            <h4>{item.name}</h4>
            <p>{item.count}+</p>

            <div className="card-actions">
              <button
                className="edit-btn"
                onClick={() => handleEdit(item)}
              >
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPage;