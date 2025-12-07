import React, { useEffect, useState } from "react";
import { getAllUsers, getUserByPhone, deleteUserById } from "./userService";
import "./userManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchUser = async () => {
    if (!searchPhone.trim()) return loadUsers();

    try {
      const u = await getUserByPhone(searchPhone.trim());
      setUsers([u]);
    } catch {
      alert("User not found");
      loadUsers();
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;

    try {
      await deleteUserById(id);
      alert("User deleted");
      loadUsers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="section-card">
      <h2>User Management</h2>

      <div className="um-filter-row">
        <input
          type="text"
          placeholder="Search by phone..."
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <button className="search-btn" onClick={searchUser}>Search</button>
        <button className="search-btn" onClick={loadUsers}>Reset</button>
      </div>

      <table className="um-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Area</th>
            <th>Roles</th>
            <th>Verified</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.phone}</td>
              <td>{u.area}</td>
              <td>{u.roles}</td>
              <td>{u.verified ? "Yes" : "No"}</td>
              <td>
                <button className="delete-btn" onClick={() => deleteUser(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
