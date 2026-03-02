// // import { useEffect, useState, useCallback } from "react";
// // import VillageForm from "./VillageForm";
// // import DevelopmentForm from "./DevelopmentForm";
// // import "./VillageTabsPage.css";
// // import { deleteVillage } from "../../../../pages/userService";

// // const BASE_URL = "http://localhost:9090/admin";
// // // const BASE_URL = "https://smartgaonadmin.duckdns.org/admin";
// // const LIMIT = 5;

// // export default function VillageListPage() {

// //   const [activeTab, setActiveTab] = useState("existing");

// //   const [existing, setExisting] = useState([]);
// //   const [developments, setDevelopments] = useState([]);

// //   const [showForm, setShowForm] = useState(false);
// //   const [editData, setEditData] = useState(null);

// //   const [showDevForm, setShowDevForm] = useState(false);
// //   const [editDevData, setEditDevData] = useState(null);

// //   const [page, setPage] = useState(1);
// //   const [totalPages, setTotalPages] = useState(1);

// //   /* ---------------- LOAD VILLAGES ---------------- */
// //   const loadVillages = useCallback(async () => {

// //     const backendPage = page - 1;

// //     const res = await fetch(
// //       `${BASE_URL}/villages/search?page=${backendPage}&size=${LIMIT}`,
// //       {
// //         headers: {
// //           Authorization: "Bearer " + localStorage.getItem("adminToken"),
// //         },
// //       }
// //     );

// //     const data = await res.json();
// //     setExisting(data?.villages || []);
// //     setTotalPages(data?.totalPages || 1);

// //   }, [page]);

// //   /* ---------------- LOAD MASTER DEVELOPMENT LIST ---------------- */
// //   const loadDevelopments = async () => {

// //     const res = await fetch(`${BASE_URL}/developments`, {
// //       headers: {
// //         Authorization: "Bearer " + localStorage.getItem("adminToken"),
// //       },
// //     });

// //     const data = await res.json();
// //     setDevelopments(data || []);
// //   };

// //   /* Load both */
// //   useEffect(() => {
// //     loadVillages();
// //     loadDevelopments();
// //   }, [loadVillages]);

// //   /* Find development info */
// //   const getDevInfo = (id) => {
// //     return developments.find(d => d.id === id);
// //   };

// //   /* DELETE DEVELOPMENT */
// //   const deleteDevelopment = async (id) => {
// //     if (!window.confirm("Delete this development?")) return;

// //     await fetch(`${BASE_URL}/developments/${id}`, {
// //       method: "DELETE",
// //       headers: {
// //         Authorization: "Bearer " + localStorage.getItem("adminToken"),
// //       },
// //     });

// //     loadDevelopments();
// //   };

// //   /* DELETE VILLAGE */
// //   const handleDelete = async (id) => {
// //     if (!window.confirm("Delete this village?")) return;
// //     await deleteVillage(id);
// //     loadVillages();
// //   };

// //   /* SWITCH TAB */
// //   const switchTab = (tab) => {
// //     setActiveTab(tab);
// //     setShowForm(false);
// //     setShowDevForm(false);
// //     setEditData(null);
// //     setEditDevData(null);
// //   };

// //   return (
// //     <div className="page-container">

// //       <h1>
// //         {activeTab === "existing"
// //           ? "Existing Villages"
// //           : activeTab === "new"
// //           ? "Add Village"
// //           : "Development Master"}
// //       </h1>

// //       {/* TABS */}
// //       <div className="tabs">

// //         <button
// //           className={`tab-btn ${activeTab === "existing" ? "active" : ""}`}
// //           onClick={() => switchTab("existing")}
// //         >
// //           Existing Villages
// //         </button>

// //         <button
// //           className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
// //           onClick={() => {
// //             switchTab("new");
// //             setEditData({
// //               id: null,
// //               name: "",
// //               city: "",
// //               state: "",
// //               description: "",
// //               images: []
// //             });
// //             setShowForm(true);
// //           }}
// //         >
// //           New Village
// //         </button>

// //         <button
// //           className={`tab-btn ${activeTab === "development" ? "active" : ""}`}
// //           onClick={() => switchTab("development")}
// //         >
// //           Development
// //         </button>

// //       </div>

