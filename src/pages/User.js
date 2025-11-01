import React, { useState, useEffect } from "react";
import "../App.css";

const Users = () => {
  // Dummy initial users (can be replaced later with API data)
  const initialUsers = [
    { name: "Ashok Kumar", email: "ashok@village.in", role: "Panchayat Admin", status: "active" },
    { name: "Sunita Sharma", email: "sunita@state.in", role: "State Admin", status: "active" },
    { name: "Prem Lal", email: "prem@doctor.in", role: "Doctor/Expert", status: "disabled" },
    { name: "Rita Devi", email: "rita@village.in", role: "Village User", status: "active" },
    { name: "Ajay Singh", email: "ajay@village.in", role: "Village User", status: "active" },
    { name: "Babulal Mehta", email: "bablu@village.in", role: "Block Admin", status: "disabled" },
    { name: "Raju Kumar", email: "raju@market.in", role: "Village User", status: "active" },
    { name: "Sita Devi", email: "sita@doctor.in", role: "Doctor/Expert", status: "active" },
    { name: "Mukesh Jha", email: "mukesh@state.in", role: "State Admin", status: "active" },
    { name: "Rekha Kumari", email: "rekha@village.in", role: "Panchayat Admin", status: "active" },
    { name: "Dilip Kumar", email: "dilip@village.in", role: "District Admin", status: "disabled" },
    { name: "Manoj Verma", email: "manoj@seva.in", role: "Block Admin", status: "active" },
  ];

  const [users, setUsers] = useState(initialUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "", status: "active" });

  const usersPerPage = 8;

  // Pagination calculations
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIdx = (currentPage - 1) * usersPerPage;
  const currentUsers = users.slice(startIdx, startIdx + usersPerPage);

  // Handle Add User button
  const handleAddUser = () => {
    setForm({ name: "", email: "", role: "", status: "active" });
    setEditingIndex(null);
    setShowModal(true);
  };

  // Handle Edit
  const handleEdit = (index) => {
    const user = users[index];
    setForm(user);
    setEditingIndex(index);
    setShowModal(true);
  };

  // Handle Delete
  const handleDelete = (index) => {
    if (window.confirm("Delete this user?")) {
      const updated = [...users];
      updated.splice(index, 1);
      setUsers(updated);
      if (currentPage > Math.ceil(updated.length / usersPerPage)) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Handle Disable/Enable
  const handleToggleStatus = (index) => {
    const updated = [...users];
    updated[index].status = updated[index].status === "active" ? "disabled" : "active";
    setUsers(updated);
  };

  // Handle Submit (Add/Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = [...users];
    if (editingIndex !== null) {
      updated[editingIndex] = form;
    } else {
      updated.push(form);
      setCurrentPage(Math.ceil(updated.length / usersPerPage)); // Go to last page
    }
    setUsers(updated);
    setShowModal(false);
  };

  return (
    <div className="panel">
      <h1 className="service-title">User & Role Management</h1>
      <div style={{ marginBottom: "17px" }}>
        <button id="userListBtn" className="btn" style={{ marginRight: "10px" }}>
          User List
        </button>
        <button id="addUser" className="btn" onClick={handleAddUser} style={{ background: "#d42929" }}>
          + Add User
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={startIdx + index}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td className="actions">
                <button className="edit" onClick={() => handleEdit(startIdx + index)}>Edit</button>
                <button className="disable" onClick={() => handleToggleStatus(startIdx + index)}>
                  {user.status === "active" ? "Disable" : "Enable"}
                </button>
                <button className="delete" onClick={() => handleDelete(startIdx + index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div id="paginationControls">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`btn ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              &times;
            </span>
            <h3>{editingIndex !== null ? "Edit User" : "Add User"}</h3>
            <form onSubmit={handleSubmit}>
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="">Select role</option>
                <option>Super Admin</option>
                <option>State Admin</option>
                <option>District Admin</option>
                <option>Block Admin</option>
                <option>Panchayat Admin</option>
                <option>Village User</option>
                <option>Doctor/Expert</option>
              </select>

              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>active</option>
                <option>disabled</option>
              </select>

              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
