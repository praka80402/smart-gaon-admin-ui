// import React, { useEffect, useState } from "react";
// //import axios from "axios";
// import "./problem.css"; // Create this file
// import {api} from "../../services/apiConfig"

// export default function AdminProblems() {
//   const [problems, setProblems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedId, setExpandedId] = useState(null);


//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const fetchProblems = async () => {
//     try {
//       const res = await api.get(`/api/admin/problems`);
//       setProblems(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load problems");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStatus = async (id, status) => {
//     try {
//       await api.put(
//         `/api/admin/problems/${id}/status`,
//         { status }
//       );
//       fetchProblems();
//     } catch (err) {
//       console.error(err);
//       alert("Update failed");
//     }
//   };

//   const deleteProblem = async (id) => {
//     if (!window.confirm("Delete this report?")) return;

//     try {
//       await api.delete(`/api/admin/problems/${id}`);
//       fetchProblems();
//     } catch (err) {
//       console.error(err);
//       alert("Delete failed");
//     }
//   };

//   const toggleDesc = (id) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   return (
//     <div className="problem-container">

//       <h1 className="problem-title">Problem Reports</h1>

//       <div className="problem-table-wrapper">

//         <table className="problem-table">

//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Category</th>
//               <th>Title</th>
//               <th>Description</th>
//               <th>Location</th>
//               <th>Status</th>
//               <th>Media</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {problems.map((item) => {
//               const expanded = expandedId === item.reportId;

//               return (
//                 <tr key={item.reportId}>

//                   <td>{item.reportId}</td>
//                   <td>{item.category}</td>
//                   <td>{item.title}</td>

//                   <td>
//                     <div
//                       className={
//                         expanded
//                           ? "desc-full"
//                           : "desc-short"
//                       }
//                     >
//                       {item.description}
//                     </div>

//                     <button
//                       className="view-btn"
//                       onClick={() => toggleDesc(item.reportId)}
//                     >
//                       {expanded ? "View Less" : "View More"}
//                     </button>
//                   </td>

//                   <td>{item.location}</td>

//                   <td>
//                     <select
//                       value={item.status}
//                       onChange={(e) =>
//                         updateStatus(item.reportId, e.target.value)
//                       }
//                       className="status-select"
//                     >
//                       <option>Submitted</option>
//                       <option>In Progress</option>
//                       <option>Resolved</option>
//                       <option>Closed</option>
//                     </select>
//                   </td>

//                   <td>
//                     <div className="media-box">
//                       {item.mediaAttachments?.map((url, i) => (
//                         <img
//                           key={i}
//                           src={url}
//                           alt="media"
//                         />
//                       ))}
//                     </div>
//                   </td>

//                   <td>
//                     <button
//                       className="delete-btn"
//                       onClick={() =>
//                         deleteProblem(item.reportId)
//                       }
//                     >
//                       Delete
//                     </button>
//                   </td>

//                 </tr>
//               );
//             })}

//             {problems.length === 0 && (
//               <tr>
//                 <td colSpan="8" className="empty">
//                   No reports found
//                 </td>
//               </tr>
//             )}

//           </tbody>

//         </table>

//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import "./problem.css";
import { api } from "../../services/apiConfig";

export default function AdminProblems() {

  const role = localStorage.getItem("adminRole");

  const canManage =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

    const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchProblems();
  }, []);

useEffect(() => {
    setPage(1);
  }, [problems]);


  const fetchProblems = async () => {
    try {
      const res = await api.get(`/api/admin/problems`);
      setProblems(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {

    if (!canManage) {
      alert("You are not authorized to update status.");
      return;
    }

    try {
      await api.put(
        `/api/admin/problems/${id}/status`,
        { status }
      );
      fetchProblems();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const deleteProblem = async (id) => {

    if (!canManage) {
      alert("You are not authorized to delete.");
      return;
    }

    if (!window.confirm("Delete this report?")) return;

    try {
      await api.delete(`/api/admin/problems/${id}`);
      fetchProblems();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const toggleDesc = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalPages = Math.ceil(problems.length / pageSize);

  const paginatedProblems = problems.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="problem-container">

      <h1 className="problem-title">Problem Reports</h1>

      <div className="problem-table-wrapper">

        <table className="problem-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Status</th>
              <th>Media</th>
              {canManage && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {/* {problems.map((item) => { */}

            {paginatedProblems.map((item) => {
              const expanded = expandedId === item.reportId;

              return (
                <tr key={item.reportId}>

                  <td>{item.reportId}</td>
                  <td>{item.category}</td>
                  <td>{item.title}</td>

                  <td>
                    <div className={expanded ? "desc-full" : "desc-short"}>
                      {item.description}
                    </div>

                    <button
                      className="view-btn"
                      onClick={() => toggleDesc(item.reportId)}
                    >
                      {expanded ? "View Less" : "View More"}
                    </button>
                  </td>

                  <td>{item.location}</td>

                  <td>
                    <select
                      value={item.status}
                      disabled={!canManage}
                      onChange={(e) =>
                        updateStatus(item.reportId, e.target.value)
                      }
                      className="status-select"
                    >
                      <option>Submitted</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Closed</option>
                    </select>
                  </td>

                  <td>
                    <div className="media-box">
                      {item.mediaAttachments?.map((url, i) => (
  <img
    key={i}
    src={url}
    alt="media"
    style={{
      width: "60px",
      height: "60px",
      objectFit: "cover",
      cursor: "pointer",
      borderRadius: "6px",
      marginRight: "5px"
    }}
    onClick={() => setSelectedImage(url)}
  />
))}
                      {/* {item.mediaAttachments?.map((url, i) => (
                        <img key={i} src={url} alt="media" />
                      ))} */}
                    </div>
                  </td>

                  {canManage && (
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteProblem(item.reportId)}
                      >
                        Delete
                      </button>
                    </td>
                  )}

                </tr>
              );
            })}

            {/* {problems.length === 0 && ( */}
              {paginatedProblems.length === 0 && (
              <tr>
                <td colSpan={canManage ? "8" : "7"} className="empty">
                  No reports found
                </td>
              </tr>
            )}

          </tbody>

        </table>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              marginTop: "20px"
            }}
          >
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{
                padding: "6px 14px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Prev
            </button>

            <span>Page {page} of {totalPages}</span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              style={{
                padding: "6px 14px",
                backgroundColor: "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Next
            </button>
          </div>
        )}

        {/* ------------------ */}
{selectedImage && (
  <div
    onClick={() => setSelectedImage(null)}   // Click outside closes
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      cursor: "pointer"
    }}
  >
    <img
      src={selectedImage}
      alt="Full View"
      style={{
        maxWidth: "90%",
        maxHeight: "90%",
        borderRadius: "8px",
        cursor: "default"
      }}
      onClick={(e) => e.stopPropagation()}  // Prevent closing when clicking image
    />
  </div>
)}


      </div>
    </div>
  );
}