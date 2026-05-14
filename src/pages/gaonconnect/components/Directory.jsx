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

  const canManage =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [activeTab, setActiveTab] = useState("village");

  const pageSize = 5;

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

  const [officers, setOfficers] = useState([]);
  const [officerPage, setOfficerPage] = useState(1);

  const [officerForm, setOfficerForm] = useState({
    id: null,
    name: "",
    department: "",
    phone: "",
    district: "",
    state: "",
  });

  const [showOfficerForm, setShowOfficerForm] = useState(false);

  const loadOfficers = async () => {
    try {
      const res = await getAllOfficers();
      setOfficers(res.data || []);
    } catch {
      setOfficers([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadOfficers();
  }, [loadUsers]);

  const villageTotalPages = Math.ceil(users.length / pageSize);

  const paginatedVillageUsers = users.slice(
    (villagePage - 1) * pageSize,
    villagePage * pageSize
  );

  const officerTotalPages = Math.ceil(officers.length / pageSize);

  const paginatedOfficers = officers.slice(
    (officerPage - 1) * pageSize,
    officerPage * pageSize
  );

  const onDeleteUser = async (id) => {
    if (!canManage) return;

    if (!window.confirm("Delete this user?")) return;

    await deleteDirectoryUser(id);
    loadUsers();
  };

  const handleOfficerSubmit = async () => {
    if (!canManage) return;

    try {
      if (officerForm.id) {
        await updateOfficer(officerForm.id, officerForm);
      } else {
        await addOfficer(officerForm);

        await addDoc(collection(db, "notifications"), {
          title: "New Government Official",
          message: `${officerForm.name} (${officerForm.department}) added for ${officerForm.district}`,
          type: "officer",
          district: officerForm.district,
          createdAt: serverTimestamp(),
        });
      }

      setOfficerForm({
        id: null,
        name: "",
        department: "",
        phone: "",
        district: "",
        state: "",
      });

      setShowOfficerForm(false);
      loadOfficers();
    } catch {
      alert("Operation failed");
    }
  };

  const deleteOfficerHandler = async (id) => {
    if (!canManage) return;

    if (!window.confirm("Delete this officer?")) return;

    await deleteOfficer(id);
    loadOfficers();
  };

  return (
    <div className="new-directory-container">
      <div className="directory-header-section">
        <h1>Directory</h1>
        <p>Manage and moderate village directory records.</p>
      </div>

      <div className="directory-top-bar">
        <div className="directory-tab-wrapper">
          <button
            className={`directory-switch-btn ${
              activeTab === "village" ? "active-directory-btn" : ""
            }`}
            onClick={() => setActiveTab("village")}
          >
            Village Directory
          </button>

          <button
            className={`directory-switch-btn ${
              activeTab === "officer" ? "active-directory-btn" : ""
            }`}
            onClick={() => setActiveTab("officer")}
          >
            Government Officials
          </button>
        </div>

        <div className="directory-stats-card">
          <div className="directory-icon-box">📁</div>

          <div>
            <span>Total Records</span>
            <h2>
              {activeTab === "village"
                ? users.length
                : officers.length}
            </h2>
          </div>
        </div>
      </div>

      <div className="directory-search-wrapper">
        <input type="text" placeholder="Search name or phone number..." />

        <input type="date" />

        <input type="date" />

        <button className="directory-search-btn">Search</button>

        <button className="directory-clear-btn">Clear</button>
      </div>

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
                {paginatedVillageUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.phone}</td>
                    <td>{u.occupation}</td>
                    <td>{u.district}</td>
                    <td>{u.state}</td>

                    {canManage && (
                      <td>
                        <div className="directory-action-btns">
                          <button className="view-btn">View</button>

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
                ))}
              </tbody>
            </table>
          </div>

          <div className="modern-pagination">
            <button
              disabled={villagePage === 1}
              onClick={() => setVillagePage((prev) => prev - 1)}
            >
              Previous
            </button>

            <span>
              Page {villagePage} of {villageTotalPages || 1}
            </span>

            <button
              disabled={
                villagePage === villageTotalPages ||
                villageTotalPages === 0
              }
              onClick={() => setVillagePage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === "officer" && (
        <div className="directory-table-card">
          {canManage && (
            <div className="officer-add-btn-wrapper">
              <button
                className="directory-search-btn"
                onClick={() => {
                  setOfficerForm({
                    id: null,
                    name: "",
                    department: "",
                    phone: "",
                    district: "",
                    state: "",
                  });

                  setShowOfficerForm(true);
                }}
              >
                Add Officer
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
                {paginatedOfficers.map((o) => (
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
                            onClick={() => {
                              setOfficerForm(o);
                              setShowOfficerForm(true);
                            }}
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="modern-pagination">
            <button
              disabled={officerPage === 1}
              onClick={() => setOfficerPage((prev) => prev - 1)}
            >
              Previous
            </button>

            <span>
              Page {officerPage} of {officerTotalPages || 1}
            </span>

            <button
              disabled={
                officerPage === officerTotalPages ||
                officerTotalPages === 0
              }
              onClick={() => setOfficerPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;