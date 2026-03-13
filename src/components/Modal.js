// import "./Modal.css";

// export default function Modal({ open, onClose, children ,className = ""}) {
//   if (!open) return null;

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div
//        className={`modal-content ${className}`}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button className="modal-close" onClick={onClose}>✖</button>
//         {children}
//       </div>
//     </div>
//   );
// }

import "./Modal.css";
import ReactDOM from "react-dom";

export default function Modal({ open, onClose, children, className = "" }) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{ overflow: "visible" }}
      >
        <button className="modal-close" onClick={onClose}>✖</button>
        {children}
      </div>
    </div>,
    document.body
  );
}