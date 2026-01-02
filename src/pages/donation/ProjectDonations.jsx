// import React, { useEffect, useState } from "react";
// import {
//   getDonationsByProject,
//   verifyDonation,
// } from "./services/donationService";
// import AssignBadge from "./AssignBadge";
// import "./donation.css";

// const ProjectDonations = ({ projectId }) => {
//   const [donations, setDonations] = useState([]);

//   useEffect(() => {
//     getDonationsByProject(projectId)
//       .then((res) => setDonations(res.data));
//   }, [projectId]);

//   const verify = async (donationId) => {
//     await verifyDonation(donationId);
//     alert("Donation Verified");
//   };

//   return (
//     <div>
//       <h4 className="donation-subtitle">Donations</h4>

//       {donations.map((d) => (
//         <div
//           key={d.id}
//           className={`donation-card ${d.verified ? "verified" : ""}`}
//         >
//           <div className="donation-info">User ID: {d.userId}</div>
//           <div className="donation-info">Amount: ₹{d.amount}</div>

//           <div
//             className={
//               d.verified ? "status-verified" : "status-pending"
//             }
//           >
//             {d.verified ? "Verified" : "Pending"}
//           </div>

//           {!d.verified && (
//             <button
//               className="btn-danger"
//               onClick={() => verify(d.id)}
//             >
//               Verify Donation
//             </button>
//           )}

//           {d.verified && <AssignBadge userId={d.userId} />}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ProjectDonations;


import React, { useEffect, useState } from "react";
import {
  getDonationsByProject,
  verifyDonation,
} from "./services/donationService";
import AssignBadge from "./AssignBadge";
import "./donation.css";

const ProjectDonations = ({ projectId, onClose }) => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    getDonationsByProject(projectId)
      .then((res) => setDonations(res.data));
  }, [projectId]);

  const verify = async (donationId) => {
    await verifyDonation(donationId);
    alert("Donation Verified");

    // refresh list
    const res = await getDonationsByProject(projectId);
    setDonations(res.data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Donations</h3>

        {donations.length === 0 && <p>No donations yet.</p>}

        {donations.map((d) => (
          <div
            key={d.id}
            className={`donation-card ${d.verified ? "verified" : ""}`}
          >
            <p><b>User ID:</b> {d.userId}</p>
            <p><b>Amount:</b> ₹{d.amount}</p>
            <p>
              <b>Status:</b>{" "}
              <span className={d.verified ? "status-verified" : "status-pending"}>
                {d.verified ? "Verified" : "Pending"}
              </span>
            </p>

            {!d.verified && (
              <button
                className="btn-danger"
                onClick={() => verify(d.id)}
              >
                Verify
              </button>
            )}

            {d.verified && <AssignBadge userId={d.userId} />}
          </div>
        ))}

        <button className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ProjectDonations;
