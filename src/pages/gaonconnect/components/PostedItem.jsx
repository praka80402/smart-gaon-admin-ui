// import React, { useState } from "react";

// const truncate = (t, n = 150) =>
//   t?.length > n ? t.slice(0, n) + "..." : t;

// const PostedItem = ({ item, type, onEdit, onDelete }) => {
//   const [open, setOpen] = useState(false);

//   const title = item.title;
//   const body = item.summary || item.description;
//   const images = item.imageUrls || [];
//   const video = item.videoUrl;

//   return (
//     <div className="gc-cart">
//       <div className="gc-menu-wrapper">
//         <div className="gc-menu-dots" onClick={() => setOpen(!open)}>
//           ⋮
//         </div>

//         {open && (
//           <div className="gc-menu-dropdown">
//             {onEdit && (
//               <div onClick={() => { setOpen(false); onEdit(item); }}>
//                 ✏️ Edit
//               </div>
//             )}
//             {onDelete && (
//               <div className="delete" onClick={() => { setOpen(false); onDelete(item); }}>
//                 🗑 Delete
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {images.length > 0 && (
//         <img src={images[0]} className="gc-cart-image" />
//       )}

//       <h4>{title}</h4>
//       <p>{truncate(body)}</p>

//       {video && (
//         <video controls className="gc-cart-video" src={video} />
//       )}
//     </div>
//   );
// };

// export default PostedItem;
