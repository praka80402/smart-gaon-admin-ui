import { useEffect, useState } from "react";
import VillageForm from "./VillageForm";
import "./VillageTabsPage.css";
import { deleteVillage } from "../../../../pages/userService";  

const BASE_URL = "https://smartgaonadmin.duckdns.org/admin/villages";

export default function VillageListPage() {
  const [activeTab, setActiveTab] = useState("existing");
  const [existing, setExisting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 5;
  const [totalPages, setTotalPages] = useState(1);

  /* -------------------- LOAD DATA FROM API -------------------- */
  const loadVillages = async () => {
    try {
      const backendPage = page - 1;

      const res = await fetch(
        `${BASE_URL}/search?page=${backendPage}&size=${limit}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("adminToken")
          }
        }
      );

      const data = await res.json();
      setExisting(data?.villages || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load villages:", err);
    }
  };

  /* reload list when page changes or after add/edit */
  useEffect(() => {
    loadVillages();
  }, [page]);

  /* -------------------- OPEN FORMS -------------------- */
  const openAddForm = () => {
  setEditData({
    id: null,
    name: "",
    city: "",
    state: "",
    description: "",
    images: []   // or "" based on your form structure
  });
  setShowForm(true);
};


  const openEditForm = (village) => {
    setEditData(village);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Do you really want to delete this village?");
  if (!confirmDelete) return;

  try {
    await deleteVillage(id);
    alert("Village deleted successfully");
    loadVillages(); // refresh table
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete village: " + err.message);
  }
};

  /* -------------------- HEADER TITLE -------------------- */
  const headerTitle = showForm
    ? (editData?.id ? "Edit Village" : "Add Village")
    : activeTab === "existing"
      ? "Existing Villages"
      : "New Village";

  /* -------------------- RENDER -------------------- */
  return (
    <div className="page-container">
      <h1>{headerTitle}</h1>

      {/* Tabs - ALWAYS VISIBLE */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "existing" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("existing");
            setShowForm(false);     // close form when switching to list
          }}
        >
          Existing Villages
        </button>

        <button
          className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("new");
            openAddForm();          // open add form directly
          }}
        >
          New Village
        </button>
      </div>


      {/* Existing Villages Screen */}
      {activeTab === "existing" && !showForm && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>City</th><th>State</th><th>Images</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {existing?.map(v => (
                <tr key={v?.id}>
                  <td>{v?.name}</td>
                  <td>{v?.city}</td>
                  <td>{v?.state}</td>

                  <td className="img-col">
                    {(v?.images || []).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={v?.name}
                        className="thumb-img"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ))}
                  </td>

                  <td>
  <button className="edit-btn" onClick={() => openEditForm(v)}>
    Edit
  </button>

  <button
    className="delete-btn"
    onClick={() => handleDelete(v.id)}
    style={{ marginLeft: "8px", background: "red", color: "white" }}
  >
    Delete
  </button>
</td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <VillageForm
          data={editData}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
            loadVillages(); // refresh after save
          }}
        />
      )}
    </div>
  );
}
