// src/pages/gaonconnect/components/Directory.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  getAllDirectoryUsers,
  getDirectoryUsersByPincode,
  addDirectoryUser,
  updateDirectoryUser,
  deleteDirectoryUser,
} from "../services/directoryService";

import "../gaonconnect.css";

const Directory = () => {
  const [users, setUsers] = useState([]);
  const [pincodeSearch, setPincodeSearch] = useState("");

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

  // SAFE: loadUsers wrapped in useCallback
  const loadUsers = useCallback(async () => {
    try {
      const res = await getAllDirectoryUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  }, []);

  // SAFE useEffect
  useEffect(() => {
    loadUsers();   // ❌ do NOT return anything
  }, [loadUsers]);

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

  const handleSubmit = async () => {
    const payload = { ...form };

    try {
      if (form.id) {
        await updateDirectoryUser(form.id, payload);
        alert("User updated successfully");
      } else {
        await addDirectoryUser(payload);
        alert("User added successfully");
      }

      resetForm();
      setShowForm(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const onEdit = (user) => {
    setForm(user);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await deleteDirectoryUser(id);
      alert("User deleted");
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleSearch = async () => {
    if (!pincodeSearch.trim()) {
      alert("Enter pincode");
      return;
    }

    try {
      const res = await getDirectoryUsersByPincode(pincodeSearch.trim());
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    }
  };

  return (
    <div className="gc-form-section">
      <h2>Village Directory</h2>

      <div className="gc-filter-row" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by pincode"
          value={pincodeSearch}
          onChange={(e) => setPincodeSearch(e.target.value)}
        />

        <button onClick={handleSearch}>Search</button>

        <button onClick={loadUsers}>Show All</button>

        <button
          className="gc-submit"
          style={{ marginLeft: "auto" }}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add Directory User
        </button>
      </div>

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

      {showForm && (
        <div className="gc-modal-backdrop">
          <div className="gc-modal">
            <h3>{form.id ? "Edit User" : "Add User"}</h3>

            {/* FORM INPUTS */}
            {Object.keys(form).map((key) =>
              key !== "id" ? (
                <input
                  key={key}
                  type="text"
                  placeholder={key}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: e.target.value,
                    })
                  }
                />
              ) : null
            )}

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

export default Directory;
