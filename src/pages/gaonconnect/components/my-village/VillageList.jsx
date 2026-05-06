
import { useEffect, useState } from "react";

import {
  getAllVillages,
  updateVillage,
  deleteVillage,
} from "./service/villageservice";

import {
  getVillageDevelopments,
} from "./service/villageDevelopmentService";

import {
  getAllDevelopment,
  getByPhase
} from "./service/developmentservice";

import AssignDevelopment from "./edit/AssignDevelopment";
import EditDevelopmentModal from "./edit/EditDevelopmentModal";
import VillageView from "./edit/VillageView";
import StayEnquiry from "./stay-enquiry/StayEnquiry";

import "./VillageList.css";

export default function VillageList() {

  const [villages,setVillages] = useState([]);
  const [selectedVillage,setSelectedVillage] = useState(null);
  const [viewVillage,setViewVillage] = useState(null);

  const [form,setForm] = useState({});
  const [assigned,setAssigned] = useState([]);

  const [phases,setPhases] = useState([]);

  const [editDev,setEditDev] = useState(null);
  const [editProgress,setEditProgress] = useState("");
  const [editRemarks,setEditRemarks] = useState("");

  const [existingImages,setExistingImages] = useState([]);
  const [newImages,setNewImages] = useState([]);

  const [videoUrl,setVideoUrl] = useState("");

  const [existingReports,setExistingReports] = useState([]);
  const [newReports,setNewReports] = useState([]);

  const [activeTab, setActiveTab] = useState("village");

  useEffect(()=>{
    fetchVillages();
    fetchPhases();
  },[]);

  const fetchVillages = async ()=>{
    const res = await getAllVillages();
    setVillages(res.data);
  };

  const fetchPhases = async ()=>{

    const res = await getAllDevelopment();

    const uniquePhases = [
      ...new Set(res.data.map(d=>d.phaseNumber))
    ];

    uniquePhases.sort((a,b)=>a-b);

    setPhases(uniquePhases);
  };

  const handleView = (v)=>{
    setViewVillage(v);
  };

  const handleEdit = async(v)=>{

    setSelectedVillage(v);
    setForm({...v});

    if(v.smartGaon){

      const data = await getVillageDevelopments(v.id);
      setAssigned(data);

    }else{

      setAssigned([]);

    }
  };

  const handleDelete = async(id)=>{

    if(window.confirm("Delete this village?")){

      await deleteVillage(id);

      fetchVillages();
    }
  };

  const handleUpdate = async()=>{

    const payload = {
      name: form.name,
      city: form.city,
      state: form.state,
      description: form.description,
      smartGaon: form.smartGaon
    };

    await updateVillage(selectedVillage.id,payload);

    alert("Village Updated Successfully");

    fetchVillages();

    setSelectedVillage(null);
  };

  const filteredVillages = villages.filter(v =>
  activeTab === "smart"
    ? v.smartGaon === true
    : v.smartGaon === false
);

  return (

    <div className="village-list-container">

      <h2>All Villages</h2>
  
  <div className="village-tabs">

  <button
    className={activeTab === "village" ? "active-tab" : ""}
    onClick={() => setActiveTab("village")}
  >
    Villages
  </button>

  <button
    className={activeTab === "smart" ? "active-tab" : ""}
    onClick={() => setActiveTab("smart")}
  >
    Smart Villages
  </button>

  <button
  className={activeTab === "stay" ? "active-tab" : ""}
  onClick={() => setActiveTab("stay")}
>
  Stay Enquiry
</button>

</div>

{activeTab !== "stay" && (
  <table className="village-table">
    <thead>
      <tr>
        <th>Village</th>
        <th>City</th>
        <th>State</th>
        <th>Smart</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {filteredVillages.map((v) => (
        <tr key={v.id}>
          <td>{v.name}</td>
          <td>{v.city}</td>
          <td>{v.state}</td>
          <td>{v.smartGaon ? "SMART" : "No"}</td>
          <td>
            <button onClick={() => handleView(v)}>View</button>
            <button onClick={() => handleEdit(v)}>Edit</button>
            <button onClick={() => handleDelete(v.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}

{activeTab === "stay" && <StayEnquiry />}


      {/* EDIT MODAL */}

      {selectedVillage && (

        <div className="modal-overlay">

          <div className="modal-box-large">

            <button
              className="close-btn"
              onClick={()=>setSelectedVillage(null)}
            >
              ✕
            </button>

            <h3>Edit Village</h3>

            <input
              value={form.name || ""}
              onChange={(e)=>
                setForm({...form,name:e.target.value})
              }
              placeholder="Village Name"
            />

            <input
              value={form.city || ""}
              onChange={(e)=>
                setForm({...form,city:e.target.value})
              }
              placeholder="City"
            />

            <input
              value={form.state || ""}
              onChange={(e)=>
                setForm({...form,state:e.target.value})
              }
              placeholder="State"
            />

            <textarea
              value={form.description || ""}
              onChange={(e)=>
                setForm({...form,description:e.target.value})
              }
              placeholder="Description"
            />

            {/* <label>

              <input
                type="checkbox"
                checked={form.smartGaon || false}
                onChange={(e)=>
                  setForm({...form,smartGaon:e.target.checked})
                }
              />

              Smart Gaon

            </label> */}
            <label
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "10px",
    fontWeight: "500",
    cursor: "pointer"
  }}
>
  <input
    type="checkbox"
    checked={form.smartGaon || false}
    onChange={(e)=>
      setForm({...form, smartGaon: e.target.checked})
    }
    style={{
      width: "16px",
      height: "16px",
      cursor: "pointer"
    }}
  />

  Smart Gaon
</label>

          
              <button onClick={handleUpdate}>
              Update Village
            </button>

            {form.smartGaon && (

              <>

                <hr/>

                <h4>Assigned Development</h4>

                {assigned.map(item=>(
                  <div key={item.id}>

                    Phase {item.development.phaseNumber}
                    {" "}
                    {item.development.master?.title}

                    <br/>

                    Progress: {item.progressPercent}%

                    <br/>

                    <button
  style={{
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "5px"
  }}
  onClick={()=>{
    setEditDev(item);
    setEditProgress(item.progressPercent);
    setEditRemarks(item.remarks || "");
    setExistingImages(item.galleryImages || []);
    setExistingReports(item.reports || []);
    setVideoUrl(item.videoUrl || "");
  }}
>
  Edit
</button>

                  </div>
                ))}


              

              
                {/* EDIT DEVELOPMENT */}

<EditDevelopmentModal
  selectedVillage={selectedVillage}
  editDev={editDev}
  setEditDev={setEditDev}
  editProgress={editProgress}
  setEditProgress={setEditProgress}
  editRemarks={editRemarks}
  setEditRemarks={setEditRemarks}
  existingImages={existingImages}
  setExistingImages={setExistingImages}
  newImages={newImages}
  setNewImages={setNewImages}
  videoUrl={videoUrl}
  setVideoUrl={setVideoUrl}
  existingReports={existingReports}
  setExistingReports={setExistingReports}
  newReports={newReports}
  setNewReports={setNewReports}
  refreshDevelopment={async ()=>{
    const data = await getVillageDevelopments(selectedVillage.id);
    setAssigned(data);
  }}
/>

                <hr/>

                {/* ASSIGN DEVELOPMENT */}

                <AssignDevelopment
                  selectedVillage={selectedVillage}
                  phases={phases}
                  getByPhase={getByPhase}
                  refreshDevelopment={async ()=>{
                    const data = await getVillageDevelopments(selectedVillage.id);
                    setAssigned(data);
                  }}
                />

              </>
            )}

          </div>

        </div>

      )}

      {/* {viewVillage && (
        <VillageView village={viewVillage}/>
      )} */}

{viewVillage && (

  <div className="modal-overlay">

    <div className="modal-box-large">

      <button
        className="close-btn"
        onClick={() => setViewVillage(null)}
      >
        ✕
      </button>

      <VillageView village={viewVillage} />

    </div>

  </div>

)}
    </div>
  );
}