// //       {/* ================= VILLAGE TABLE ================= */}
// //       {activeTab === "existing" && !showForm && (
// //         <div className="card">

// //           <table className="data-table">
// //             <thead>
// //               <tr>
// //                 <th>Name</th>
// //                 <th>City</th>
// //                 <th>State</th>
// //                 <th>Images</th>
// //                 <th>Developments Program</th>
// //                 <th>Action</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {existing.map((v) => (
// //                 <tr key={v.id}>
// //                   <td>{v.name}</td>
// //                   <td>{v.city}</td>
// //                   <td>{v.state}</td>

// //                   {/* VILLAGE IMAGES */}
// //                   <td>
// //                     {(v.images || []).map((img, i) => (
// //                       <img key={i} src={img} alt="" className="thumb-img" />
// //                     ))}
// //                   </td>

// //                   {/* DEVELOPMENT SHOW TITLE + IMAGE ONLY */}
// //                   <td className="dev-cell">

// //                     {v.developments && v.developments.length > 0 ? (
// //                       v.developments.map((d, i) => {

// //                         const devInfo = getDevInfo(d.developmentId);
// //                         if (!devInfo) return null;

// //                         return (
// //                           <div key={i} className="dev-mini-card">

// //                             {devInfo.imageUrl && (
// //                               <img src={devInfo.imageUrl} className="dev-mini-img" />
// //                             )}

// //                             <div className="dev-mini-title">
// //                               {devInfo.title}
// //                             </div>

// //                           </div>
// //                         );
// //                       })
// //                     ) : (
// //                       <span className="no-dev">No development</span>
// //                     )}

// //                   </td>

// //                   <td>
// //                     <button
// //                       className="edit-btn"
// //                       onClick={() => {
// //                         setEditData(v);
// //                         setShowForm(true);
// //                       }}
// //                     >
// //                       Edit
// //                     </button>

// //                     <button
// //                       className="delete-btn"
// //                       style={{ marginLeft: "8px" }}
// //                       onClick={() => handleDelete(v.id)}
// //                     >
// //                       Delete
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>

// //         </div>
// //       )}

// //       {/* ================= DEVELOPMENT MASTER TABLE ================= */}
// //       {activeTab === "development" && !showDevForm && (
// //         <div className="card">

// //           <button
// //             className="edit-btn"
// //             style={{ marginBottom: "10px" }}
// //             onClick={() => {
// //               setEditDevData({
// //                 id: null,
// //                 title: "",
// //                 description: "",
// //                 imageUrl: ""
// //               });
// //               setShowDevForm(true);
// //             }}
// //           >
// //             + Add Development
// //           </button>

// //           <table className="data-table">
// //             <thead>
// //               <tr>
// //                 <th>Title</th>
// //                 <th>Description</th>
// //                 <th>Image</th>
// //                 <th>Action</th>
// //               </tr>
// //             </thead>

// //             <tbody>
// //               {developments.map((d) => (
// //                 <tr key={d.id}>
// //                   <td>{d.title}</td>
// //                   <td>{d.description}</td>
// //                   <td>
// //                     {d.imageUrl && (
// //                       <img src={d.imageUrl} alt="" className="thumb-img" />
// //                     )}
// //                   </td>
// //                   <td>
// //                     <button
// //                       className="edit-btn"
// //                       onClick={() => {
// //                         setEditDevData(d);
// //                         setShowDevForm(true);
// //                       }}
// //                     >
// //                       Edit
// //                     </button>

// //                     <button
// //                       className="delete-btn"
// //                       style={{ marginLeft: "8px" }}
// //                       onClick={() => deleteDevelopment(d.id)}
// //                     >
// //                       Delete
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>

// //         </div>
// //       )}

// //       {/* FORMS */}
// //       {showForm && activeTab !== "development" && (
// //         <VillageForm
// //           data={editData}
// //           onClose={() => {
// //             setShowForm(false);
// //             setEditData(null);
// //             loadVillages();
// //           }}
// //         />
// //       )}

// //       {showDevForm && activeTab === "development" && (
// //         <DevelopmentForm
// //           data={editDevData}
// //           onClose={() => {
// //             setShowDevForm(false);
// //             setEditDevData(null);
// //             loadDevelopments();
// //           }}
// //         />
// //       )}

