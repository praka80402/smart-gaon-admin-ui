import React, { useState, useEffect } from "react";
import {
  getAllCompetitions,
  createCompetition,
  getCompetitionEntries,
} from "../../services/gaonTalentService";

export default function Competitions() {
  const [competitions, setCompetitions] = useState([]);
  const [modal, setModal] = useState(false);

  // PARTICIPANTS MODAL
  const [, setParticipantsModal] = useState(false);

  const [, setParticipants] = useState([]);
  const [, setSelectedCompetition] = useState(null);

  // SEARCH, FILTER, PAGINATION
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "ART",
    state: "ALL",
    pincode: "",
  });

  useEffect(() => {
    loadCompetitions();
  }, );

  const parseDate = (dt) => new Date(dt.replace(" ", "T"));

  const loadCompetitions = async () => {
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
  };

  const loadParticipants = async (competitionId, competitionName) => {
    const res = await getCompetitionEntries(competitionId);

    setSelectedCompetition({ id: competitionId, name: competitionName });
    setParticipants(res.data);

    setTimeout(() => {
      setParticipantsModal(true);
    }, 0);
  };

  const saveCompetition = async () => {
    await createCompetition(form);
    setModal(false);
    loadCompetitions();
  };

  // const filteredCompetitions = competitions.filter((c) => {
  //   const text = searchText.toLowerCase();
  //   const matchesSearch =
  //     c.name.toLowerCase().includes(text) ||
  //     c.category.toLowerCase().includes(text) ||
  //     c.status.toLowerCase().includes(text);

  //   const matchesFilter =
  //     filterStatus === "ALL" || filterStatus === c.status;

  //   return matchesSearch && matchesFilter;
  // });
  const filteredCompetitions = competitions.filter((c) => {
  const text = (searchText || "").toLowerCase();

  const name = (c?.name || "").toLowerCase();
  const category = (c?.category || "").toLowerCase();
  const status = (c?.status || "").toLowerCase();
  const desc = (c?.description || "").toLowerCase();
  const state = (c?.state || "").toLowerCase();
  const pin = (c?.pincode || "").toLowerCase();

  const matchesSearch =
    name.includes(text) ||
    category.includes(text) ||
    status.includes(text) ||
    desc.includes(text) ||
    state.includes(text) ||
    pin.includes(text);

  const matchesFilter =
    filterStatus === "ALL" || filterStatus === c?.status;

  return matchesSearch && matchesFilter;
});


  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = indexOfLast - pageSize;
  const currentRows = filteredCompetitions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCompetitions.length / pageSize);

  return (
    <>
      {/* SEARCH + FILTER */}
      <div className="search-filter-box">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, category, status..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button className="search-btn">Search</button>

        <select
          className="filter-select"
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

        <button className="add-btn" onClick={() => setModal(true)}>
          + Create Competition
        </button>
      </div>

      {/* COMPETITIONS TABLE */}
      <table className="eng-table">
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
            <tr key={c.id} className={c.status === "ACTIVE" ? "active-row" : ""}>
              <td>
                <span
                  className={
                    c.status === "ACTIVE"
                      ? "status-active"
                      : c.status === "CLOSED"
                      ? "status-closed"
                      : "status-upcoming"
                  }
                >
                  {c.status}
                </span>
                {c.status === "ACTIVE" && <span className="live-badge">LIVE</span>}
              </td>

              <td>{c.name}</td>
              <td>{c.category}</td>
              <td>{c.startDate}</td>
              <td>{c.endDate}</td>
              <td>{c.description}</td>
              <td>{c.state}</td>
              <td>{c.pincode}</td>

              <td>
                <button
                  className="view-btn"
                  onClick={() => loadParticipants(c.id, c.name)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active-page" : ""}
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

      {/* CREATE COMPETITION MODAL */}
      {modal && (
        <div className="modal-bg">
          <div className="modal-card">
            <span className="modal-close-x" onClick={() => setModal(false)}>
              ✕
            </span>

            <div className="modal-header">Create Competition</div>

            <div className="modal-body">
              <label>Competition Name</label>
              <input
                placeholder="Competition Name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <label>Description</label>
<input
  placeholder="Description"
  onChange={(e) => setForm({ ...form, description: e.target.value })}
/>


              <label>Start Date</label>
              <input
                type="datetime-local"
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />

              <label>End Date</label>
              <input
                type="datetime-local"
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
              />

              <label>Category</label>
              <select
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>ART</option>
                <option>DANCING</option>
                <option>SINGING</option>
                <option>ENTERTAINMENT</option>
                <option>PUBLIC_SPEAKING</option>
              </select>

              {/* ⭐ NEW: STATE */}
              <label>State</label>
              <select
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              >
                <option value="ALL">All</option>
                <option value="BIHAR">Bihar</option>
                <option value="UP">UP</option>
                <option value="GUJRAT">Gujrat</option>
                <option value="MAHARASHTRA">Maharashtra</option>
                <option value="JHARKHAND">Jharkhand</option>
              </select>

              {/* ⭐ NEW: PINCODE */}
              <label>Pincode</label>
              <input
                placeholder="Enter pincode"
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>

            <div className="modal-footer">
              <button className="save-btn" onClick={saveCompetition}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
