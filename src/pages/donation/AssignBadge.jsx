import React from "react";
import { assignBadge } from "./services/donationService";
import badgeImg from "../../assets/badge.png"; // ✅ CORRECT IMPORT
import "./donation.css";

const AssignBadge = ({ userId, badgeName = "GOLD", reason }) => {
  const assign = async () => {
    try {
      await assignBadge({
        userId,
        badgeName,
        reason,
      });
      alert("Gold Badge Assigned ✅");
    } catch (err) {
      alert("Failed to assign badge");
    }
  };

  return (
    <img
      src={badgeImg}
      alt="Gold Badge"
      className="badge-icon clickable"
      onClick={assign}
      title="Give Gold Badge"
    />
  );
};

export default AssignBadge;