// //     </div>
// //   );
// // }

// import { useEffect, useState, useCallback } from "react";
// import VillageForm from "./VillageForm";
// import DevelopmentForm from "./DevelopmentForm";
// import "./VillageTabsPage.css";
// import { deleteVillage } from "../../../../pages/userService";

// // const BASE_URL = "http://localhost:9090/admin";
//  const BASE_URL = "https://smartgaonadmin.duckdns.org/admin";
// const LIMIT = 5;

// export default function VillageListPage() {

//   /* ================= ROLE CONTROL ================= */
//   const role = localStorage.getItem("adminRole");

//   const canManageVillage =
//     role === "SUPER_ADMIN" || role === "STATE_ADMIN";

//   /* ================= STATES ================= */
//   const [activeTab, setActiveTab] = useState("existing");
//   const [existing, setExisting] = useState([]);
//   const [developments, setDevelopments] = useState([]);

//   const [showForm, setShowForm] = useState(false);
//   const [editData, setEditData] = useState(null);

//   const [showDevForm, setShowDevForm] = useState(false);
//   const [editDevData, setEditDevData] = useState(null);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   /* ================= SAFE JSON ================= */
//   const safeJson = async (res) => {
//     if (!res.ok) return null;
//     const text = await res.text();
//     if (!text) return null;
//     return JSON.parse(text);
//   };

//   /* ================= LOAD VILLAGES ================= */
//   const loadVillages = useCallback(async () => {

//     const backendPage = page - 1;

//     const res = await fetch(
//       `${BASE_URL}/villages/search?page=${backendPage}&size=${LIMIT}`,
//       {
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("adminToken"),
//         },
//       }
//     );

//     const data = await safeJson(res);
//     if (!data) return;

//     setExisting(data?.villages || []);
//     setTotalPages(data?.totalPages || 1);

//   }, [page]);

//   /* ================= LOAD DEVELOPMENTS ================= */
//   const loadDevelopments = async () => {

//     const res = await fetch(`${BASE_URL}/developments`, {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("adminToken"),
//       },
//     });

//     const data = await safeJson(res);
//     setDevelopments(data || []);
//   };

//   useEffect(() => {
//     loadVillages();
//     loadDevelopments();
//   }, [loadVillages]);

//   /* ================= DELETE ================= */
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this village?")) return;
//     await deleteVillage(id);
//     loadVillages();
//   };

//   const deleteDevelopment = async (id) => {
//     if (!window.confirm("Delete this development?")) return;

//     await fetch(`${BASE_URL}/developments/${id}`, {
//       method: "DELETE",
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("adminToken"),
//       },
//     });

//     loadDevelopments();
//   };

//   const getDevInfo = (id) => developments.find(d => d.id === id);

//   const switchTab = (tab) => {
//     setActiveTab(tab);
//     setShowForm(false);
//     setShowDevForm(false);
//     setEditData(null);
//     setEditDevData(null);
//   };

//   return (
//     <div className="page-container">

//       <h1>
//         {activeTab === "existing"
//           ? "Existing Villages"
//           : activeTab === "new"
//           ? "Add Village"
//           : "Development Master"}
//       </h1>

//       {/* ================= TABS ================= */}
//       <div className="tabs">

//         <button
//           className={`tab-btn ${activeTab === "existing" ? "active" : ""}`}
//           onClick={() => switchTab("existing")}
//         >
//           Existing Villages
//         </button>

//         {canManageVillage && (
//           <button
//             className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
//             onClick={() => {
//               switchTab("new");
//               setEditData({
//                 id: null,
//                 name: "",
//                 city: "",
//                 state: "",
//                 description: "",
//                 images: []
//               });
//               setShowForm(true);
//             }}
//           >
//             New Village
//           </button>
//         )}

//         <button
//           className={`tab-btn ${activeTab === "development" ? "active" : ""}`}
//           onClick={() => switchTab("development")}
//         >
//           Development
//         </button>

//       </div>

//       {/* ================= VILLAGE TABLE ================= */}
//       {activeTab === "existing" && !showForm && (
//         <div className="card">

//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>City</th>
//                 <th>State</th>
//                 <th>Images</th>
//                 <th>Developments</th>
//                 {canManageVillage && <th>Action</th>}
//               </tr>
//             </thead>

