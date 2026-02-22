import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUserById,
  getAllAdmins,
  createAdmin,
  searchUsers,
  getUsersByPincode,
  enableUser,
  disableUser
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

        {/* <button className="danger-btn" onClick={() => setShowModal(true)}>
          Add Admin
        </button> */}

        {canAddAdmin && (
  <button className="danger-btn" onClick={() => setShowModal(true)}>
    Add Admin
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

            
            {/* <label>Role</label>
        <select
name="role"
value={adminForm.role}
onChange={(e) =>
setAdminForm({
...adminForm,
role: e.target.value,
state: "",
district: "",
pincode: ""
})
}

>

  <option value="">Select Role</option>

{isSuper && <option value="STATE_ADMIN">State Admin</option>}
{(isSuper || isState) && <option value="DISTRICT_ADMIN">District Admin</option>}
{(isSuper || isState || isDistrict) && <option value="VILLAGE_ADMIN">Village Admin</option>}
{isSuper && <option value="ACCOUNT_ADMIN">Account Admin</option>} </select>


{adminForm.role && adminForm.role !== "ACCOUNT_ADMIN" && (
<> 
<label>State</label>
<select
name="state"
value={adminForm.state}
onChange={(e) =>
setAdminForm({ ...adminForm, state: e.target.value })
}
> <option value="">Select State</option> <option value="Bihar">Bihar</option> <option value="UP">UP</option> <option value="Maharashtra">Maharashtra</option> <option value="Jharkhand">Jharkhand</option> <option value="Gujarat">Gujarat</option> </select>
</>
)}

{(adminForm.role === "DISTRICT_ADMIN" || adminForm.role === "VILLAGE_ADMIN") && (
<> <label>District</label>
<input
name="district"
value={adminForm.district}
onChange={(e) =>
setAdminForm({ ...adminForm, district: e.target.value })
}
/>
</>
)}


{adminForm.role === "VILLAGE_ADMIN" && (
<> <label>Pincode</label>
<input
name="pincode"
value={adminForm.pincode || ""}
onChange={(e) =>
setAdminForm({ ...adminForm, pincode: e.target.value })
}
/>
</>

)} */}
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
</select>

{/* STATE */}
{adminForm.role && adminForm.role !== "ACCOUNT_ADMIN" && (
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

    if (adminForm.role !== "ACCOUNT_ADMIN" && !adminForm.state) {
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
    await createAdmin(adminForm);

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
    alert("Failed to create admin");
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
