
// import React, { useEffect, useState } from "react";
// import {
//   getAllUsers,
//   deleteUserById,
//   getAllAdmins,
//   createAdmin,
//   searchUsers,
//   getUsersByPincode,
// } from "./userService";

// import "./userManagement.css";

// const UserManagement = () => {
//   const [activeTab, setActiveTab] = useState("users");
//   const [users, setUsers] = useState([]);
//   const [admins, setAdmins] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [confirmDelete, setConfirmDelete] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState(null);

//   const [page, setPage] = useState(1);
//   const pageSize = 5;

//   // FILTER STATES
//   const [filterState, setFilterState] = useState("");
//   const [filterPincode, setFilterPincode] = useState("");

//   const [adminForm, setAdminForm] = useState({
//     email: "",
//     password: "",
//     role: "",
//     state: "",
//     district: "",
//   });

//   useEffect(() => {
//     loadUsers();
//     loadAdmins();
//   }, []);

//   const loadUsers = async () => {
//     try {
//       const data = await getAllUsers();
//       setUsers(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const loadAdmins = async () => {
//     try {
//       const data = await getAllAdmins();
//       setAdmins(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // ---------------- APPLY FILTER ----------------
//   const applyFilter = async () => {
//     try {
//       if (filterPincode) {
//         const data = await getUsersByPincode(filterPincode);
//         setUsers(data);
//         return;
//       }

//       if (filterState) {
//         const data = await searchUsers("", filterState);
//         setUsers(data);
//         return;
//       }

//       loadUsers();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const resetFilter = () => {
//     setFilterState("");
//     setFilterPincode("");
//     loadUsers();
//   };

//   const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);
//   const totalPages = Math.ceil(users.length / pageSize);

//   const openAddAdminModal = () => {
//     setAdminForm({
//       email: "",
//       password: "",
//       role: "",
//       state: "",
//       district: "",
//     });
//     setShowModal(true);
//   };

//   const handleAdminChange = (e) => {
//     setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
//   };

//   const saveAdmin = async () => {
//     if (!adminForm.email || !adminForm.password || !adminForm.role) {
//       alert("Email, Password & Role are required");
//       return;
//     }

//     try {
//       await createAdmin(adminForm);
//       alert("Admin created successfully!");
//       setShowModal(false);
//       loadAdmins();
//     } catch {
//       alert("Failed to create admin");
//     }
//   };

//   // ----------------- DELETE USER -------------------
//   const askDeleteUser = (id) => {
//     setSelectedUserId(id);
//     setConfirmDelete(true);
//   };

//   const confirmDeleteUser = async () => {
//     try {
//       await deleteUserById(selectedUserId);
//       loadUsers();
//     } catch {
//       alert("Failed to delete user");
//     }
//     setConfirmDelete(false);
//   };

//   const renderUsers = () => (
//     <div>
//       {/* FILTER BAR */}
//       <div className="filter-row">
//         <select
//           className="filter-input"
//           value={filterState}
//           onChange={(e) => setFilterState(e.target.value)}
//         >
//           <option value="">Filter by State</option>
//           <option value="Bihar">Bihar</option>
//           <option value="UP">UP</option>
//           <option value="Jharkhand">Jharkhand</option>
//           <option value="Gujarat">Gujarat</option>
//           <option value="Maharashtra">Maharashtra</option>
//         </select>

//         <input
//           className="filter-input"
//           placeholder="Search by Pincode"
//           value={filterPincode}
//           onChange={(e) => setFilterPincode(e.target.value)}
//         />

//         <button className="primary-btn" onClick={applyFilter}>
//           Apply
//         </button>

//         <button className="danger-btn" onClick={resetFilter}>
//           Reset
//         </button>
//       </div>

//       <table className="um-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Phone</th>
//             <th>District</th>
//             <th>Area</th>
//             <th>State</th>
//             <th>Pincode</th>
//             <th>Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {paginatedUsers.map((u) => (
//             <tr key={u.id}>
//               <td>{u.firstName} {u.lastName}</td>
//               <td>{u.phone}</td>
//               <td>{u.district}</td>
//               <td>{u.area}</td>
//               <td>{u.state}</td>
//               <td>{u.pincode}</td>

