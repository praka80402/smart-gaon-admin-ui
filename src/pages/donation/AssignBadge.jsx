import React from "react";
import { assignBadge } from "./services/donationService";
import "./donation.css";

const AssignBadge = ({ userId, badgeName = "GOLD" }) => {

  const assign = async () => {
    try {
      await assignBadge(userId, badgeName);
      alert("Gold Badge Assigned ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to assign badge ❌");
    }
  };

  return (
    <button
      className="badge-btn"
      onClick={assign}
      type="button"
    >
      Assign {badgeName} Badge
    </button>
  );
};

export default AssignBadge;
