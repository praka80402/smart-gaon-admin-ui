import { useEffect, useState, useCallback } from "react";
import {
  getAdminDonationsByProject,
  verifyDonation,
} from "./services/donationService";
import AssignBadge from "./AssignBadge";
import "./ProjectDonation.css";

const ProjectDonations = ({ projectId, onClose }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DONATIONS ================= */
  const load = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const res = await getAdminDonationsByProject(projectId);
      setDonations(res.data || []);
    } catch (e) {
      console.error("Failed to load donations", e);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    load();
  }, [load]);

  /* ================= VERIFY ================= */
  const verify = async (donationId) => {
    try {
      await verifyDonation(donationId);
      alert("Donation Verified ✅");
      load(); // reload table
    } catch (err) {
      alert("Verification Failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card wide">
        {/* CLOSE ICON */}
        <span className="modal-close" onClick={onClose}>
          ×
        </span>

        <h3>Project Donations</h3>

        {loading && <p>Loading...</p>}

        {!loading && donations.length === 0 && <p>No donations yet.</p>}

        {!loading && donations.length > 0 && (
          <table className="donation-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Project</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Verify</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d, index) => (
                <tr key={d.donationId}>
                  <td>{index + 1}</td>
                  <td>{d.userName}</td>
                  <td>{d.projectName}</td>
                  <td>{d.amount}</td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={
                        d.verified
                          ? "status-verified"
                          : "status-pending"
                      }
                    >
                      {d.verified ? "Verified" : "Pending"}
                    </span>
                  </td>

                  {/* VERIFY */}
                  <td>
                    {!d.verified ? (
                      <button
                        className="btn-verify"
                        onClick={() => verify(d.donationId)}
                      >
                        Verify
                      </button>
                    ) : (
                      "✓"
                    )}
                  </td>

                  {/* BADGE */}
                  <td>
                    {d.verified && d.userId ? (
                      <AssignBadge
                        userId={d.userId}
                        badgeName="GOLD"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProjectDonations;
