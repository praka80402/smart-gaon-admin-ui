import React, { useEffect } from "react";
import "./Modal.css";

const Modal = ({ open, onClose, children, className = "" }) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box ${className}`.trim()}
        onClick={(e) => e.stopPropagation()} // prevent overlay click from closing
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
