import React, { useState, useEffect } from "react";
import {
  getAllCompetitions,
  createCompetition,
  getCompetitionEntries
} from "../../services/gaonTalentService";

export default function Competitions() {
  const [competitions, setCompetitions] = useState([]);
  const [modal, setModal] = useState(false);

  // PARTICIPANTS MODAL
  const [participantsModal, setParticipantsModal] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

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
  });

  useEffect(() => {
    loadCompetitions();
  }, []);

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

    // SORT: ACTIVE → UPCOMING → CLOSED + latest first
    const sorted = updated.sort((a, b) => {
      const order = { ACTIVE: 1, UPCOMING: 2, CLOSED: 3 };
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }

      const dateA = new Date(a.startDate.replace(" ", "T"));
      const dateB = new Date(b.startDate.replace(" ", "T"));

      return dateB - dateA;
    });

    setCompetitions(sorted);
  };

  // ⭐ FIXED PARTICIPANTS LOADING
  const loadParticipants = async (competitionId, competitionName) => {
    const res = await getCompetitionEntries(competitionId);

    setSelectedCompetition({ id: competitionId, name: competitionName });
    setParticipants(res.data);

    // FIX: open modal AFTER state update
    setTimeout(() => {
      setParticipantsModal(true);
    }, 0);
  };

  const saveCompetition = async () => {
    await createCompetition(form);
    setModal(false);
    loadCompetitions();
  };

  // SEARCH + FILTER
  const filteredCompetitions = competitions.filter((c) => {
    const text = searchText.toLowerCase();
    const name = c.name ? c.name.toLowerCase() : "";
    const category = c.category ? c.category.toLowerCase() : "";
    const status = c.status ? c.status.toLowerCase() : "";

    const matchesSearch =
      name.includes(text) ||
      category.includes(text) ||
      status.includes(text);

    const matchesFilter =
      filterStatus === "ALL" || filterStatus === c.status;

    return matchesSearch && matchesFilter;
  });

  // PAGINATION
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
          <option value="UPCOMING">Upcoming</option>
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
            <th>Participants</th>
          </tr>
        </thead>

        <tbody>
          {currentRows.map((c) => (
            <tr
              key={c.id}
              className={c.status === "ACTIVE" ? "active-row" : ""}
            >
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

                {c.status === "ACTIVE" && (
                  <span className="live-badge">LIVE ●</span>
                )}
              </td>

              <td>{c.name}</td>
              <td>{c.category}</td>
              <td>{c.startDate}</td>
              <td>{c.endDate}</td>
              <td>{c.description}</td>

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

      {/* PARTICIPANTS MODAL */}
      {participantsModal && (
        <div className="modal-overlay">
          <div className="participants-modal">

            {/* CROSS BUTTON */}
            <button
              className="modal-close-btn"
              onClick={() => setParticipantsModal(false)}
            >
              ✕
            </button>

            <h2 className="modal-title">
              Participants — {selectedCompetition?.name}
            </h2>

            {participants.length === 0 ? (
              <p>No participants found.</p>
            ) : (
              <ul className="participant-list">
                {participants.map((p) => (
                  <li key={p.id}>
                    <b>{p.name}</b> — {p.phone} ({p.villageOrArea})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* CREATE COMPETITION MODAL */}
      {modal && (
        <div className="modal-bg">
          <div className="modal-card">
            <h3>Create Competition</h3>

            <input
              placeholder="Competition Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <textarea
              placeholder="Description"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
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

            <button className="save-btn" onClick={saveCompetition}>
              Save
            </button>
            <button className="close-btn" onClick={() => setModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </>
  );
}
