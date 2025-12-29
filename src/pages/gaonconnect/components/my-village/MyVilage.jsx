import { useEffect, useState } from "react";
import VillageForm from "./VillageForm";
import "./VillageTabsPage.css";

export default function VillageListPage() {
  const [activeTab, setActiveTab] = useState("existing");
  const [existing, setExisting] = useState([]);
  const [newOnes, setNewOnes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 5;
  const offset = (page - 1) * limit;

  useEffect(() => {
    // Dummy existing data
    const data = [
      {
        id: 1,
        name: "Rampur Village",
        city: "Bhagalpur",
        state: "Bihar",
        description:
          "Rampur is an agriculture-centric village with strong community participation.",
        images: [
          "https://placehold.co/600x300?text=Rampur+1",
          "https://placehold.co/600x300?text=Rampur+2",
          "https://placehold.co/600x300?text=Rampur+3",
        ],
      },
      {
        id: 2,
        name: "Sultanganj Village",
        city: "Bhagalpur",
        state: "Bihar",
        description: "Sultanganj is known for historical traditions and festivals.",
        images: [
          "https://placehold.co/600x300?text=Sultanganj+A",
          "https://placehold.co/600x300?text=Sultanganj+B",
        ],
      },
    ];

    // All known village names (dummy)
    const allAreas = ["Rampur Village", "Karharia Village", "Sultanganj Village"];

    const existingNames = data.map(v => v.name);
    const remain = allAreas.filter(v => !existingNames.includes(v));

    setExisting(data);
    setNewOnes(remain.map((v, i) => ({ id: 100 + i, name: v })));
  }, []);

  const paginatedData = existing.slice(offset, offset + limit);
  const totalPages = Math.ceil(existing.length / limit);

  const openAddForm = (name) => {
    setEditData({ name }); // only name in add mode
    setShowForm(true);
  };

  const openEditForm = (village) => {
    setEditData(village); // full village object
    setShowForm(true);
  };

  // dynamic header title
  const headerTitle = showForm
    ? (editData?.name && editData?.city ? "Edit Village" : "Add Village")
    : activeTab === "existing"
      ? "Existing Villages"
      : "New Villages";

  return (
    <div className="page-container">
      <h1>{headerTitle}</h1>

      {/* Tabs */}
      {!showForm && (
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab==="existing"?"active":""}`}
            onClick={() => setActiveTab("existing")}
          >
            Existing Villages
          </button>

          <button
            className={`tab-btn ${activeTab==="new"?"active":""}`}
            onClick={() => setActiveTab("new")}
          >
            New Villages
          </button>
        </div>
      )}

      {/* Existing Tab */}
      {activeTab==="existing" && !showForm && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>City</th><th>State</th><th>Images</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(v => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.city}</td>
                  <td>{v.state}</td>
                  <td className="img-col">
                    {v.images.map((img,i)=>(
                      <img key={i} src={img} alt="" className="thumb-img" />
                    ))}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={()=>openEditForm(v)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button disabled={page===1} onClick={()=>setPage(page-1)}>Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button disabled={page===totalPages} onClick={()=>setPage(page+1)}>Next</button>
          </div>
        </div>
      )}

      {/* New Village Tab */}
      {activeTab==="new" && !showForm && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Action</th></tr>
            </thead>
            <tbody>
              {newOnes.map(v => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>
                    <button className="add-btn" onClick={()=>openAddForm(v.name)}>
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <VillageForm
          data={editData}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
        />
      )}
    </div>
  );
}
