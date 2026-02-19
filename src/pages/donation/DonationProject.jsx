// import { useEffect, useState } from "react";
// import api from "./services/axiosInstance";
// import ProjectDonationModal from "./ProjectDonationModal";
// import "./donation.css";

// export default function ProjectList() {

//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const loadProjects = async () => {
//     try {
//       const res = await api.get("/admin/donation/campaigns", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`
//         }
//       });

//       const campaigns = Array.isArray(res.data)
//         ? res.data
//         : res.data.content || [];

//       const onlyProjects = campaigns.filter(
//         c => String(c.type).toUpperCase().trim() === "PROJECT"
//       );

//       setProjects(onlyProjects);

//     } catch (err) {
//       console.error("Failed to load projects", err.response?.data || err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const openProject = (project) => {
//     setSelectedProject(project);
//     setShowModal(true);
//   };

//   return (
//     <div className="donation-card">

//       <h3>Projects</h3>

//       {loading && <p>Loading projects...</p>}

//       {!loading && projects.length === 0 && <p>No projects available</p>}

//       {!loading && projects.length > 0 && (
//         <table className="campaign-table">
//           <thead>
//             <tr>
//               <th>Title</th>
//               <th>Description</th>
//               <th>State</th>
//               <th>Target</th>
//               <th>Raised</th>
//               <th>Remaining</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {projects.map(p => (
//               <tr key={p.id}>
//                 <td>{p.title}</td>
//                 <td>{p.description}</td>
//                 <td>{p.state === "ALL" ? "All India" : p.state}</td>
//                 <td>₹{p.targetAmount}</td>
//                 <td>₹{p.raisedAmount}</td>
//                 <td>₹{(p.targetAmount || 0) - (p.raisedAmount || 0)}</td>
//                 <td>
//                   <button className="view-btn" onClick={() => openProject(p)}>
//                     View
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {showModal && (
//         <ProjectDonationModal
//           project={selectedProject}
//           onClose={() => setShowModal(false)}
//         />
//       )}

//     </div>
//   );
// }

import { useEffect, useState } from "react";
import api from "./services/axiosInstance";
import EditCampaignModal from "./EditCampaignModal";
import ProjectDonationModal from "./ProjectDonationModal";
import "./donation.css";

export default function ProjectList() {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editProject, setEditProject] = useState(null);
  const [donationProject, setDonationProject] = useState(null);

  /* ================= LOAD PROJECTS ================= */
  const loadProjects = async () => {
    try {
      const res = await api.get("/admin/donation/campaigns", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      const campaigns = Array.isArray(res.data)
        ? res.data
        : res.data.content || [];

      const onlyProjects = campaigns.filter(
        c => String(c.type).toUpperCase().trim() === "PROJECT"
      );

      setProjects(onlyProjects);

    } catch (err) {
      console.error("Failed to load projects", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;

    try {
      await api.delete(`/admin/donation/campaign/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      alert("Campaign deleted successfully");
      loadProjects();

    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (project) => {
    setEditProject(project);
  };

  /* ================= DONATION MODAL ================= */
  const handleDonations = (project) => {
    setDonationProject(project);
  };

  return (
    <div className="donation-card">

      <h3>Project Campaigns</h3>

      {loading && <p>Loading projects...</p>}
      {!loading && projects.length === 0 && <p>No projects available</p>}

      {!loading && projects.length > 0 && (
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
            {projects.map(p => (
              <tr key={p.id}>

                <td>{p.title}</td>
                <td>{p.description}</td>
                <td>{p.state === "ALL" ? "All India" : p.state}</td>
                <td>{p.district || "-"}</td>
                <td>{p.village || "-"}</td>
                <td>{p.pincode || "-"}</td>

                <td>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} className="table-cover" alt="cover"/>
                  ) : "No Image"}
                </td>

                <td>
                  <div className="table-gallery">
                    {p.galleryImages?.slice(0,3).map((img,i)=>(
                      <img key={i} src={img} alt="gallery"/>
                    ))}
                  </div>
                </td>

                <td>₹{p.targetAmount}</td>
                <td>₹{p.raisedAmount}</td>
                <td>₹{(p.targetAmount || 0) - (p.raisedAmount || 0)}</td>

                <td className="action-buttons">
                  <button className="edit-btn" onClick={()=>handleEdit(p)}>Edit</button>
                  <button className="delete-btn" onClick={()=>handleDelete(p.id)}>Delete</button>
                  <button className="view-btn" onClick={()=>handleDonations(p)}>Donations</button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* EDIT MODAL */}
      {editProject && (
        <EditCampaignModal
          project={editProject}
          onClose={()=>setEditProject(null)}
          onUpdated={loadProjects}
        />
      )}

      {/* DONATION MODAL */}
      {donationProject && (
        <ProjectDonationModal
          project={donationProject}
          onClose={()=>setDonationProject(null)}
        />
      )}

    </div>
  );
}

