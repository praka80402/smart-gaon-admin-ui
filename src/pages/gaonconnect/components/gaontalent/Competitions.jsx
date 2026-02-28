// import { useState, useEffect,useCallback } from "react";
// import {
//   getAllCompetitions,
//   createCompetition,
//   getCompetitionEntries,
// } from "../../services/gaonTalentService";
// import "./createcompetition.css";
// export default function Competitions() {

//   const [competitions, setCompetitions] = useState([]);
//   const [modal, setModal] = useState(false);

//   // PARTICIPANTS MODAL
// const [participantsModal, setParticipantsModal] = useState(false);
// const [participants, setParticipants] = useState([]);
// const [selectedCompetition, setSelectedCompetition] = useState(null);


//   // SEARCH, FILTER, PAGINATION
//   const [searchText, setSearchText] = useState("");
//   const [filterStatus, setFilterStatus] = useState("ALL");
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 7;

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//     category: "ART",
//     state: "ALL",
//     pincode: "",
//   });

 
//   const toDDMMYYYY = (date) => {
//   if (!date) return "";

//   const d = new Date(date);

//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();

//   return `${day}/${month}/${year}`;
// };



// const parseDate = (dt) => {
//   if (!dt) return null;

//   // Format: "dd/MM/yyyy"
//   const parts = dt.split("/");

//   if (parts.length !== 3) return null;

//   const day = Number(parts[0]);
//   const month = Number(parts[1]) - 1; // JS months start from 0
//   const year = Number(parts[2]);

//   return new Date(year, month, day);
// };

// const loadCompetitions = useCallback(async () => {
//   const res = await getAllCompetitions();
//   const comps = res.data;
//   const now = new Date();

//   const updated = comps.map((c) => {
//     const start = parseDate(c.startDate);
//     const end = parseDate(c.endDate);

//     let status = "UPCOMING";
//     if (now >= start && now <= end) status = "ACTIVE";
//     else if (now > end) status = "CLOSED";

//     return { ...c, status };
//   });

//   const sorted = updated.sort((a, b) => {
//     const order = { ACTIVE: 1, UPCOMING: 2, CLOSED: 3 };

//     if (order[a.status] !== order[b.status]) {
//       return order[a.status] - order[b.status];
//     }

//     return new Date(b.startDate) - new Date(a.startDate);
//   });

//   setCompetitions(sorted);
// }, []);

//   useEffect(() => {
//   loadCompetitions();
// }, [loadCompetitions]);

//   const loadParticipants = async (competitionId, competitionName) => {
//     const res = await getCompetitionEntries(competitionId);

//     setSelectedCompetition({ id: competitionId, name: competitionName });
//     setParticipants(res.data);

//     setTimeout(() => {
//       setParticipantsModal(true);
//     }, 0);
//   };

//   const saveCompetition = async () => {

//     const payload = {
//     ...form,
//     startDate: toDDMMYYYY(form.startDate),
//     endDate: toDDMMYYYY(form.endDate),
//   };
//   await createCompetition(payload);
//     // await createCompetition(form);
//     setModal(false);
//     loadCompetitions();
//   };

  
//   const filteredCompetitions = competitions.filter((c) => {
 
//   const text = (searchText || "").toLowerCase();

//   const name = (c?.name || "").toLowerCase();
//   const category = (c?.category || "").toLowerCase();
//   const status = (c?.status || "").toLowerCase();
//   const desc = (c?.description || "").toLowerCase();
//   const state = (c?.state || "").toLowerCase();
//   const pin = (c?.pincode || "").toLowerCase();

//   const matchesSearch =
//     name.includes(text) ||
//     category.includes(text) ||
//     status.includes(text) ||
//     desc.includes(text) ||
//     state.includes(text) ||
//     pin.includes(text);

//   const matchesFilter =
//     filterStatus === "ALL" || filterStatus === c?.status;

//   return matchesSearch && matchesFilter;
// });


//   const indexOfLast = currentPage * pageSize;
//   const indexOfFirst = indexOfLast - pageSize;
//   const currentRows = filteredCompetitions.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredCompetitions.length / pageSize);

//   return (
//     <>
//       {/* SEARCH + FILTER */}
//       <div className="comp-toolbar">
//         <input
//           className="comp-search"
//           type="text"
//           placeholder="Search by name, category, status..."
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//         />

//         <button className="comp-search-btn">Search</button>

//         <select
//           className="comp-filter"
//           value={filterStatus}
//           onChange={(e) => {
//             setFilterStatus(e.target.value);
//             setCurrentPage(1);
//           }}
//         >
//           <option value="ALL">All</option>
//           <option value="ACTIVE">Active</option>
//           <option value="CLOSED">Closed</option>
//         </select>

