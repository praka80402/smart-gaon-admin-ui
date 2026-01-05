import React, { useEffect, useState } from "react";
import {
  getAdminDonationsByProject,
  verifyDonation,
} from "./services/donationService";
import AssignBadge from "./AssignBadge";
import "./ProjectDonation.css";

const ProjectDonations = ({ projectId, onClose }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await getAdminDonationsByProject(projectId);
    setDonations(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const verify = async (donationId) => {
    await verifyDonation(donationId);
    alert("Donation Verified");
    load();
  };

  return (
   <div className="modal-overlay">
  <div className="modal-card wide">
    
    {/* ❌ CLOSE ICON */}
   <span className="modal-close" onClick={onClose}>
  X
</span>

    {/* <span className="modal-close" onClick={() => setModal(false)}>
              ✕
            </span> */}

    <h3>Project Donations</h3>

    {donations.length === 0 && <p>No donations yet.</p>}

    {donations.length > 0 && (
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
              <td>
                <span
                  className={
                    d.verified ? "status-verified" : "status-pending"
                  }
                >
                  {d.verified ? "Verified" : "Pending"}
                </span>
              </td>
              <td>{d.verified ? "✓" : "-"}</td>
         <td>
  {d.verified && d.userId ? (
    <AssignBadge
      userId={d.userId}
      badgeName="GOLD"
      reason={`Verified donation for ${d.projectName}`}
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
