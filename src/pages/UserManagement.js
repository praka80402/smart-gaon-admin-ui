// import React, { useEffect, useState } from "react";
// import { getAllUsers, getUserByPhone, deleteUserById } from "./userService";
// import "./userManagement.css";

// const UserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [searchPhone, setSearchPhone] = useState("");

//   const loadUsers = async () => {
//     try {
//       const data = await getAllUsers();
//       setUsers(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const searchUser = async () => {
//     if (!searchPhone.trim()) return loadUsers();

//     try {
//       const u = await getUserByPhone(searchPhone.trim());
//       setUsers([u]);
//     } catch {
//       alert("User not found");
//       loadUsers();
//     }
//   };

//   const deleteUser = async (id) => {
//     if (!window.confirm("Delete user?")) return;

//     try {
//       await deleteUserById(id);
//       alert("User deleted");
//       loadUsers();
//     } catch (err) {
//       alert("Delete failed");
//     }
//   };

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   return (
//     <div className="section-card">
//       <h2>User Management</h2>

//       <div className="um-filter-row">
//         <input
//           type="text"
//           placeholder="Search by phone..."
//           value={searchPhone}
//           onChange={(e) => setSearchPhone(e.target.value)}
//         />
//         <button className="search-btn" onClick={searchUser}>Search</button>
//         <button className="search-btn" onClick={loadUsers}>Reset</button>
//       </div>

//       <table className="um-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Phone</th>
//             <th>Area</th>
//             <th>Roles</th>
//             <th>Verified</th>
//             <th>Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {users.map(u => (
//             <tr key={u.id}>
//               <td>{u.firstName} {u.lastName}</td>
//               <td>{u.phone}</td>
//               <td>{u.area}</td>
//               <td>{u.roles}</td>
//               <td>{u.verified ? "Yes" : "No"}</td>
//               <td>
//                 <button className="delete-btn" onClick={() => deleteUser(u.id)}>
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {users.length === 0 && (
//             <tr>
//               <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
//                 No users found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default UserManagement;

import React, { useEffect, useState } from "react";
import "./userManagement.css";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users"); 
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    role: "",
    state: "",
    district: ""
  });

  // ============================
  // LOAD USERS
  // ============================
  const loadUsers = async () => {
    try {
      const res = await fetch("http://localhost:9090/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ============================
  // LOAD ADMINS
  // ============================
  const loadAdmins = async () => {
    try {
      const res = await fetch("http://localhost:9090/admin/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await res.json();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadAdmins();
  }, []);

  // PAGINATION
  const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(users.length / pageSize);

  // MODAL
  const openAddAdminModal = () => {
    setAdminForm({
      email: "",
      password: "",
      role: "",
      state: "",
      district: "",
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  // SAVE ADMIN
  const saveAdmin = async () => {
    if (!adminForm.email || !adminForm.password || !adminForm.role) {
      alert("Email, Password & Role are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:9090/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(adminForm),
      });

      const msg = await res.text();
      alert(msg);

      if (res.ok) {
        closeModal();
        loadAdmins();
      }
    } catch (err) {
      alert("Failed to create admin");
    }
  };

  // ============================
  // USER LIST TABLE
  // ============================
  const renderUsers = () => (
    <div>
      <table className="um-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Area</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.phone}</td>
              <td>{u.area}</td>
              <td>
                <span className={u.verified ? "badge-active" : "badge-disabled"}>
                  {u.verified ? "Active" : "Disabled"}
                </span>
              </td>

              <td>
                <button className="edit-btn">Edit</button>
                <button className={u.verified ? "disable-btn" : "enable-btn"}>
                  {u.verified ? "Disable" : "Enable"}
                </button>
                <button className="remove-btn">Remove</button>
              </td>
            </tr>
          ))}

          {paginatedUsers.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "page-btn active" : "page-btn"}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );

  // ============================
  // ADMIN LIST TABLE
  // ============================
  const renderAdmins = () => (
    <table className="um-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>State</th>
          <th>District</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((a) => (
          <tr key={a.id}>
            <td>{a.email}</td>
            <td>{a.role}</td>
            <td>{a.state || "-"}</td>
            <td>{a.district || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="um-container">
      <h2>User & Admin Management</h2>

      <div className="um-btn-row">
        <button
          className={activeTab === "users" ? "primary-btn" : "page-btn"}
          onClick={() => setActiveTab("users")}
        >
          User List
        </button>

        <button
          className={activeTab === "admins" ? "primary-btn" : "page-btn"}
          onClick={() => setActiveTab("admins")}
        >
          Admin List
        </button>

        <button className="danger-btn" onClick={openAddAdminModal}>
          Add Admin
        </button>
      </div>

      {activeTab === "users" && renderUsers()}
      {activeTab === "admins" && renderAdmins()}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Add Admin</h3>

            <label>Email</label>
            <input name="email" value={adminForm.email} onChange={handleAdminChange} />

            <label>Password</label>
            <input type="password" name="password" value={adminForm.password} onChange={handleAdminChange} />

            <label>Role</label>
            <select name="role" value={adminForm.role} onChange={handleAdminChange}>
              <option value="">Select role</option>
              <option value="STATE_ADMIN">State Admin</option>
              <option value="DISTRICT_ADMIN">District Admin</option>
            </select>

            {(adminForm.role === "STATE_ADMIN" || adminForm.role === "DISTRICT_ADMIN") && (
              <>
                <label>State</label>
                <select name="state" value={adminForm.state} onChange={handleAdminChange}>
                  <option value="">Select State</option>
                  <option value="Bihar">Bihar</option>
                  <option value="UP">UP</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </>
            )}

            {adminForm.role === "DISTRICT_ADMIN" && (
              <>
                <label>District</label>
                <input name="district" value={adminForm.district} onChange={handleAdminChange} placeholder="District" />
              </>
            )}

            <div className="modal-actions">
              <button className="primary-btn" onClick={saveAdmin}>
                Save
              </button>
              <button className="danger-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
