import React, { useState, useEffect, useCallback } from "react";
import {
  getAllDirectoryUsers,
  deleteDirectoryUser,
} from "../services/directoryService";

import {
  getAllOfficers,
  addOfficer,
  updateOfficer,
  deleteOfficer,
} from "../services/officerService";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

import "./directory.css";

const Directory = () => {
  const role = localStorage.getItem("adminRole");
  const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [activeTab, setActiveTab] = useState("village");
  const pageSize = 5;

  /* ── Village Users ─────────────────────────────────────────── */
  const [users, setUsers] = useState([]);
  const [villagePage, setVillagePage] = useState(1);

  const loadUsers = useCallback(async () => {
    try {
      const res = await getAllDirectoryUsers();
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    }
  }, []);

  /* ── Officers ──────────────────────────────────────────────── */
  const [officers, setOfficers] = useState([]);
  const [officerPage, setOfficerPage] = useState(1);

  const loadOfficers = useCallback(async () => {
    try {
      const res = await getAllOfficers();
      setOfficers(res.data || []);
    } catch {
      setOfficers([]);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadOfficers();
  }, [loadUsers, loadOfficers]);

  /* ── Search / Filter state ─────────────────────────────────── */
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const handleSearch = () => {
    setAppliedSearch(searchText.trim().toLowerCase());
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setVillagePage(1);
    setOfficerPage(1);
  };

  const handleClear = () => {
    setSearchText("");
    setFromDate("");
    setToDate("");
    setAppliedSearch("");
    setAppliedFrom("");
    setAppliedTo("");
    setVillagePage(1);
    setOfficerPage(1);
  };

  /* ── Filter helpers ────────────────────────────────────────── */
  const inDateRange = (dateStr) => {
    if (!appliedFrom && !appliedTo) return true;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (appliedFrom && d < new Date(appliedFrom)) return false;
    if (appliedTo && d > new Date(appliedTo + "T23:59:59")) return false;
    return true;
  };

  const filteredUsers = users.filter((u) => {
    const fullName   = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const phone      = (u.phone || "").toLowerCase();
    const occupation = (u.occupation || "").toLowerCase();
    const district   = (u.district || "").toLowerCase();
    const state      = (u.state || "").toLowerCase();
    const matchText  =
      !appliedSearch ||
      fullName.includes(appliedSearch) ||
      phone.includes(appliedSearch) ||
      occupation.includes(appliedSearch) ||
      district.includes(appliedSearch) ||
      state.includes(appliedSearch);
    return matchText && inDateRange(u.createdAt);
  });

  const filteredOfficers = officers.filter((o) => {
    const name       = (o.name || "").toLowerCase();
    const phone      = (o.phone || "").toLowerCase();
    const department = (o.department || "").toLowerCase();
    const district   = (o.district || "").toLowerCase();
    const state      = (o.state || "").toLowerCase();
    const matchText  =
      !appliedSearch ||
      name.includes(appliedSearch) ||
      phone.includes(appliedSearch) ||
      department.includes(appliedSearch) ||
      district.includes(appliedSearch) ||
      state.includes(appliedSearch);
    return matchText && inDateRange(o.createdAt);
  });

  /* ── Pagination ────────────────────────────────────────────── */
  const villageTotalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedVillageUsers = filteredUsers.slice(
    (villagePage - 1) * pageSize,
    villagePage * pageSize
  );

  const officerTotalPages = Math.ceil(filteredOfficers.length / pageSize) || 1;
  const paginatedOfficers = filteredOfficers.slice(
    (officerPage - 1) * pageSize,
    officerPage * pageSize
  );

  const totalRecords =
    activeTab === "village" ? filteredUsers.length : filteredOfficers.length;

  /* ── Delete Village User ───────────────────────────────────── */
  const onDeleteUser = async (id) => {
    if (!canManage) return;
    if (!window.confirm("Delete this user?")) return;
    await deleteDirectoryUser(id);
    loadUsers();
  };

  /* ── Officer Form ──────────────────────────────────────────── */
  const emptyForm = {
    id: null, name: "", department: "",
    phone: "", district: "", state: "",
  };

  const [officerForm, setOfficerForm] = useState(emptyForm);
  const [showOfficerForm, setShowOfficerForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const openAddForm = () => {
    setOfficerForm(emptyForm);
    setFormError("");
    setShowOfficerForm(true);
  };

  const openEditForm = (o) => {
    setOfficerForm(o);
    setFormError("");
    setShowOfficerForm(true);
  };

  const closeForm = () => {
    setShowOfficerForm(false);
    setFormError("");
  };

  const handleFormChange = (e) => {
    setOfficerForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOfficerSubmit = async () => {
    if (!canManage) return;
    const { name, department, phone, district, state } = officerForm;
    if (!name || !department || !phone || !district || !state) {
      setFormError("Please fill all fields.");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      if (officerForm.id) {
        await updateOfficer(officerForm.id, officerForm);
      } else {
        await addOfficer(officerForm);
        await addDoc(collection(db, "notifications"), {
          title: "New Government Official",
          message: `${name} (${department}) added for ${district}`,
          type: "officer",
          district,
          createdAt: serverTimestamp(),
        });
      }
      closeForm();
      loadOfficers();
    } catch {
      setFormError("Operation failed. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Delete Officer ────────────────────────────────────────── */
  const deleteOfficerHandler = async (id) => {
    if (!canManage) return;
    if (!window.confirm("Delete this officer?")) return;
    await deleteOfficer(id);
    loadOfficers();
  };

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className="new-directory-container">

      {/* HEADER BOX */}
      <div className="directory-header-box">

        {/* Row 1: Title left, subtitle right */}
        <div className="directory-header-row">
          <h1 className="directory-heading">Directory</h1>
          <p className="directory-subheading">
            Manage and moderate village directory records.
          </p>
        </div>

        {/* Row 2: Tabs left, Stats right */}
        <div className="directory-top-bar">
          <div className="directory-tab-wrapper">
            <button
              className={`directory-switch-btn ${activeTab === "village" ? "active-directory-btn" : ""}`}
              onClick={() => { setActiveTab("village"); setVillagePage(1); }}
            >
              Village Directory
            </button>

            <button
              className={`directory-switch-btn ${activeTab === "officer" ? "active-directory-btn" : ""}`}
              onClick={() => { setActiveTab("officer"); setOfficerPage(1); }}
            >
              Government Officials
            </button>
          </div>

          <div className="directory-stats-card">
            <div className="directory-icon-box">📁</div>
            <div>
              <span>Total Records</span>
              <h2>{totalRecords}</h2>
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH BAR */}
      <div className="directory-search-wrapper">
        <input
          type="text"
          placeholder="Search name, phone, occupation, district, state..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <button className="directory-search-btn" onClick={handleSearch}>
          Search
        </button>
        <button className="directory-clear-btn" onClick={handleClear}>
          Clear
        </button>
      </div>

      {/* VILLAGE DIRECTORY TAB */}
      {activeTab === "village" && (
        <div className="directory-table-card">
          <div className="directory-table-wrapper">
            <table className="modern-directory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Occupation</th>
                  <th>District</th>
                  <th>State</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedVillageUsers.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="directory-empty-row">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paginatedVillageUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.phone}</td>
                      <td>{u.occupation || "—"}</td>
                      <td>{u.district}</td>
                      <td>{u.state}</td>
                      {canManage && (
                        <td>
                          <div className="directory-action-btns">
                            <button
                              className="delete-btn"
                              onClick={() => onDeleteUser(u.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="modern-pagination">
            <button
              disabled={villagePage === 1}
              onClick={() => setVillagePage((p) => p - 1)}
            >
              Previous
            </button>
            <span>Page {villagePage} of {villageTotalPages}</span>
            <button
              disabled={villagePage === villageTotalPages}
              onClick={() => setVillagePage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* GOVERNMENT OFFICIALS TAB */}
      {activeTab === "officer" && (
        <div className="directory-table-card">
          {canManage && (
            <div className="officer-add-btn-wrapper">
              <button className="directory-search-btn" onClick={openAddForm}>
                + Add Officer
              </button>
            </div>
          )}

          <div className="directory-table-wrapper">
            <table className="modern-directory-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>District</th>
                  <th>State</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="directory-empty-row">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paginatedOfficers.map((o) => (
                    <tr key={o.id}>
                      <td>{o.name}</td>
                      <td>{o.department}</td>
                      <td>{o.phone}</td>
                      <td>{o.district}</td>
                      <td>{o.state}</td>
                      {canManage && (
                        <td>
                          <div className="directory-action-btns">
                            <button
                              className="view-btn"
                              onClick={() => openEditForm(o)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteOfficerHandler(o.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="modern-pagination">
            <button
              disabled={officerPage === 1}
              onClick={() => setOfficerPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>Page {officerPage} of {officerTotalPages}</span>
            <button
              disabled={officerPage === officerTotalPages}
              onClick={() => setOfficerPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT OFFICER MODAL */}
      {showOfficerForm && (
        <div className="directory-modal-backdrop" onClick={closeForm}>
          <div className="directory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="directory-modal-header">
              <h3>{officerForm.id ? "Edit Officer" : "Add Officer"}</h3>
              <button className="directory-modal-close" onClick={closeForm}>✕</button>
            </div>

            <div className="directory-modal-body">
              <div className="directory-form-grid">

                <div className="directory-form-group full-width">
                  <label>Name <span>*</span></label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={officerForm.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="directory-form-group full-width">
                  <label>Designation / Department <span>*</span></label>
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. BDO, Animal Health Dept."
                    value={officerForm.department}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="directory-form-group">
                  <label>Phone <span>*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit phone number"
                    value={officerForm.phone}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="directory-form-group">
                  <label>District <span>*</span></label>
                  <input
                    type="text"
                    name="district"
                    placeholder="District"
                    value={officerForm.district}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="directory-form-group full-width">
                  <label>State <span>*</span></label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={officerForm.state}
                    onChange={handleFormChange}
                  />
                </div>

              </div>

              {formError && (
                <p className="directory-form-error">{formError}</p>
              )}
            </div>

            <div className="directory-modal-footer">
              <button className="directory-clear-btn" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="directory-search-btn"
                onClick={handleOfficerSubmit}
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : officerForm.id
                  ? "Update Officer"
                  : "Add Officer"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Directory;
