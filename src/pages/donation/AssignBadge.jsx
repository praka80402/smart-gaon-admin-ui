import { assignBadge } from "./services/donationService";
import "./donation.css";

const AssignBadge = ({ userId }) => {
  const assign = async () => {
    await assignBadge({
      userId,
      badgeName: "GOLD",
      reason: "Verified Donation",
    });

    alert("Badge Assigned");
  };

  return (
    <button className="badge-btn" onClick={assign}>
      Give Gold Badge
    </button>
  );
};

export default AssignBadge;
