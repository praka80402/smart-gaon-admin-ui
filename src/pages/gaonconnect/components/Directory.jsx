import React, { useState, useEffect, useCallback } from "react";
import {
  getAllDirectoryUsers,
  deleteDirectoryUser,
} from "../services/directoryService";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";   

import {
  getAllOfficers,
  addOfficer,
  updateOfficer,
  deleteOfficer,
} from "../services/officerService";

import "./directory.css";

const Directory = () => {

  const role = localStorage.getItem("adminRole");

  const canManage =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [activeTab, setActiveTab] = useState("village");

  const pageSize = 5;

  /* ================= VILLAGE DIRECTORY ================= */

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

  /* ================= GOVERNMENT OFFICERS ================= */

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

  /* ================= PAGINATION ================= */

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

  /* ================= ACTIONS ================= */

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
        alert("Officer updated");
      } else {
        await addOfficer(officerForm);

           await addDoc(collection(db, "notifications"), {
        title: "New Government Official",
        message: `${officerForm.name} (${officerForm.department}) added for ${officerForm.district}`,
        type: "officer",
        district: officerForm.district,
        createdAt: serverTimestamp(),
      });
        alert("Officer added");
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
    <div className="directory-container">
      <h2 className="directory-title">Directory</h2>

      {/* ================= TABS ================= */}
      <div className="directory-tabs">
        <button
          className={`directory-tab-btn ${
            activeTab === "village" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("village")}
        >
          Village Directory
        </button>

        <button
          className={`directory-tab-btn ${
            activeTab === "officer" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("officer")}
        >
        Government Officials
        </button>
      </div>

      {/* ================= VILLAGE DIRECTORY ================= */}
      {activeTab === "village" && (
        <div>
          <table className="directory-table">
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
                      <button
                        className="table-delete-btn"
                        onClick={() => onDeleteUser(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-wrapper">
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
      villagePage === villageTotalPages || villageTotalPages === 0
    }
    onClick={() => setVillagePage((prev) => prev + 1)}
  >
    Next
  </button>
</div>
        </div>
      )}

      {/* ================= GOVERNMENT OFFICERS ================= */}
      {activeTab === "officer" && (
        <div>

          {canManage && (
            <div className="officer-add-btn-wrapper">
              <button
                className="add-officer-btn"
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

          <table className="directory-table">
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
                      <button
                        className="table-edit-btn"
                        onClick={() => {
                          setOfficerForm(o);
                          setShowOfficerForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="table-delete-btn"
                        onClick={() => deleteOfficerHandler(o.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-wrapper">
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
      officerPage === officerTotalPages || officerTotalPages === 0
    }
    onClick={() => setOfficerPage((prev) => prev + 1)}
  >
    Next
  </button>
</div>

          

          {showOfficerForm && canManage && (
            <div className="modal-backdrop">
              <div className="modal-box">
                <h3>
                  {officerForm.id ? "Edit Officer" : "Add Officer"}
                </h3>

               
                  {[
        { label: "Name", key: "name" },
        { label: "Designation", key: "department" },
        { label: "Phone", key: "phone" },
        { label: "District", key: "district" },
        { label: "State", key: "state" }
      ].map((field) => (
        <input
          key={field.key}
          type="text"
          placeholder={field.label}
          value={officerForm[field.key] || ""}
          onChange={(e) =>
            setOfficerForm({
              ...officerForm,
              [field.key]: e.target.value,
            })
          }
        />
      ))}

                <div className="modal-actions">
                  <button onClick={handleOfficerSubmit}>Save</button>
                  <button onClick={() => setShowOfficerForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Directory;