//         <button className="comp-add-btn" onClick={() => setModal(true)}>
//           + Create Competition
//         </button>
//       </div>

//       {/* COMPETITIONS TABLE */}
//       <table className="comp-table">
//         <thead>
//           <tr>
//             <th>Status</th>
//             <th>Name</th>
//             <th>Category</th>
//             <th>Start</th>
//             <th>End</th>
//             <th>Description</th>
//             <th>State</th>
//             <th>Pincode</th>
//             <th>Participants</th>
//           </tr>
//         </thead>

//         <tbody>
//           {currentRows.map((c) => (
//             <tr key={c.id} className={c.status === "ACTIVE" ? "comp-row-active" : ""}>
//               <td>
//                 <span
//                   className={
//                     c.status === "ACTIVE"
//                       ? "comp-status-active"
//                       : c.status === "CLOSED"
//                       ? "comp-status-closed"
//                       : "comp-status-upcoming"
//                   }
//                 >
//                   {c.status}
//                 </span>
//                 {c.status === "ACTIVE" && <span className="comp-live-badge">LIVE</span>}
//               </td>

//               <td>{c.name}</td>
//               <td>{c.category}</td>
//               <td>{c.startDate}</td>
//               <td>{c.endDate}</td>
//               <td>{c.description}</td>
//               <td>{c.state}</td>
//               <td>{c.pincode}</td>

//               <td>
//                 <button
//                   className="comp-view-btn"
//                   onClick={() => loadParticipants(c.id, c.name)}
//                 >
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* PAGINATION */}
//       <div className="comp-pagination">
//         <button
//           disabled={currentPage === 1}
//           onClick={() => setCurrentPage((p) => p - 1)}
//         >
//           Prev
//         </button>

//         {[...Array(totalPages)].map((_, i) => (
//           <button
//             key={i}
//             className={currentPage === i + 1 ? "comp-active-page" : ""}
//             onClick={() => setCurrentPage(i + 1)}
//           >
//             {i + 1}
//           </button>
//         ))}

//         <button
//           disabled={currentPage === totalPages}
//           onClick={() => setCurrentPage((p) => p + 1)}
//         >
//           Next
//         </button>
//       </div>

//       {/* CREATE COMPETITION MODAL */}
//       {modal && (
//         <div className="comp-modal-backdrop">
//           <div className="comp-modal">
//             <span className="comp-modal-close" onClick={() => setModal(false)}>
//               ✕
//             </span>

//             <div className="comp-modal-header">Create Competition</div>

//             <div className="comp-modal-body">
//               <label>Competition Name</label>
//               <input
//                 placeholder="Competition Name"
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//               />

//               <label>Description</label>
// <input
//   placeholder="Description"
//   onChange={(e) => setForm({ ...form, description: e.target.value })}
// />


//               <label>Start Date</label>
//              <input
//   type="date"
//   onChange={(e) =>
//     setForm({ ...form, startDate: e.target.value })
//   }
// />

//               <label>End Date</label>
//               <input
//   type="date"
//   onChange={(e) =>
//     setForm({ ...form, endDate: e.target.value })
//   }
// />

//               <label>Category</label>
//               <select
//                 onChange={(e) => setForm({ ...form, category: e.target.value })}
//               >
//                 <option>ART</option>
//                 <option>DANCING</option>
//                 <option>SINGING</option>
//                 <option>ENTERTAINMENT</option>
//                 <option>PUBLIC_SPEAKING</option>
//               </select>

//               {/* ⭐ NEW: STATE */}
//               <label>State</label>
//               <select
//               value={form.state}
//                 onChange={(e) => setForm({ ...form, state: e.target.value })}
//               >
//                 <option value="ALL">All</option>
//                 <option value="BIHAR">Bihar</option>
//                 <option value="UP">UP</option>
//                 <option value="GUJRAT">Gujrat</option>
//                 <option value="MAHARASHTRA">Maharashtra</option>
//                 <option value="JHARKHAND">Jharkhand</option>
//               </select>

//               {/* ⭐ NEW: PINCODE */}
//               <label>Pincode</label>
//               <input
//                 placeholder="Enter pincode"
//                 onChange={(e) => setForm({ ...form, pincode: e.target.value })}
//               />
//             </div>

//             <div className="comp-modal-footer">
//               <button className="comp-save-btn" onClick={saveCompetition}>
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
    
//     {/* PARTICIPANTS MODAL */}
// {participantsModal && (
//   <div className="comp-modal-backdrop">
//     <div className="comp-modal comp-modal-lg">

