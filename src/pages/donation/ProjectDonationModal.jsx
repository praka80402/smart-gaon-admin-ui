import { useEffect, useState } from "react";
import api from "./services/axiosInstance";
import "./donation.css";

export default function ProjectDonationModal({ project, onClose }) {

  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);

  const load = async () => {
    if (!project) return;
    try {
      const res = await api.get(`/admin/donation/transactions/${project.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      const list = res.data || [];
      setDonations(list);
      setTotal(list.reduce((a, b) => a + (b.amount || 0), 0));
    } catch (err) {
      console.error("Failed to load donations", err.response?.data || err);
    }
  };

  useEffect(() => { load(); }, [project]);

  const verify = async (id, approved) => {
    try {
      await api.put(`/admin/donation/verify/${id}`, { approved }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });
      load();
    } catch {
      alert("Verification failed");
    }
  };

  const downloadCertificate = async (id) => {
    const res = await api.get(`/admin/donation/certificate/download/${id}`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `certificate-${id}.pdf`;
    link.click();
  };

  const uploadCertificate = async (txId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/admin/donation/certificate/upload/${txId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Certificate uploaded successfully");
      load();
    } catch {
      alert("Upload failed");
    }
  };

  if (!project) return null;

  const remaining = (project.targetAmount || 0) - total;
  const progress = project.targetAmount ? Math.min((total / project.targetAmount) * 100, 100) : 0;

  return (
    <div className="dm-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dm-modal">

        {/* Header */}
        <div className="dm-header">
          <div>
            <h2 className="dm-title">{project.title}</h2>
            <p className="dm-subtitle">Donation Transactions</p>
          </div>
          <button className="dm-close" onClick={onClose}>✕</button>
        </div>

        {/* Stats */}
        <div className="dm-stats">
          <div className="dm-stat">
            <span className="dm-stat-label">Target</span>
            <span className="dm-stat-value">₹{project.targetAmount || 0}</span>
          </div>
          <div className="dm-stat dm-stat-raised">
            <span className="dm-stat-label">Total Raised</span>
            <span className="dm-stat-value">₹{total}</span>
          </div>
          <div className="dm-stat dm-stat-remain">
            <span className="dm-stat-label">Remaining</span>
            <span className="dm-stat-value">₹{remaining}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="dm-progress-wrap">
          <div className="dm-progress-bar">
            <div className="dm-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="dm-progress-pct">{Math.round(progress)}%</span>
        </div>

        {/* Table */}
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="dm-empty">No donations yet</td>
                </tr>
              ) : (
                donations.map(d => (
                  <tr key={d.id}>
                    <td className="dm-donor-name">{d.name}</td>
                    <td>{d.phone}</td>
                    <td className="dm-amount">₹{d.amount}</td>
                    <td>
                      <span className={`dm-badge dm-badge-${d.status?.toLowerCase()}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <div className="dm-row-actions">
                        {d.status === "PENDING" && (
                          <>
                            <button className="dm-act-btn dm-approve" onClick={() => verify(d.id, true)}>Approve</button>
                            <button className="dm-act-btn dm-reject" onClick={() => verify(d.id, false)}>Reject</button>
                          </>
                        )}
                        {d.status === "VERIFIED" && (
                          <>
                            <button className="dm-act-btn dm-download" onClick={() => downloadCertificate(d.id)}>
                              ↓ Receipt
                            </button>
                            <label className="dm-act-btn dm-upload">
                              ↑ Certificate
                              <input
                                type="file"
                                accept=".pdf,.jpg,.png"
                                style={{ display: "none" }}
                                onChange={(e) => uploadCertificate(d.id, e.target.files[0])}
                              />
                            </label>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