//               <td>
//                 <span className={u.isDeleted ? "badge-disabled" : "badge-active"}>
//                   {u.isDeleted ? `Deleted by ${u.deletedBy}` : "Active"}
//                 </span>
//               </td>

//               <td>
//                 <button
//                   className="remove-btn"
//                   onClick={() => askDeleteUser(u.id)}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {paginatedUsers.length === 0 && (
//             <tr>
//               <td colSpan="8" className="empty-row">
//                 No users found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {totalPages > 1 && (
//         <div className="pagination">
//           {Array.from({ length: totalPages }, (_, i) => (
//             <button
//               key={i}
//               className={page === i + 1 ? "page-btn active" : "page-btn"}
//               onClick={() => setPage(i + 1)}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}
      
//     </div>
//   );

//   const renderAdmins = () => (
//     <table className="um-table">
//       <thead>
//         <tr>
//           <th>Email</th>
//           <th>Role</th>
//           <th>State</th>
//           <th>District</th>
//         </tr>
//       </thead>
//       <tbody>
//         {admins.map((a) => (
//           <tr key={a.id}>
//             <td>{a.email}</td>
//             <td>{a.role}</td>
//             <td>{a.state || "-"}</td>
//             <td>{a.district || "-"}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );

//   return (
//     <div className="um-container">
//       <h2>User & Admin Management</h2>

//       <div className="um-btn-row">
//         <button
//           className={activeTab === "users" ? "primary-btn" : "page-btn"}
//           onClick={() => setActiveTab("users")}
//         >
//           User List
//         </button>

//         <button
//           className={activeTab === "admins" ? "primary-btn" : "page-btn"}
//           onClick={() => setActiveTab("admins")}
//         >
//           Admin List
//         </button>

//         <button className="danger-btn" onClick={openAddAdminModal}>
//           Add Admin
//         </button>
//       </div>

//       {activeTab === "users" && renderUsers()}
//       {activeTab === "admins" && renderAdmins()}

//       {/* Add Admin Modal */}
//       {showModal && (
//         <div className="modal-overlay">
//           <div className="modal-card">
//             <h3>Add Admin</h3>

//             <label>Email</label>
//             <input name="email" value={adminForm.email} onChange={handleAdminChange} />

//             <label>Password</label>
//             <input
//               type="password"
//               name="password"
//               value={adminForm.password}
//               onChange={handleAdminChange}
//             />

//             <label>Role</label>
//             <select
//               name="role"
//               value={adminForm.role}
//               onChange={handleAdminChange}
//             >
//               <option value="">Select Role</option>
//               <option value="STATE_ADMIN">State Admin</option>
//               <option value="DISTRICT_ADMIN">District Admin</option>
//             </select>

//             {(adminForm.role === "STATE_ADMIN" ||
//               adminForm.role === "DISTRICT_ADMIN") && (
//               <>
//                 <label>State</label>
//                 <select
//                   name="state"
//                   value={adminForm.state}
//                   onChange={handleAdminChange}
//                 >
//                   <option value="">Select State</option>
//                   <option value="Bihar">Bihar</option>
//                   <option value="UP">UP</option>
//                   <option value="Maharashtra">Maharashtra</option>
//                   <option value="Jharkhand">Jharkhand</option>
//                   <option value="Gujarat">Gujarat</option>
//                 </select>
//               </>
//             )}

//             {adminForm.role === "DISTRICT_ADMIN" && (
//               <>
//                 <label>District</label>
//                 <input
//                   name="district"
//                   value={adminForm.district}
//                   onChange={handleAdminChange}
//                 />
//               </>
//             )}

//             <div className="modal-actions">
//               <button className="primary-btn" onClick={saveAdmin}>
//                 Save
//               </button>
//               <button className="danger-btn" onClick={() => setShowModal(false)}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {confirmDelete && (
//         <div className="modal-overlay">
//           <div className="modal-card small">
//             <h3>Confirm Delete</h3>
//             <p>Are you sure you want to delete this user?</p>

//             <div className="modal-actions">
//               <button className="primary-btn" onClick={confirmDeleteUser}>
//                 Yes, Delete
//               </button>
//               <button className="danger-btn" onClick={() => setConfirmDelete(false)}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;

import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUserById,
  getAllAdmins,
  createAdmin,
  searchUsers,
  getUsersByPincode,
} from "./userService";

