// import React, { useEffect, useState } from "react";
// //import axios from "axios";
// import "./suggestion.css";
// import {api} from "../../services/apiConfig"


// export default function AdminSuggestions() {
  
//   const [suggestions, setSuggestions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Store which row is expanded
//   const [expandedId, setExpandedId] = useState(null);


//   useEffect(() => {
//     fetchSuggestions();
//   }, []);

//   const fetchSuggestions = async () => {
//     try {
//       const res = await api.get(`/api/admin/suggestions`);
//       setSuggestions(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load suggestions");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateStatus = async (id, status) => {
//     try {
//       await api.put(
//         `/api/admin/suggestions/${id}/status`,
//         { status }
//       );

//       fetchSuggestions();
//     } catch (err) {
//       console.error(err);
//       alert("Update failed");
//     }
//   };

//   const deleteSuggestion = async (id) => {
//     if (!window.confirm("Are you sure you want to delete?")) return;

//     try {
//       await api.delete(`/api/admin/suggestions/${id}`);
//       fetchSuggestions();
//     } catch (err) {
//       console.error(err);
//       alert("Delete failed");
//     }
//   };

//   const toggleDescription = (id) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   if (loading) {
//     return <div className="loading-text">Loading...</div>;
//   }

//   return (
//     <div className="admin-container">

//       <h1 className="admin-title">User Suggestions</h1>

//       <div className="table-wrapper">

//         <table className="admin-table">

//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Title</th>
//               <th>Description</th>
//               <th>Phone</th>
//               <th>Pincode</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {suggestions.map((item) => {
//               const isExpanded = expandedId === item.id;

//               return (
//                 <tr key={item.id}>

//                   <td>{item.id}</td>
//                   <td>{item.title}</td>

//                   <td>
//                     <div
//                       className={
//                         isExpanded
//                           ? "desc-full"
//                           : "desc-cell"
//                       }
//                     >
//                       {item.description}
//                     </div>

//                     {item.description?.length > 10 && (
//                       <button
//                         className="view-btn"
//                         onClick={() =>
//                           toggleDescription(item.id)
//                         }
//                       >
//                         {isExpanded ? "View Less" : "View More"}
//                       </button>
//                     )}
//                   </td>

//                   <td>{item.phone}</td>
//                   <td>{item.pincode}</td>

//                   <td>
//                     <select
//                       className="status-select"
//                       value={item.status}
//                       onChange={(e) =>
//                         updateStatus(item.id, e.target.value)
//                       }
//                     >
//                       <option value="NEW">NEW</option>
//                       <option value="REVIEW">REVIEW</option>
//                       <option value="IN_PROGRESS">IN_PROGRESS</option>
//                       <option value="COMPLETED">COMPLETED</option>
//                     </select>
//                   </td>

//                   <td>
//                     <button
//                       className="delete-btn"
//                       onClick={() => deleteSuggestion(item.id)}
//                     >
//                       Delete
//                     </button>
//                   </td>

//                 </tr>
//               );
//             })}

//             {suggestions.length === 0 && (
//               <tr>
//                 <td colSpan="7" className="empty-msg">
//                   No suggestions found
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
import "./suggestion.css";
import { api } from "../../services/apiConfig";

export default function AdminSuggestions() {

  const role = localStorage.getItem("adminRole");

  const canManage =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [page, setPage] = useState(1);
const pageSize = 5;

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [suggestions]);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get(`/api/admin/suggestions`);
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load suggestions");
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
        `/api/admin/suggestions/${id}/status`,
        { status }
      );

      fetchSuggestions();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const deleteSuggestion = async (id) => {

    if (!canManage) {
      alert("You are not authorized to delete.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await api.delete(`/api/admin/suggestions/${id}`);
      fetchSuggestions();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const toggleDescription = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalPages = Math.ceil(suggestions.length / pageSize);

const paginatedSuggestions = suggestions.slice(
  (page - 1) * pageSize,
  page * pageSize
);

  if (loading) {
    return <div className="loading-text">Loading...</div>;
  }



  return (
    <div className="admin-container">

      <h1 className="admin-title">User Suggestions</h1>

      <div className="table-wrapper">

        <table className="admin-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Phone</th>
              <th>Pincode</th>
              <th>Status</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {/* {suggestions.map((item) => { */}
           {paginatedSuggestions.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <tr key={item.id}>

                  <td>{item.id}</td>
                  <td>{item.title}</td>

                  <td>
                    <div className={isExpanded ? "desc-full" : "desc-cell"}>
                      {item.description}
                    </div>

                    {item.description?.length > 10 && (
                      <button
                        className="view-btn"
                        onClick={() => toggleDescription(item.id)}
                      >
                        {isExpanded ? "View Less" : "View More"}
                      </button>
                    )}
                  </td>

                  <td>{item.phone}</td>
                  <td>{item.pincode}</td>

                  <td>
                    <select
                      className="status-select"
                      value={item.status}
                      disabled={!canManage}
                      onChange={(e) =>
                        updateStatus(item.id, e.target.value)
                      }
                    >
                      <option value="NEW">NEW</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </td>

                  {canManage && (
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteSuggestion(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}

                </tr>
              );
            })}

            {/* {suggestions.length === 0 && ( */}
             {paginatedSuggestions.length === 0 && (
              <tr>
                <td colSpan={canManage ? "7" : "6"} className="empty-msg">
                  No suggestions found
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


      </div>
    </div>
  );
}