//             <tbody>
//               {existing.map((v) => (
//                 <tr key={v.id}>
//                   <td>{v.name}</td>
//                   <td>{v.city}</td>
//                   <td>{v.state}</td>

//                   <td>
//                     {(v.images || []).map((img, i) => (
//                       <img key={i} src={img} alt="" className="thumb-img" />
//                     ))}
//                   </td>

//                   <td>
//                     {v.developments?.length > 0
//                       ? v.developments.map((d, i) => {
//                           const devInfo = getDevInfo(d.developmentId);
//                           return devInfo ? (
//                             <div key={i}>{devInfo.title}</div>
//                           ) : null;
//                         })
//                       : "No development"}
//                   </td>

//                   {canManageVillage && (
//                     <td>
//                       <button
//                         className="edit-btn"
//                         onClick={() => {
//                           setEditData(v);
//                           setShowForm(true);
//                         }}
//                       >
//                         Edit
//                       </button>

//                       <button
//                         className="delete-btn"
//                         style={{ marginLeft: "8px" }}
//                         onClick={() => handleDelete(v.id)}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   )}

//                 </tr>
//               ))}
//             </tbody>
//           </table>

//         </div>
//       )}

//       {/* ================= DEVELOPMENT MASTER ================= */}
//       {activeTab === "development" && !showDevForm && (
//         <div className="card">

//           {canManageVillage && (
//             <button
//               className="edit-btn"
//               style={{ marginBottom: "10px" }}
//               onClick={() => {
//                 setEditDevData({
//                   id: null,
//                   title: "",
//                   description: "",
//                   imageUrl: ""
//                 });
//                 setShowDevForm(true);
//               }}
//             >
//               + Add Development
//             </button>
//           )}

//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Title</th>
//                 <th>Description</th>
//                 <th>Image</th>
//                 {canManageVillage && <th>Action</th>}
//               </tr>
//             </thead>

//             <tbody>
//               {developments.map((d) => (
//                 <tr key={d.id}>
//                   <td>{d.title}</td>
//                   <td>{d.description}</td>
//                   <td>
//                     {d.imageUrl && (
//                       <img src={d.imageUrl} alt="" className="thumb-img" />
//                     )}
//                   </td>

//                   {canManageVillage && (
//                     <td>
//                       <button
//                         className="edit-btn"
//                         onClick={() => {
//                           setEditDevData(d);
//                           setShowDevForm(true);
//                         }}
//                       >
//                         Edit
//                       </button>

//                       <button
//                         className="delete-btn"
//                         style={{ marginLeft: "8px" }}
//                         onClick={() => deleteDevelopment(d.id)}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   )}

//                 </tr>
//               ))}
//             </tbody>
//           </table>

//         </div>
//       )}

//       {showForm && (
//         <VillageForm
//           data={editData}
//           onClose={() => {
//             setShowForm(false);
//             loadVillages();
//           }}
//         />
//       )}

//       {showDevForm && (
//         <DevelopmentForm
//           data={editDevData}
//           onClose={() => {
//             setShowDevForm(false);
//             loadDevelopments();
//           }}
//         />
//       )}

//     </div>
//   );
// }



import { useState } from "react";
import CreateVillage from "./CreateVillage";
import VillageList from "./VillageList";
import Development from "./Development/Development";
import "./admin.css";

export default function AdminDashboard() {

  const [mainTab, setMainTab] = useState("create");

  return (
    <div className="container">

      {/* Top Tabs */}
      <div className="top-tabs">
        <button
          className={mainTab === "create" ? "active-tab" : ""}
          onClick={() => setMainTab("create")}
        >
          Create
        </button>

        <button
  className={mainTab === "list" ? "active-tab" : ""}
  onClick={() => setMainTab("list")}
>
  Village List
</button>

        <button
          className={mainTab === "development" ? "active-tab" : ""}
          onClick={() => setMainTab("development")}
        >
          Development
        </button>
      </div>

      {/* Content */}
      <div className="content-area">

        {mainTab === "create" && <CreateVillage />}
        {mainTab === "list" && <VillageList />}
        {mainTab === "development" && <Development />}
      </div>

    </div>
  );
}