// import React from "react";
// import { deleteBanner } from "./bannerApi";
// import "./banner.css";

// const BannerList = ({ banners, onEdit, onRefresh }) => {
//   const handleDelete = async (id) => {
//     if (window.confirm("Delete this banner?")) {
//       await deleteBanner(id);
//       onRefresh();
//     }
//   };

//   return (
//     <div className="banner-table-wrapper">
//       <table className="banner-table">
//         <thead>
//           <tr>
//             <th>Event Name</th>
//             <th>Banner Title</th>
//             <th>Dates</th>
//             <th>Images</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {banners.map((b) => (
//             <tr key={b.id}>
//               <td>{b.eventName}</td>
//               <td>{b.bannerTitle}</td>
//               <td>
//                 {b.startDate} <br /> {b.endDate}
//               </td>

//               {/* MULTIPLE IMAGES */}
//               <td>
//                 <div className="table-image-row">
//                   {b.images?.map((img, i) => (
//                     <img key={i} src={img} alt="banner" />
//                   ))}
//                 </div>
//               </td>

//               <td className="actions">

//   <button
//     className="icon-btn edit"
//     title="Edit"
//     onClick={() => onEdit(b)}
//   >
//     ✏️
//   </button>

//   <button
//     className="icon-btn delete"
//     title="Delete"
//     onClick={() => handleDelete(b.id)}
//   >
//     🗑
//   </button>
// </td>

//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default BannerList;

// import React from "react";
// import { deleteBanner } from "./bannerApi";
// import "./banner.css";

// const BannerList = ({ banners, onEdit, onRefresh }) => {

//   /* ================= ROLE CONTROL ================= */
//   const role = localStorage.getItem("adminRole");

//   const canManage =
//     role === "SUPER_ADMIN" || role === "STATE_ADMIN";

//   const handleDelete = async (id) => {
//     if (window.confirm("Delete this banner?")) {
//       await deleteBanner(id);
//       onRefresh();
//     }
//   };
//  const [previewMedia, setPreviewMedia] = React.useState([]);
// const [startIndex, setStartIndex] = React.useState(0);
// const [mediaIndex, setMediaIndex] = React.useState({});

//   const [expandedTitles, setExpandedTitles] = React.useState({});

//   const toggleTitle = (id) => {
//   setExpandedTitles((prev) => ({
//     ...prev,
//     [id]: !prev[id],
//   }));
// };

//   return (
//     <div className="banner-table-wrapper">
//       <table className="banner-table">
//         <thead>
//           <tr>
//             <th>Event Name</th>
//             <th>Banner Title</th>
//             <th>Dates</th>
//             <th>Images</th>
//             {canManage && <th>Actions</th>}
//           </tr>
//         </thead>

      

//         <tbody>
//   {banners.map((b) => (
//     <tr key={b.id}>
//       <td>{b.eventName}</td>

//       {/* 🔥 Banner Title with View More / Less */}
//       <td>
//         {expandedTitles[b.id]
//           ? b.bannerTitle
//           : b.bannerTitle.split(" ").slice(0, 2).join(" ") +
//             (b.bannerTitle.split(" ").length > 2 ? "..." : "")}

//         {b.bannerTitle.split(" ").length > 2 && (
//           <span
//             className="view-more"
//             onClick={() => toggleTitle(b.id)}
//           >
//             {expandedTitles[b.id] ? "View Less" : "View More"}
//           </span>
//         )}
//       </td>

//       <td>
//         {b.startDate} <br /> {b.endDate}
//       </td>

//       {/* <td>
//         <div className="table-image-row">
//           {b.images?.map((img, i) => (
//             <img key={i} src={img} alt="banner" />
//           ))}
//         </div>
//       </td> */}
//   <td className="gc-media-cell">
//   {b.images?.length > 0 ? (() => {

//     const current = mediaIndex[b.id] || 0;
//     const currentFile = b.images[current];

//     return (
//       <div className="gc-mini-carousel">

//         {b.images.length > 1 && (
//           <button
//             className="gc-carousel-btn"
//             onClick={() =>
//               setMediaIndex((p) => ({
//                 ...p,
//                 [b.id]:
//                   current === 0 ? b.images.length - 1 : current - 1,
//               }))
//             }
//           >
//             ‹
//           </button>
//         )}

//         <div
//           className="gc-carousel-preview"
//           onClick={() => {
//             setPreviewMedia(b.images);
//             setStartIndex(current);
//           }}
//         >
//           <img
//             src={currentFile}
//             className="gc-table-image"
//             alt="banner"
//           />
//         </div>

//         {b.images.length > 1 && (
//           <button
//             className="gc-carousel-btn"
//             onClick={() =>
//               setMediaIndex((p) => ({
//                 ...p,
//                 [b.id]:
//                   current === b.images.length - 1 ? 0 : current + 1,
//               }))
//             }
//           >
//             ›
//           </button>
//         )}

//       </div>
//     );

//   })() : (
//     "—"
//   )}
// </td>

