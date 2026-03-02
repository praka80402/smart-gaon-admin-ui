// import { useEffect, useState } from "react";
// import api from "./services/axiosInstance";
// import ProgramDonationModal from "./ProgramDonationModal";
// import "./donation.css";

// export default function ProgramList() {

//   const [programs, setPrograms] = useState([]);
//   const [selectedProgram, setSelectedProgram] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const loadPrograms = async () => {
//     try {
//       const res = await api.get("/admin/donation/campaigns", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`
//         }
//       });

//       const campaigns = Array.isArray(res.data)
//         ? res.data
//         : res.data.content || [];

//       const onlyPrograms = campaigns.filter(
//         c => String(c.type).toUpperCase().trim() === "PROGRAM"
//       );

//       setPrograms(onlyPrograms);

//     } catch (err) {
//       console.error("Failed to load programs", err.response?.data || err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadPrograms();
//   }, []);

//   const openProgram = (program) => {
//     setSelectedProgram(program);
//     setShowModal(true);
//   };

//   return (
//     <div className="donation-card">

//       <h3>Programs</h3>

//       {loading && <p>Loading programs...</p>}

//       {!loading && programs.length === 0 && (
//         <p>No programs available</p>
//       )}

//       {!loading && programs.length > 0 && (
//         <table className="campaign-table">
//           <thead>
//             <tr>
//               <th>Title</th>
//               <th>Description</th>
//               <th>State</th>
//               <th>Type</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {programs.map(p => (
//               <tr key={p.id}>
//                 <td>{p.title}</td>
//                 <td>{p.description}</td>
//                 <td>{p.state === "ALL" ? "All India" : p.state}</td>
//                 <td>Long Term Program</td>
//                 <td>
//                   <button className="view-btn" onClick={() => openProgram(p)}>
//                     View Donations
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {showModal && (
//         <ProgramDonationModal
//           program={selectedProgram}
//           onClose={() => setShowModal(false)}
//         />
//       )}

//     </div>
//   );
// }

import { useEffect, useState } from "react";
import api from "./services/axiosInstance";
import EditCampaignModal from "./EditCampaignModal";
import ProgramDonationModal from "./ProgramDonationModal";
import "./donation.css";

export default function ProgramList() {

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // MODALS
  const [editProgram, setEditProgram] = useState(null);
  const [donationProgram, setDonationProgram] = useState(null);

  /* ================= LOAD PROGRAMS ================= */
  const loadPrograms = async () => {
    try {
      const res = await api.get("/admin/donation/campaigns", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      const campaigns = Array.isArray(res.data)
        ? res.data
        : res.data.content || [];

      const onlyPrograms = campaigns.filter(
        c => String(c.type).toUpperCase().trim() === "PROGRAM"
      );

      setPrograms(onlyPrograms);

    } catch (err) {
      console.error("Failed to load programs", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this program?")) return;

    try {
      await api.delete(`/admin/donation/campaign/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      alert("Program deleted successfully");
      loadPrograms();

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* ================= EDIT MODAL ================= */
  const handleEdit = (program) => {
    setEditProgram(program);
  };

  /* ================= DONATION MODAL ================= */
  const handleDonations = (program) => {
    setDonationProgram(program);
  };

  return (
    <div className="donation-card">

      <h3>Program Campaigns</h3>

      {loading && <p>Loading programs...</p>}
      {!loading && programs.length === 0 && <p>No programs available</p>}

      {!loading && programs.length > 0 && (
        <table className="campaign-table">

          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>State</th>
              <th>District</th>
              <th>Village</th>
              <th>Pincode</th>
              <th>Cover</th>
              <th>Gallery</th>
              <th>Target</th>
              <th>Raised</th>
              <th>Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {programs.map(p => (
              <tr key={p.id}>

                <td>{p.title}</td>
                {/* <td>{p.description}</td> */}
                <td>
  {(() => {
    const words = p.description ? p.description.split(" ") : [];
    const isExpanded = expandedId === p.id;

    const shortText = words.slice(0, 3).join(" ");

    return (
      <>
        {isExpanded ? p.description : shortText}
        {words.length > 3 && (
          <button
            onClick={() =>
              setExpandedId(isExpanded ? null : p.id)
            }
            style={{
              marginLeft: "6px",
              background: "none",
              border: "none",
              color: "#0d6efd",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            {isExpanded ? "View Less" : "View More"}
          </button>
        )}
      </>
    );
  })()}
</td>

                <td>{p.state === "ALL" ? "All India" : p.state}</td>
                <td>{p.district || "-"}</td>
                <td>{p.village || "-"}</td>
                <td>{p.pincode || "-"}</td>

                {/* COVER IMAGE */}
                <td>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} className="table-cover" alt="cover"/>
                  ) : "No Image"}
                </td>

                {/* GALLERY */}
                <td>
                  <div className="table-gallery">
                    {p.galleryImages && p.galleryImages.length > 0 ? (
                      <>
                        {p.galleryImages.slice(0,3).map((img,i)=>(
                          <img key={i} src={img} alt="gallery"/>
                        ))}
                        {p.galleryImages.length > 3 &&
                          <span>+{p.galleryImages.length - 3}</span>
                        }
                      </>
                    ) : "No Images"}
                  </div>
                </td>

                <td>₹{p.targetAmount}</td>
                <td>₹{p.raisedAmount}</td>
                <td>₹{(p.targetAmount || 0) - (p.raisedAmount || 0)}</td>

                <td className="action-buttons">
                  <button className="edit-btn" onClick={()=>handleEdit(p)}>Edit</button>
                  <button className="delete-btn" onClick={()=>handleDelete(p.id)}>Delete</button>
                  <button className="donation-btn" onClick={()=>handleDonations(p)}>Donations</button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editProgram && (
        <EditCampaignModal
          project={editProgram}
          onClose={()=>setEditProgram(null)}
          onUpdated={loadPrograms}
        />
      )}

      {/* ===== DONATION MODAL ===== */}
      {donationProgram && (
        <ProgramDonationModal
          program={donationProgram}
          onClose={()=>setDonationProgram(null)}
        />
      )}

    </div>
  );
}
