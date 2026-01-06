import "./Modal.css";

export default function Modal({ open, onClose, children ,className = ""}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
       className={`modal-content ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>✖</button>
        {children}
      </div>
    </div>
  );
}