import "./userManagement.css";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Filters
  const [filterState, setFilterState] = useState("");
  const [filterPincode, setFilterPincode] = useState("");

  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    role: "",
    state: "",
    district: "",
  });

  useEffect(() => {
    loadUsers();
    loadAdmins();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdmins = async () => {
    try {
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Reset pagination when users change
  useEffect(() => {
    setPage(1);
  }, [users]);

  // -------------------- APPLY FILTER ----------------------
  const applyFilters = async () => {
    try {
      if (filterPincode) {
        const data = await getUsersByPincode(filterPincode);
        setUsers(data);
        return;
      }

      if (filterState) {
        const data = await searchUsers("", filterState);
        setUsers(data);
        return;
      }

      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- RESET FILTER ----------------------
  const resetFilters = () => {
    setFilterState("");
    setFilterPincode("");
    loadUsers();
  };

  // ---------------- DELETE USER ----------------
  const askDeleteUser = (id) => {
    setSelectedUserId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await deleteUserById(selectedUserId);
      loadUsers();
    } catch {
      alert("Failed to delete user");
    }
    setConfirmDelete(false);
  };

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  const renderUsers = () => (
    <div>
      {/* FILTER BAR */}
      <div className="filter-row">
        <select
          className="filter-input"
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
        >
          <option value="">Filter by State</option>
          <option value="Bihar">Bihar</option>
          <option value="UP">UP</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Jharkhand">Jharkhand</option>
          <option value="Gujarat">Gujarat</option>
        </select>

        <input
          className="filter-input"
          placeholder="Search by Pincode"
          value={filterPincode}
          onChange={(e) => setFilterPincode(e.target.value)}
        />

        <button className="primary-btn" onClick={applyFilters}>Apply</button>
        <button className="danger-btn" onClick={resetFilters}>Reset</button>
      </div>

      {/* TABLE */}
      <table className="um-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>District</th>
            <th>Area</th>
            <th>State</th>
            <th>Pincode</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.firstName} {u.lastName}</td>
              <td>{u.phone}</td>
              <td>{u.district}</td>
              <td>{u.area}</td>
              <td>{u.state}</td>
              <td>{u.pincode}</td>

              <td>
                <span className={u.isDeleted ? "badge-disabled" : "badge-active"}>
                  {u.isDeleted ? `Deleted by ${u.deletedBy}` : "Active"}
                </span>
              </td>

              <td>
                <button
                  className="remove-btn"
                  onClick={() => askDeleteUser(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {paginatedUsers.length === 0 && (
            <tr>
              <td colSpan="8" className="empty-row">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          className="page-btn"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "page-btn active" : "page-btn"}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );

  // ---------------- RENDER ADMIN TABLE ----------------
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

        <button className="danger-btn" onClick={() => setShowModal(true)}>
          Add Admin
        </button>
      </div>

      {activeTab === "users" && renderUsers()}
      {activeTab === "admins" && renderAdmins()}

      {/* ADD ADMIN MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Add Admin</h3>

            <label>Email</label>
            <input
              name="email"
              value={adminForm.email}
              onChange={(e) =>
                setAdminForm({ ...adminForm, email: e.target.value })
              }
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={adminForm.password}
              onChange={(e) =>
                setAdminForm({ ...adminForm, password: e.target.value })
              }
            />

            <label>Role</label>
            <select
              name="role"
              value={adminForm.role}
              onChange={(e) =>
                setAdminForm({ ...adminForm, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              <option value="STATE_ADMIN">State Admin</option>
              <option value="DISTRICT_ADMIN">District Admin</option>
            </select>

            {(adminForm.role === "STATE_ADMIN" ||
              adminForm.role === "DISTRICT_ADMIN") && (
              <>
                <label>State</label>
                <select
                  name="state"
                  value={adminForm.state}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, state: e.target.value })
                  }
                >
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
                <input
                  name="district"
                  value={adminForm.district}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, district: e.target.value })
                  }
                />
              </>
            )}

            <div className="modal-actions">
              <button className="primary-btn" onClick={() => createAdmin(adminForm)}>
                Save
              </button>
              <button className="danger-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-card small">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this user?</p>

            <div className="modal-actions">
              <button className="primary-btn" onClick={confirmDeleteUser}>
                Yes, Delete
              </button>
              <button
                className="danger-btn"
                onClick={() => setConfirmDelete(false)}
              >
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
