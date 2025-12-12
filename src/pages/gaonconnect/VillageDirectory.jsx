// src/pages/gaonconnect/VillageDirectory.jsx
import React, { useState, useEffect } from "react";
import {
  getAllDirectoryUsers,
  getDirectoryUsersByPincode,
  addDirectoryUser,
  updateDirectoryUser,
  deleteDirectoryUser,
} from "./gaonConnectService";

import "./gaonconnect.css";

const VillageDirectory = () => {
  const [users, setUsers] = useState([]);

  const [pincodeSearch, setPincodeSearch] = useState("");

  // Form fields for ADD / EDIT
  const [form, setForm] = useState({
    id: null,
    firstName: "",
    lastName: "",
    phone: "",
    occupation: "",
    pincode: "",
    district: "",
    state: "",
    area: "",
  });

  const [showForm, setShowForm] = useState(false);

  // ----------------------------
  // Load all users
  // ----------------------------
  const loadUsers = async () => {
    const res = await getAllDirectoryUsers();
    setUsers(res.data || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ----------------------------
  // Handle ADD / EDIT Save
  // ----------------------------
  const handleSubmit = async () => {
    const payload = { ...form };

    if (form.id) {
      await updateDirectoryUser(form.id, payload);
      alert("User updated successfully");
    } else {
      await addDirectoryUser(payload);
      alert("User added successfully");
    }

    setShowForm(false);
    resetForm();
    await loadUsers();
  };

  const resetForm = () =>
    setForm({
      id: null,
      firstName: "",
      lastName: "",
      phone: "",
      occupation: "",
      pincode: "",
      district: "",
      state: "",
      area: "",
    });

  // ----------------------------
  // Edit User
  // ----------------------------
  const onEdit = (user) => {
    setForm({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      occupation: user.occupation,
      pincode: user.pincode,
      district: user.district,
      state: user.state,
      area: user.area,
    });
    setShowForm(true);
  };

  // ----------------------------
  // Delete User
  // ----------------------------
  const onDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await deleteDirectoryUser(id);
    alert("User deleted");
    loadUsers();
  };

  // ----------------------------
  // Search by pincode
  // ----------------------------
  const handleSearch = async () => {
    if (!pincodeSearch.trim()) {
      alert("Enter pincode");
      return;
    }

    const res = await getDirectoryUsersByPincode(pincodeSearch.trim());
    setUsers(res.data || []);
  };

  return (
    <div className="gc-form-section">
      <h2>Village Directory</h2>

      {/* FILTER BAR */}
      <div className="gc-filter-row" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by pincode"
          value={pincodeSearch}
          onChange={(e) => setPincodeSearch(e.target.value)}
        />

        <button onClick={handleSearch}>Search</button>

        <button
          style={{ background: "#1a6d1a" }}
          onClick={loadUsers}
        >
          Show All
        </button>

        <button
          className="gc-submit"
          style={{ marginLeft: "auto" }}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add Village Directory
        </button>
      </div>

      {/* USER LIST GRID */}
      <div className="gc-cart-grid">
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="gc-cart">
              <h3 className="gc-cart-title">
                {u.firstName} {u.lastName}
              </h3>

              <p className="gc-cart-desc">{u.occupation || "No occupation"}</p>

              <p>📞 {u.phone}</p>
              <p>📍 Pincode: {u.pincode}</p>
              <p>🏙 District: {u.district}</p>
              <p>🌆 State: {u.state}</p>

              <div className="gc-cart-actions">
                <button className="gc-cart-edit" onClick={() => onEdit(u)}>
                  Edit
                </button>
                <button className="gc-cart-delete" onClick={() => onDelete(u.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="gc-modal-backdrop">
          <div className="gc-modal">
            <h3>{form.id ? "Edit User" : "Add User"}</h3>

            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) =>
                setForm({ ...form, lastName: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Occupation"
              value={form.occupation}
              onChange={(e) =>
                setForm({ ...form, occupation: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm({ ...form, pincode: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="District"
              value={form.district}
              onChange={(e) =>
                setForm({ ...form, district: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="State"
              value={form.state}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Area"
              value={form.area}
              onChange={(e) =>
                setForm({ ...form, area: e.target.value })
              }
            />

            <div className="gc-modal-actions">
              <button className="gc-submit" onClick={handleSubmit}>
                Save
              </button>
              <button className="gc-cancel" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillageDirectory;
