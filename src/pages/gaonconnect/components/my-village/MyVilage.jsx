// import { useEffect, useState, useCallback } from "react";
// import VillageForm from "./VillageForm";
// import "./VillageTabsPage.css";
// import { deleteVillage } from "../../../../pages/userService";

// const BASE_URL = "https://smartgaonadmin.duckdns.org/admin/villages";
// const LIMIT = 5;

// export default function VillageListPage() {
//   const [activeTab, setActiveTab] = useState("existing");
//   const [existing, setExisting] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [editData, setEditData] = useState(null);

//   // pagination
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   /* -------------------- LOAD DATA -------------------- */
//   const loadVillages = useCallback(async () => {
//     try {
//       const backendPage = page - 1;

//       const res = await fetch(
//         `${BASE_URL}/search?page=${backendPage}&size=${LIMIT}`,
//         {
//           headers: {
//             Authorization: "Bearer " + localStorage.getItem("adminToken"),
//           },
//         }
//       );

//       const data = await res.json();
//       setExisting(data?.villages || []);
//       setTotalPages(data?.totalPages || 1);
//     } catch (err) {
//       console.error("Failed to load villages:", err);
//     }
//   }, [page]);

//   /* reload list when page changes */
//   useEffect(() => {
//     loadVillages();
//   }, [loadVillages]);

//   /* -------------------- FORM HANDLERS -------------------- */
//   const openAddForm = () => {
//     setEditData({
//       id: null,
//       name: "",
//       city: "",
//       state: "",
//       description: "",
//       images: [],
//     });
//     setShowForm(true);
//   };

//   const openEditForm = (village) => {
//     setEditData(village);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm(
//       "Do you really want to delete this village?"
//     );
//     if (!confirmDelete) return;

//     try {
//       await deleteVillage(id);
//       alert("Village deleted successfully");
//       loadVillages();
//     } catch (err) {
//       console.error("Delete failed:", err);
//       alert("Failed to delete village");
//     }
//   };

//   /* -------------------- HEADER TITLE -------------------- */
//   const headerTitle = showForm
//     ? editData?.id
//       ? "Edit Village"
//       : "Add Village"
//     : activeTab === "existing"
//     ? "Existing Villages"
//     : "New Village";

//   /* -------------------- UI -------------------- */
//   return (
//     <div className="page-container">
//       <h1>{headerTitle}</h1>

//       {/* Tabs */}
//       <div className="tabs">
//         <button
//           className={`tab-btn ${activeTab === "existing" ? "active" : ""}`}
//           onClick={() => {
//             setActiveTab("existing");
//             setShowForm(false);
//           }}
//         >
//           Existing Villages
//         </button>

//         <button
//           className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
//           onClick={() => {
//             setActiveTab("new");
//             openAddForm();
//           }}
//         >
//           New Village
//         </button>
//       </div>

//       {/* TABLE */}
//       {activeTab === "existing" && !showForm && (
//         <div className="card">
//           <table className="data-table">
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>City</th>
//                 <th>State</th>
//                 <th>Images</th>
//                 <th>Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {existing.map((v) => (
//                 <tr key={v.id}>
//                   <td>{v.name}</td>
//                   <td>{v.city}</td>
//                   <td>{v.state}</td>

//                   <td className="img-col">
//                     {(v.images || []).map((img, i) => (
//                       <img
//                         key={i}
//                         src={img}
//                         alt={v.name}
//                         className="thumb-img"
//                         onError={(e) =>
//                           (e.currentTarget.style.display = "none")
//                         }
//                       />
//                     ))}
//                   </td>

//                   <td>
//                     <button
//                       className="edit-btn"
//                       onClick={() => openEditForm(v)}
//                     >
//                       Edit
//                     </button>

//                     <button
//                       className="delete-btn"
//                       onClick={() => handleDelete(v.id)}
//                       style={{
//                         marginLeft: "8px",
//                         background: "red",
//                         color: "white",
//                       }}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination */}
//           <div className="pagination">
//             <button
//               disabled={page === 1}
//               onClick={() => setPage((p) => p - 1)}
//             >
//               Prev
//             </button>

//             <span>
//               Page {page} / {totalPages}
//             </span>

//             <button
//               disabled={page === totalPages}
//               onClick={() => setPage((p) => p + 1)}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}

//       {/* FORM */}
//       {showForm && (
//         <VillageForm
//           data={editData}
//           onClose={() => {
//             setShowForm(false);
//             setEditData(null);
//             loadVillages();
//           }}
//         />
//       )}
//     </div>
//   );
// }


import { useEffect, useState, useCallback } from "react";
import VillageForm from "./VillageForm";
import DevelopmentForm from "./DevelopmentForm";
import "./VillageTabsPage.css";
import { deleteVillage } from "../../../../pages/userService";

const BASE_URL = "http://localhost:9090/admin";
const LIMIT = 5;

