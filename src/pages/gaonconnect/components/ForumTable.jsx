import React, { useState } from "react";
import "./forum.css";

const truncate = (t, n = 80) =>
  t?.length > n ? t.slice(0, n) + "..." : t;

const isVideo = (url) =>
  /\.(mp4|webm|ogg)$/i.test(url);

const ForumTable = ({ items, onDelete, onViewReports }) => {

  // ✅ For Image Preview
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <>

      {/* ================= IMAGE MODAL ================= */}
      {previewImage && (
        <div
          className="gc-image-modal"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="Preview" />
        </div>
      )}


      {/* ================= TABLE ================= */}
      <table className="gc-table">

        <thead>
          <tr>
            <th>User</th>
            <th>Phone</th>
            <th>Media</th>
            <th>Title</th>
            <th>Content</th>
            <th>Category</th>
            <th>Likes</th>
            <th>Comments</th>
            <th>Reports</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>


        <tbody>

          {items.length === 0 && (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                No posts found
              </td>
            </tr>
          )}


          {items.map((item) => {

            const media = item.mediaAttachments || [];
            const image = media.find((m) => !isVideo(m));

            return (
              <tr key={item.postId}>

                <td>
                  {item.user
                    ? `${item.user.firstName} ${item.user.lastName}`
                    : "—"}
                </td>

                <td>{item.user?.phone || "—"}</td>


                {/* ================= MEDIA ================= */}
                <td>
                  {image ? (
                    <img
                      src={image}
                      alt="post"
                      className="gc-table-image"
                      style={{ cursor: "pointer" }}
                      onClick={() => setPreviewImage(image)}
                    />
                  ) : (
                    "—"
                  )}
                </td>


                <td>{item.title}</td>
                <td>{truncate(item.content)}</td>
                <td>{item.category || "—"}</td>

                <td>{item.likeCount ?? 0}</td>
                <td>{item.commentCount ?? 0}</td>


                {/* ================= REPORT ================= */}
                <td>
                  <b>{Number(item.reportCount ?? 0)}</b>

                  {Number(item.reportCount ?? 0) > 0 && (
                    <button
                      className="gc-btn-view"
                      onClick={() => onViewReports(item.postId)}
                    >
                      View
                    </button>
                  )}
                </td>


                <td>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "—"}
                </td>


                {/* ================= ACTION ================= */}
                <td>
                  <button
                    className="gc-btn-delete"
                    onClick={() => onDelete(item.postId)}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>
    </>
  );
};

export default ForumTable;


// import React from "react";
// import "./forum.css";

// const truncate = (t, n = 80) =>
//   t?.length > n ? t.slice(0, n) + "..." : t;

// const isVideo = (url) =>
//   /\.(mp4|webm|ogg)$/i.test(url);

// const ForumTable = ({ items, onDelete, onViewReports }) => {
//   return (
//     <table className="gc-table">
//       <thead>
//         <tr>
//           <th>User</th>
//           <th>Phone</th>
//           <th>Media</th>
//           <th>Title</th>
//           <th>Content</th>
//           <th>Category</th>
//           <th>Likes</th>
//           <th>Comments</th>
//           <th>Reports</th>
//           <th>Created</th>
//           <th>Action</th>
//         </tr>
//       </thead>

//       <tbody>
//         {items.length === 0 && (
//           <tr>
//             <td colSpan="11" style={{ textAlign: "center" }}>
//               No posts found
//             </td>
//           </tr>
//         )}

//         {items.map((item) => {
//           const media = item.mediaAttachments || [];
//           const image = media.find((m) => !isVideo(m));

//           return (
//             <tr key={item.postId}>
//               <td>
//                 {item.user
//                   ? `${item.user.firstName} ${item.user.lastName}`
//                   : "—"}
//               </td>

//               <td>{item.user?.phone || "—"}</td>

//               {/* <td>
//                 {image ? (
//                   <img src={image} alt="post" className="gc-table-image" />
//                 ) : (
//                   "—"
//                 )}

//               </td> */}
//               <td>
//   {image ? (
//     <a href={image} target="_blank" rel="noopener noreferrer">
//       <img
//         src={image}
//         alt="post"
//         className="gc-table-image"
//         style={{ cursor: "pointer" }}
//       />
//     </a>
//   ) : (
//     "—"
//   )}
// </td>


//               <td>{item.title}</td>
//               <td>{truncate(item.content)}</td>
//               <td>{item.category || "—"}</td>

//               <td>{item.likeCount ?? 0}</td>
//               <td>{item.commentCount ?? 0}</td>

//               <td>
//                 <b>{Number(item.reportCount ?? 0)}</b>
//                 {Number(item.reportCount ?? 0) > 0 && (
//                   <button
//                     className="gc-btn-view"
//                     onClick={() => onViewReports(item.postId)}
//                   >
//                     View
//                   </button>
//                 )}
//               </td>

//               <td>
//                 {item.createdAt
//                   ? new Date(item.createdAt).toLocaleDateString()
//                   : "—"}
//               </td>

//               <td>
//                 <button
//                   className="gc-btn-delete"
//                   onClick={() => onDelete(item.postId)}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           );
//         })}
//       </tbody>
//     </table>
//   );
// };

// export default ForumTable;