//       {canManage && (
//         <td className="actions">
//           <button
//             className="icon-btn edit"
//             title="Edit"
//             onClick={() => onEdit(b)}
//           >
//             Edit
//           </button>

//           <button
//             className="icon-btn delete"
//             title="Delete"
//             onClick={() => handleDelete(b.id)}
//           >
//             Delete
//           </button>
//         </td>
//       )}
//     </tr>
//   ))}
// </tbody>

//       </table>


// {previewMedia.length > 0 && (
//   <div
//     className="gc-image-modal"
//     onClick={() => setPreviewMedia([])}
//   >
//     <div
//       className="gc-gallery"
//       onClick={(e) => e.stopPropagation()}
//       ref={(el) => {
//         if (el && el.children[startIndex]) {
//           el.children[startIndex].scrollIntoView({
//             behavior: "smooth",
//             inline: "center",
//           });
//         }
//       }}
//     >
//       {previewMedia.map((img, index) => (
//         <img
//           key={index}
//           src={img}
//           className="gc-gallery-image"
//           alt="preview"
//         />
//       ))}
//     </div>
//   </div>
// )}
 
//     </div>
//   );
// };

// export default BannerList;

import React from "react";
import { deleteBanner } from "./bannerApi";
import "./bannerList.css";

const BannerList = ({ banners, onEdit, onRefresh }) => {

  const role = localStorage.getItem("adminRole");
  const canManage =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const handleDelete = async (id) => {
    if (window.confirm("Delete this banner?")) {
      await deleteBanner(id);
      onRefresh();
    }
  };

  // ✅ States
  const [previewMedia, setPreviewMedia] = React.useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = React.useState(0);
  const [mediaIndex, setMediaIndex] = React.useState({});
  const [expandedTitles, setExpandedTitles] = React.useState({});

  const toggleTitle = (id) => {
    setExpandedTitles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="bm-wrapper">
      <table className="bm-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Banner Title</th>
            <th>Dates</th>
            <th>Images</th>
            {canManage && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {banners.map((b) => (
            <tr key={b.id}>
              <td>{b.eventName}</td>

              <td>
                {expandedTitles[b.id]
                  ? b.bannerTitle
                  : b.bannerTitle.split(" ").slice(0, 2).join(" ") +
                    (b.bannerTitle.split(" ").length > 2 ? "..." : "")}

                {b.bannerTitle.split(" ").length > 2 && (
                  <span
                    className="bm-view-more"
                    onClick={() => toggleTitle(b.id)}
                  >
                    {expandedTitles[b.id] ? "View Less" : "View More"}
                  </span>
                )}
              </td>

              <td>
                {b.startDate} - {b.endDate}
              </td>

              <td className="bm-media-cell">
                {b.images?.length > 0 ? (() => {

                  const current = mediaIndex[b.id] || 0;
                  const currentFile = b.images[current];

                  return (
                    <div className="bm-carousel">

                      {b.images.length > 1 && (
                        <button
                          className="bm-carousel-btn"
                          onClick={() =>
                            setMediaIndex((p) => ({
                              ...p,
                              [b.id]:
                                current === 0
                                  ? b.images.length - 1
                                  : current - 1,
                            }))
                          }
                        >
                          ‹
                        </button>
                      )}

                      <div
                        className="bm-preview"
                        onClick={() => {
                          setPreviewMedia(b.images);
                          setCurrentPreviewIndex(current);
                        }}
                      >
                        <img
                          src={currentFile}
                          className="bm-table-img"
                          alt="banner"
                        />
                      </div>

                      {b.images.length > 1 && (
                        <button
                          className="bm-carousel-btn"
                          onClick={() =>
                            setMediaIndex((p) => ({
                              ...p,
                              [b.id]:
                                current === b.images.length - 1
                                  ? 0
                                  : current + 1,
                            }))
                          }
                        >
                          ›
                        </button>
                      )}
                    </div>
                  );

                })() : (
                  "—"
                )}
              </td>

              {canManage && (
                <td className="bm-actions">
                  <button
                    className="bm-btn bm-edit"
                    onClick={() => onEdit(b)}
                  >
                    Edit
                  </button>

                  <button
                    className="bm-btn bm-delete"
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Single Image Modal */}
      {previewMedia.length > 0 && (
        <div
          className="bm-modal"
          onClick={() => setPreviewMedia([])}
        >
          <div
            className="bm-preview-container"
            onClick={(e) => e.stopPropagation()}
          >

            {previewMedia.length > 1 && (
              <button
                className="bm-modal-btn"
                onClick={() =>
                  setCurrentPreviewIndex((prev) =>
                    prev === 0 ? previewMedia.length - 1 : prev - 1
                  )
                }
              >
                ‹
              </button>
            )}

            <img
              src={previewMedia[currentPreviewIndex]}
              className="bm-modal-image"
              alt="preview"
            />

            {previewMedia.length > 1 && (
              <button
                className="bm-modal-btn"
                onClick={() =>
                  setCurrentPreviewIndex((prev) =>
                    prev === previewMedia.length - 1 ? 0 : prev + 1
                  )
                }
              >
                ›
              </button>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default BannerList;