export default function VillageListPage() {

  const [activeTab, setActiveTab] = useState("existing");

  const [existing, setExisting] = useState([]);
  const [developments, setDevelopments] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const [showDevForm, setShowDevForm] = useState(false);
  const [editDevData, setEditDevData] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------------- LOAD VILLAGES ---------------- */
  const loadVillages = useCallback(async () => {

    const backendPage = page - 1;

    const res = await fetch(
      `${BASE_URL}/villages/search?page=${backendPage}&size=${LIMIT}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("adminToken"),
        },
      }
    );

    const data = await res.json();
    setExisting(data?.villages || []);
    setTotalPages(data?.totalPages || 1);

  }, [page]);

  /* ---------------- LOAD MASTER DEVELOPMENT LIST ---------------- */
  const loadDevelopments = async () => {

    const res = await fetch(`${BASE_URL}/developments`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("adminToken"),
      },
    });

    const data = await res.json();
    setDevelopments(data || []);
  };

  /* Load both */
  useEffect(() => {
    loadVillages();
    loadDevelopments();
  }, [loadVillages]);

  /* Find development info */
  const getDevInfo = (id) => {
    return developments.find(d => d.id === id);
  };

  /* DELETE DEVELOPMENT */
  const deleteDevelopment = async (id) => {
    if (!window.confirm("Delete this development?")) return;

    await fetch(`${BASE_URL}/developments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("adminToken"),
      },
    });

    loadDevelopments();
  };

  /* DELETE VILLAGE */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this village?")) return;
    await deleteVillage(id);
    loadVillages();
  };

  /* SWITCH TAB */
  const switchTab = (tab) => {
    setActiveTab(tab);
    setShowForm(false);
    setShowDevForm(false);
    setEditData(null);
    setEditDevData(null);
  };

  return (
    <div className="page-container">

      <h1>
        {activeTab === "existing"
          ? "Existing Villages"
          : activeTab === "new"
          ? "Add Village"
          : "Development Master"}
      </h1>

      {/* TABS */}
      <div className="tabs">

        <button
          className={`tab-btn ${activeTab === "existing" ? "active" : ""}`}
          onClick={() => switchTab("existing")}
        >
          Existing Villages
        </button>

        <button
          className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
          onClick={() => {
            switchTab("new");
            setEditData({
              id: null,
              name: "",
              city: "",
              state: "",
              description: "",
              images: []
            });
            setShowForm(true);
          }}
        >
          New Village
        </button>

        <button
          className={`tab-btn ${activeTab === "development" ? "active" : ""}`}
          onClick={() => switchTab("development")}
        >
          Development
        </button>

      </div>

      {/* ================= VILLAGE TABLE ================= */}
      {activeTab === "existing" && !showForm && (
        <div className="card">

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>State</th>
                <th>Images</th>
                <th>Developments Program</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {existing.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.city}</td>
                  <td>{v.state}</td>

                  {/* VILLAGE IMAGES */}
                  <td>
                    {(v.images || []).map((img, i) => (
                      <img key={i} src={img} alt="" className="thumb-img" />
                    ))}
                  </td>

                  {/* DEVELOPMENT SHOW TITLE + IMAGE ONLY */}
                  <td className="dev-cell">

                    {v.developments && v.developments.length > 0 ? (
                      v.developments.map((d, i) => {

                        const devInfo = getDevInfo(d.developmentId);
                        if (!devInfo) return null;

                        return (
                          <div key={i} className="dev-mini-card">

                            {devInfo.imageUrl && (
                              <img src={devInfo.imageUrl} className="dev-mini-img" />
                            )}

                            <div className="dev-mini-title">
                              {devInfo.title}
                            </div>

                          </div>
                        );
                      })
                    ) : (
                      <span className="no-dev">No development</span>
                    )}

                  </td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditData(v);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      style={{ marginLeft: "8px" }}
                      onClick={() => handleDelete(v.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* ================= DEVELOPMENT MASTER TABLE ================= */}
      {activeTab === "development" && !showDevForm && (
        <div className="card">

          <button
            className="edit-btn"
            style={{ marginBottom: "10px" }}
            onClick={() => {
              setEditDevData({
                id: null,
                title: "",
                description: "",
                imageUrl: ""
              });
              setShowDevForm(true);
            }}
          >
            + Add Development
          </button>

          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {developments.map((d) => (
                <tr key={d.id}>
                  <td>{d.title}</td>
                  <td>{d.description}</td>
                  <td>
                    {d.imageUrl && (
                      <img src={d.imageUrl} alt="" className="thumb-img" />
                    )}
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditDevData(d);
                        setShowDevForm(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      style={{ marginLeft: "8px" }}
                      onClick={() => deleteDevelopment(d.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* FORMS */}
      {showForm && activeTab !== "development" && (
        <VillageForm
          data={editData}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
            loadVillages();
          }}
        />
      )}

      {showDevForm && activeTab === "development" && (
        <DevelopmentForm
          data={editDevData}
          onClose={() => {
            setShowDevForm(false);
            setEditDevData(null);
            loadDevelopments();
          }}
        />
      )}

    </div>
  );
}