//       <span
//         className="comp-modal-close"
//         onClick={() => setParticipantsModal(false)}
//       >
//         ✕
//       </span>

//       <h3>
//         Participants — {selectedCompetition?.name}
//       </h3>

//       <table className="comp-table" style={{ marginTop: "15px" }}>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Phone</th>
//             <th>Village</th>
//             <th>Category</th>
//             <th>Likes</th>
//             <th>Comments</th>
//             <th>Reference</th>
//           </tr>
//         </thead>

//         <tbody>
//           {participants.length === 0 ? (
//             <tr>
//               <td colSpan="7" style={{ textAlign: "center" }}>
//                 No participants found
//               </td>
//             </tr>
//           ) : (
//             participants.map((p) => (
//               <tr key={p.id}>
//                 <td>{p.name}</td>
//                 <td>{p.phone}</td>
//                 <td>{p.villageOrArea}</td>
//                 <td>{p.category}</td>
//                 <td>{p.likes}</td>
//                 <td>{p.comments}</td>
//                 <td>{p.referenceNumber}</td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>

//     </div>
//   </div>
// )}
// </>
//   );
// }


import { useState, useEffect, useCallback } from "react";
import {
  getAllCompetitions,
  createCompetition,
  getCompetitionEntries,
} from "../../services/gaonTalentService";
import "./createcompetition.css";

export default function Competitions() {

  /* ================= ROLE CONTROL ================= */

  const role = localStorage.getItem("adminRole");

  const canCreate =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  /* ================= STATE ================= */

  const [competitions, setCompetitions] = useState([]);
  const [modal, setModal] = useState(false);

  const [participantsModal, setParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [participantsPage, setParticipantsPage] = useState(1);
const participantsPageSize = 5;
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "ART",
    state: "ALL",
    pincode: "",
  });

  /* ================= DATE HELPERS ================= */

  const toDDMMYYYY = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dt) => {
    if (!dt) return null;
    const parts = dt.split("/");
    if (parts.length !== 3) return null;
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);
    return new Date(year, month, day);
  };

  /* ================= LOAD COMPETITIONS ================= */

  const loadCompetitions = useCallback(async () => {

    const res = await getAllCompetitions();
    const comps = res.data;
    const now = new Date();

    const updated = comps.map((c) => {
      const start = parseDate(c.startDate);
      const end = parseDate(c.endDate);

      let status = "UPCOMING";
      if (now >= start && now <= end) status = "ACTIVE";
      else if (now > end) status = "CLOSED";

      return { ...c, status };
    });

    const sorted = updated.sort((a, b) => {
      const order = { ACTIVE: 1, UPCOMING: 2, CLOSED: 3 };
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      return new Date(b.startDate) - new Date(a.startDate);
    });

    setCompetitions(sorted);

  }, []);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  /* ================= PARTICIPANTS ================= */

  const loadParticipants = async (competitionId, competitionName) => {
  try {
    // Open modal first
    setSelectedCompetition({
      id: competitionId,
      name: competitionName,
    });

    setParticipants([]);      // clear old data
    setParticipantsModal(true);

    const res = await getCompetitionEntries(competitionId);

    setParticipants(res?.data || []);
  } catch (error) {
    console.error("Error loading participants:", error);
    alert("Failed to load participants");
    setParticipantsModal(false);
  }
};

  /* ================= SAVE COMPETITION ================= */

  const saveCompetition = async () => {

    if (!canCreate) {
      alert("You are not authorized to create competition.");
      return;
    }

    const payload = {
      ...form,
      startDate: toDDMMYYYY(form.startDate),
      endDate: toDDMMYYYY(form.endDate),
    };

    await createCompetition(payload);

    setModal(false);
    loadCompetitions();
  };

  /* ================= FILTER ================= */

  const filteredCompetitions = competitions.filter((c) => {

    const text = (searchText || "").toLowerCase();

    const matchesSearch =
      (c?.name || "").toLowerCase().includes(text) ||
      (c?.category || "").toLowerCase().includes(text) ||
      (c?.status || "").toLowerCase().includes(text) ||
      (c?.description || "").toLowerCase().includes(text) ||
      (c?.state || "").toLowerCase().includes(text) ||
      (c?.pincode || "").toLowerCase().includes(text);

    const matchesFilter =
      filterStatus === "ALL" || filterStatus === c?.status;

    return matchesSearch && matchesFilter;
  });

  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentRows = filteredCompetitions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCompetitions.length / pageSize);
const indexOfLastParticipant = participantsPage * participantsPageSize;
const indexOfFirstParticipant =
  indexOfLastParticipant - participantsPageSize;

const currentParticipants = participants.slice(
  indexOfFirstParticipant,
  indexOfLastParticipant
);

