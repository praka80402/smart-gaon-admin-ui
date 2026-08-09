import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUserById,
  getAllAdmins,
  createAdmin,
  searchUsers,
  getUsersByPincode,
  enableUser,
  disableUser,
  getSchoolsForCompetition,
  createSchoolAdmin
} from "./userService";


import "./userManagement.css";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
    const adminRole = localStorage.getItem("adminRole");
    const adminState = localStorage.getItem("adminState");
  const isSuper = adminRole === "SUPER_ADMIN";
  const isState = adminRole === "STATE_ADMIN";
  const canAddAdmin =
  adminRole === "SUPER_ADMIN" ||
  adminRole === "STATE_ADMIN";
  const isDistrict = adminRole === "DISTRICT_ADMIN";
  // const isVillage = adminRole === "VILLAGE_ADMIN";

const canManageUsers = isSuper || isState;
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // ADD SCHOOL ADMIN
  const [showSchoolAdminModal, setShowSchoolAdminModal] = useState(false);
  const [schools, setSchools] = useState([]);
  const [schoolAdminForm, setSchoolAdminForm] = useState({
    school: "",
    email: "",
    password: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // ADMIN PAGINATION
  const [adminPage, setAdminPage] = useState(1);
  const adminPageSize = 5;

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

  // Reset pagination when list changes
  useEffect(() => {
    setPage(1);
  }, [users]);

 useEffect(() => {
  if (isState && showModal && adminState) {
    setAdminForm((prev) => ({
      ...prev,
      state: adminState
    }));
  }
}, [isState, showModal, adminState]);

  // Load schools when "Add School Admin" modal opens
  useEffect(() => {
    if (showSchoolAdminModal) {
      loadSchools();
    }
  }, [showSchoolAdminModal]);

  const loadSchools = async () => {
    try {
      const data = await getSchoolsForCompetition();
      setSchools(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSchoolAdmin = async () => {
    try {
      if (!schoolAdminForm.school || !schoolAdminForm.email || !schoolAdminForm.password) {
        alert("Please fill all fields");
        return;
      }

      const result = await createSchoolAdmin(schoolAdminForm);
      if (result && typeof result === "string" && !result.toLowerCase().includes("success")) {
        alert(result);
        return;
      }

      alert("School Admin created successfully");
      setShowSchoolAdminModal(false);
      setSchoolAdminForm({ school: "", email: "", password: "" });
      loadAdmins();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data || "Failed to create school admin";
      alert(typeof msg === "string" ? msg : "Failed to create school admin");
    }
  };

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

  // ---------------- ENABLE / DISABLE ----------------
  const handleEnable = async (id) => {
    try {
      await enableUser(id);
      loadUsers();
    } catch {
      alert("Failed to enable user");
    }
  };

  const handleDisable = async (id) => {
    try {
      await disableUser(id);
      loadUsers();
    } catch {
      alert("Failed to disable user");
    }
  };

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(users.length / pageSize);
  const getPagination = () => {
  let pages = [];

  if (page > 3) {
    pages.push(1, "...");
  }

  for (let i = page - 2; i <= page + 2; i++) {
    if (i > 0 && i <= totalPages) {
      pages.push(i);
    }
  }

  if (page < totalPages - 2) {
    pages.push("...", totalPages);
  }

  return pages;
};
  const paginatedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  // ADMIN PAGINATION LOGIC
const adminTotalPages = Math.ceil(admins.length / adminPageSize);

const paginatedAdmins = admins.slice(
  (adminPage - 1) * adminPageSize,
  adminPage * adminPageSize
);

const getAdminPagination = () => {
  let pages = [];

  if (adminPage > 3) {
    pages.push(1, "...");
  }

  for (let i = adminPage - 2; i <= adminPage + 2; i++) {
    if (i > 0 && i <= adminTotalPages) {
      pages.push(i);
    }
  }

  if (adminPage < adminTotalPages - 2) {
    pages.push("...", adminTotalPages);
  }

  return pages;
};
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
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Gujarat">Gujarat</option>
        </select>

        <input
          className="filter-input"
          placeholder="Search by Pincode"
          value={filterPincode}
          onChange={(e) => setFilterPincode(e.target.value)}
        />

        <button className="primary-btn" onClick={applyFilters}>
          Apply
        </button>
        <button className="danger-btn" onClick={resetFilters}>
          Reset
        </button>
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
                {u.isDeleted ? (
                  <span className="badge-disabled">Deleted</span>
                ) : u.accountEnabled ? (
                  <span className="badge-active">Active</span>
                ) : (
                  <span className="badge-disabled">Disabled</span>
                )}
              </td>

           <td className="action-buttons">
  {canManageUsers ? (
    !u.isDeleted && (
      <>
        {u.accountEnabled ? (
          <button
            className="danger-btn small"
            onClick={() => handleDisable(u.id)}
          >
            Disable
          </button>
        ) : (
          <button
            className="primary-btn small"
            onClick={() => handleEnable(u.id)}
          >
            Enable
          </button>
        )}

        <button
          className="remove-btn small"
          onClick={() => askDeleteUser(u.id)}
        >
          Delete
        </button>
      </>
    )
  ) : (
    <span style={{ color: "gray", fontWeight: "500" }}>NA</span>
  )}
</td>
 {/* <td className="action-buttons">
                {!u.isDeleted && (
                  <>
                    {u.accountEnabled ? (
                      <button
                        className="danger-btn small"
                        onClick={() => handleDisable(u.id)}
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        className="primary-btn small"
                        onClick={() => handleEnable(u.id)}
                      >
                        Enable
                      </button>
                    )}

                    <button
                      className="remove-btn small"
                      onClick={() => askDeleteUser(u.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td> */}
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

{getPagination().map((p, index) =>
  p === "..." ? (
    <span key={index}>...</span>
  ) : (
    <button
      key={index}
      className={page === p ? "page-btn active" : "page-btn"}
      onClick={() => setPage(p)}
    >
      {p}
    </button>
  )
)}
        
         

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
  <div>

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
        {paginatedAdmins.map((a) => (
          <tr key={a.id}>
            <td>{a.email}</td>
            <td>{a.role}</td>
            <td>{a.state || "-"}</td>
            <td>{a.district || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* ADMIN PAGINATION */}
    <div className="pagination">

      <button
        className="page-btn"
        disabled={adminPage === 1}
        onClick={() => setAdminPage(adminPage - 1)}
      >
        Prev
      </button>

      {getAdminPagination().map((p, index) =>
        p === "..." ? (
          <span key={index}>...</span>
        ) : (
          <button
            key={index}
            className={
              adminPage === p
                ? "page-btn active"
                : "page-btn"
            }
            onClick={() => setAdminPage(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="page-btn"
        disabled={adminPage === adminTotalPages}
        onClick={() => setAdminPage(adminPage + 1)}
      >
        Next
      </button>

    </div>

  </div>
);
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
        {paginatedAdmins.map((a) => (
          <tr key={a.id}>
            <td>{a.email}</td>
            <td>{a.role}</td>
            <td>{a.state || "-"}</td>
            <td>{a.district || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>

  return (
     <div className="user-container">

    <div className="um-container">
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  }}
>
  <h2>User & Admin Management</h2>

  <button
    onClick={() => window.history.back()}
    style={{
      background: "rgb(227, 246, 246)",
      color: "#ab0808",
      border: "none",
      width: "38px",
      height: "38px",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: "bold"
    }}
  >
    ✕
  </button>
</div>

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
          {/* <button className="danger-btn" onClick={() => setShowModal(true)}>
          Add Admin
        </button> */}

        {canAddAdmin && (
  <button className="danger-btn" onClick={() => setShowModal(true)}>
    Add Admin
  </button>
)}

        {canAddAdmin && (
  <button className="danger-btn" onClick={() => setShowSchoolAdminModal(true)}>
    Add School Admin
  </button>
)}
      </div>

      {activeTab === "users" && renderUsers()}
      {activeTab === "admins" && renderAdmins()}

      {/* ADD ADMIN MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Add Admin</h3>
             
              <div className="modal-body">

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
  onChange={(e) => {
    const selectedRole = e.target.value;

    setAdminForm({
      ...adminForm,
      role: selectedRole,
      state: isState ? adminState : "",   // 🔥 keep state for State Admin
      district: "",
      pincode: ""
    });
  }}
>
  <option value="">Select Role</option>

  {isSuper && <option value="STATE_ADMIN">State Admin</option>}
  {(isSuper || isState) && (
    <option value="DISTRICT_ADMIN">District Admin</option>
  )}
  {(isSuper || isState || isDistrict) && (
    <option value="VILLAGE_ADMIN">Village Admin</option>
  )}
  {isSuper && <option value="ACCOUNT_ADMIN">Account Admin</option>}
  {(isSuper || isState) && <option value="JUDGE">Judge</option>}
</select>

{/* STATE */}
{adminForm.role && adminForm.role !== "ACCOUNT_ADMIN" && adminForm.role !== "JUDGE" && (
  <>
    <label>State</label>
    <select
      name="state"
      value={adminForm.state}
      disabled={isState}  
      onChange={(e) =>
        setAdminForm({ ...adminForm, state: e.target.value })
      }
    >
      <option value="">Select State</option>
      <option value="Bihar">Bihar</option>
      <option value="UP">UP</option>
      <option value="Maharashtra">Maharashtra</option>
       <option value="Madhya Pradesh">Madhya Pradesh</option>
      <option value="Jharkhand">Jharkhand</option>
      <option value="Gujarat">Gujarat</option>
    </select>
  </>
)}

{/* DISTRICT */}
{(adminForm.role === "DISTRICT_ADMIN" ||
  adminForm.role === "VILLAGE_ADMIN") && (
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

{/* PINCODE */}
{adminForm.role === "VILLAGE_ADMIN" && (
  <>
    <label>Pincode</label>
    <input
      name="pincode"
      value={adminForm.pincode || ""}
      onChange={(e) =>
        setAdminForm({ ...adminForm, pincode: e.target.value })
      }
    />
  </>
)}

</div>


                    <div className="modal-actions">

             <button
            className="primary-btn"
               onClick={async () => {
        try {


    // REQUIRED FIELDS
    if (!adminForm.email || !adminForm.password || !adminForm.role) {
      alert("Please fill required fields");
      return;
    }

    if (adminForm.role !== "ACCOUNT_ADMIN" && adminForm.role !== "JUDGE" && !adminForm.state) {
      alert("State required");
      return;
    }

    if (
      (adminForm.role === "DISTRICT_ADMIN" || adminForm.role === "VILLAGE_ADMIN") &&
      !adminForm.district
    ) {
      alert("District required");
      return;
    }

    if (adminForm.role === "VILLAGE_ADMIN" && !adminForm.pincode) {
      alert("Pincode required");
      return;
    }

    // CREATE ADMIN
    const result = await createAdmin(adminForm);
    if (result && typeof result === "string" && !result.toLowerCase().includes("success")) {
      alert(result);
      return;
    }

    alert("Admin created successfully");

    // CLOSE MODAL & RESET
    setShowModal(false);
    setAdminForm({
      email: "",
      password: "",
      role: "",
      state: "",
      district: "",
      pincode: ""
    });

    // REFRESH ADMIN LIST
    loadAdmins();
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.message || err.response?.data || "Failed to create admin";
    alert(typeof msg === 'string' ? msg : "Failed to create admin");
  }
}}


>

Save


  </button>

<button
className="danger-btn"
onClick={() => setShowModal(false)}

>


Cancel


  </button>

</div>

          </div>
        </div>
      )}

      {/* ADD SCHOOL ADMIN MODAL */}
      {showSchoolAdminModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Add School Admin</h3>

            <div className="modal-body">
              <label>School</label>
              <select
                value={schoolAdminForm.school}
                onChange={(e) =>
                  setSchoolAdminForm({ ...schoolAdminForm, school: e.target.value })
                }
              >
                <option value="">Select School</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>

              <label>Username</label>
              <input
                name="email"
                value={schoolAdminForm.email}
                onChange={(e) =>
                  setSchoolAdminForm({ ...schoolAdminForm, email: e.target.value })
                }
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                value={schoolAdminForm.password}
                onChange={(e) =>
                  setSchoolAdminForm({ ...schoolAdminForm, password: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button className="primary-btn" onClick={handleSaveSchoolAdmin}>
                Save
              </button>
              <button
                className="danger-btn"
                onClick={() => {
                  setShowSchoolAdminModal(false);
                  setSchoolAdminForm({ school: "", email: "", password: "" });
                }}
              >
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
     </div>
  );
};

export default UserManagement;
