import React from "react";
import "./stay-enquiry.css";

const StayViewModal = ({ data, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h3>Stay Details</h3>

        <div className="modal-content">

          <p>
            <strong>Check In:</strong> {data.checkIn || "N/A"}
          </p>

          <p>
            <strong>Check Out:</strong> {data.checkOut || "N/A"}
          </p>

          <p>
            <strong>Message:</strong> {data.specialRequest || "No message"}
          </p>

        </div>

      </div>
    </div>
  );
};

export default StayViewModal;