const totalParticipantPages = Math.ceil(
  participants.length / participantsPageSize
);
  /* ================= UI ================= */

  return (
    <>
      {/* TOOLBAR */}
      <div className="comp-toolbar">

        <input
          className="comp-search"
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          className="comp-filter"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="CLOSED">Closed</option>
        </select>

        {/* 🔒 CREATE BUTTON HIDDEN FOR DISTRICT & VILLAGE */}
        {canCreate && (
          <button
            className="comp-add-btn"
            onClick={() => setModal(true)}
          >
            + Create Competition
          </button>
        )}

      </div>

      {/* TABLE */}
      <table className="comp-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Category</th>
            <th>Start</th>
            <th>End</th>
            <th>Description</th>
            <th>State</th>
            <th>Pincode</th>
            <th>Participants</th>
          </tr>
        </thead>

        <tbody>
          {currentRows.map((c) => (
            <tr key={c.id}>
              <td>{c.status}</td>
              <td>{c.name}</td>
              <td>{c.category}</td>
              <td>{c.startDate}</td>
              <td>{c.endDate}</td>
              <td>{c.description}</td>
              <td>{c.state}</td>
              <td>{c.pincode}</td>
              <td>
                <button
                  className="comp-view-btn"
                  onClick={() => loadParticipants(c.id, c.name)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 👇 ADD PAGINATION HERE */}
{totalPages > 1 && (
  <div className="comp-pagination">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        className={currentPage === i + 1 ? "comp-active-page" : ""}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
    >
      Next
    </button>
  </div>
)}

      {/* CREATE MODAL */}
      {modal && canCreate && (
        <div className="comp-modal-backdrop">
          <div className="comp-modal">

            <span
              className="comp-modal-close"
              onClick={() => setModal(false)}
            >
              ✕
            </span>

            <div className="comp-modal-header">
              Create Competition
            </div>

            <div className="comp-modal-body">

              <label>Name</label>
              <input
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <label>Description</label>
              <input
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <label>Start Date</label>
              <input
                type="date"
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />

              <label>End Date</label>
              <input
                type="date"
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
              />

              <label>Category</label>
              <select
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option>ART</option>
                <option>DANCING</option>
                <option>SINGING</option>
                <option>ENTERTAINMENT</option>
                <option>PUBLIC_SPEAKING</option>
              </select>

              <label>State</label>
              <select
                value={form.state}
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value })
                }
              >
                <option value="ALL">All</option>
                <option value="BIHAR">Bihar</option>
                <option value="UP">UP</option>
                <option value="GUJARAT">Gujarat</option>
                <option value="MAHARASHTRA">Maharashtra</option>
                <option value="JHARKHAND">Jharkhand</option>
              </select>

              <label>Pincode</label>
              <input
                onChange={(e) =>
                  setForm({ ...form, pincode: e.target.value })
                }
              />

            </div>

            

            <div className="comp-modal-footer">
              <button
                className="comp-save-btn"
                onClick={saveCompetition}
              >
                Save
              </button>
            </div>

          </div>


        </div>
      )}

{/* PARTICIPANTS MODAL */}
{participantsModal && (
  <div className="comp-modal-backdrop">
    <div className="comp-modal comp-modal-lg">

      <span
        className="comp-modal-close"
        onClick={() => setParticipantsModal(false)}
      >
        ✕
      </span>

      <div className="comp-modal-header">
        Participants — {selectedCompetition?.name}
      </div>

      <div className="comp-modal-body">

        <table className="comp-table" style={{ marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Village</th>
              <th>Category</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Reference</th>
            </tr>
          </thead>

          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No participants found
                </td>
              </tr>
            ) : (
              participants.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>{p.villageOrArea}</td>
                  <td>{p.category}</td>
                  <td>{p.likes}</td>
                  <td>{p.comments}</td>
                  <td>{p.referenceNumber}</td>
                </tr>
              ))
            )}
          </tbody>
          
        </table>
        {totalParticipantPages > 1 && (
          <div className="comp-pagination">
            <button
              disabled={participantsPage === 1}
              onClick={() =>
                setParticipantsPage((p) => p - 1)
              }
            >
              Prev
            </button>

            {[...Array(totalParticipantPages)].map((_, i) => (
              <button
                key={i}
                className={
                  participantsPage === i + 1
                    ? "comp-active-page"
                    : ""
                }
                onClick={() => setParticipantsPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={
                participantsPage === totalParticipantPages
              }
              onClick={() =>
                setParticipantsPage((p) => p + 1)
              }
            >
              Next
            </button>
          </div>
        )}

      </div>

    </div>
  </div>
)}

    </>
  );
}