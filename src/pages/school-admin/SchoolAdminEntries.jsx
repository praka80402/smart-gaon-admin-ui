import React, { useEffect, useState } from "react";
import { getSchoolCompetitionSubmissions } from "../userService";
import "./SchoolAdminEntries.css";

const SchoolAdminEntries = ({ onLogout }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const school = localStorage.getItem("adminSchool") || "";

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      // Backend scopes results to this admin's school via their token —
      // no client-side filtering needed or trusted here.
      const data = await getSchoolCompetitionSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    window.location.href = "/login";
  };

  return (
    <div className="sa-container">
      <div className="sa-card">
        <div className="sa-header">
          <div>
            <h2>School Competition Entries</h2>
            <p className="sa-subtitle">{school || "No school assigned"}</p>
          </div>
          <button className="sa-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {loading ? (
          <p className="sa-empty">Loading entries...</p>
        ) : submissions.length === 0 ? (
          <p className="sa-empty">No entries found for your school.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Competition ID</th>
                  <th>Student Name</th>
                  <th>Class &amp; Roll</th>
                  <th>Entry Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.submissionId}>
                    <td>{s.submissionId}</td>
                    <td>{s.competitionId}</td>
                    <td>{s.studentName}</td>
                    <td>{s.classGrade} (Roll: {s.rollNumber})</td>
                    <td>{s.entryTitle}</td>
                    <td>{s.status || "SUBMITTED"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolAdminEntries;
