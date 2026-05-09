import { useState, useEffect, useCallback } from "react";

import {
  getAllCompetitions,
  createCompetition,
  getCompetitionEntries,
} from "../../services/gaonTalentService";

import "./createcompetition.css";

export default function Competitions() {

  /* ================= ROLE ================= */

  const role = localStorage.getItem("adminRole");

  const canCreate =
    role === "SUPER_ADMIN" ||
    role === "STATE_ADMIN";

  /* ================= STATES ================= */

  const [competitions, setCompetitions] =
    useState([]);

  const [modal, setModal] =
    useState(false);

  const [participantsModal,
    setParticipantsModal] =
    useState(false);

  const [participants,
    setParticipants] =
    useState([]);

  const [selectedCompetition,
    setSelectedCompetition] =
    useState(null);

  const [searchText,
    setSearchText] =
    useState("");

  const [filterStatus,
    setFilterStatus] =
    useState("ALL");

  const [currentPage,
    setCurrentPage] =
    useState(1);

  const pageSize = 5;
  const today = new Date()
  .toISOString()
  .split("T")[0];

  const [participantsPage,
  setParticipantsPage] =
  useState(1);

const participantsPageSize = 10;

/* ================= DROPDOWNS ================= */

const DEFAULT_STATES = [
  "ALL",
  "BIHAR",
  "UP",
  "GUJARAT",
  "MAHARASHTRA",
  "JHARKHAND",
];

const DEFAULT_CATEGORIES = [
  "ART",
  "DANCING",
  "SINGING",
  "ENTERTAINMENT",
  "PUBLIC_SPEAKING",
];

const [statesList, setStatesList] =
  useState(DEFAULT_STATES);

const [categoriesList,
  setCategoriesList] =
  useState(DEFAULT_CATEGORIES);

const [newState,
  setNewState] =
  useState("");

const [newCategory,
  setNewCategory] =
  useState("");

const [showStateInput,
  setShowStateInput] =
  useState(false);

const [showCategoryInput,
  setShowCategoryInput] =
  useState(false);

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

    const day = String(
      d.getDate()
    ).padStart(2, "0");

    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const parseDate = (dt) => {

    if (!dt) return null;

    const parts = dt.split("/");

    if (parts.length !== 3) return null;

    const day = Number(parts[0]);

    const month =
      Number(parts[1]) - 1;

    const year = Number(parts[2]);

    return new Date(
      year,
      month,
      day
    );
  };

  /* ================= LOAD COMPETITIONS ================= */

  const loadCompetitions =
    useCallback(async () => {

      try {

        const res =
          await getAllCompetitions();

        const comps =
          res?.data || [];

        const now = new Date();

        const updated =
  await Promise.all(

    comps.map(async (c) => {

      const start =
        parseDate(c.startDate);

      const end =
        parseDate(c.endDate);

      let status =
        "UPCOMING";

      if (
        now >= start &&
        now <= end
      ) {
        status = "ACTIVE";
      }

      else if (now > end) {
        status = "CLOSED";
      }

      let totalParticipants = 0;

      try {

        const participantRes =
          await getCompetitionEntries(
            c.id
          );

        totalParticipants =
          participantRes?.data?.length || 0;

      }

      catch (err) {

        console.error(
          "Participant Count Error:",
          err
        );
      }

      return {
        ...c,
        status,
        totalParticipants,
      };
    })
  );

        const sorted =
          updated.sort((a, b) => {

            const order = {
              ACTIVE: 1,
              UPCOMING: 2,
              CLOSED: 3,
            };

            if (
              order[a.status] !==
              order[b.status]
            ) {
              return (
                order[a.status] -
                order[b.status]
              );
            }

            return (
              new Date(b.startDate) -
              new Date(a.startDate)
            );
          });

        setCompetitions(sorted);

      } catch (err) {

        console.error(
          "Competition Load Error:",
          err
        );
      }

    }, []);

  useEffect(() => {
    loadCompetitions();
  }, [loadCompetitions]);

  /* ================= PARTICIPANTS ================= */

  const loadParticipants =
    async (
      competitionId,
      competitionName
    ) => {

      try {

        setSelectedCompetition({
          id: competitionId,
          name: competitionName,
        });

        setParticipants([]);

        setParticipantsModal(true);

        const res =
          await getCompetitionEntries(
            competitionId
          );

        setParticipants(
          res?.data || []
        );
        setParticipantsPage(1);

      } catch (error) {

        console.error(error);

        alert(
          "Failed to load participants"
        );

        setParticipantsModal(false);
      }
    };

  /* ================= SAVE ================= */

  const saveCompetition =
    async () => {

      try {

        if (!canCreate) {

          alert(
            "You are not authorized"
          );

          return;
        }

        const payload = {
          ...form,
          startDate:
            toDDMMYYYY(
              form.startDate
            ),

          endDate:
            toDDMMYYYY(
              form.endDate
            ),
        };

        await createCompetition(
          payload
        );

        setModal(false);

        loadCompetitions();

      } catch (err) {

        console.error(err);

        alert(
          "Failed to create competition"
        );
      }
    };
/* ================= CLEAR FORM ================= */

const clearForm = () => {

  setForm({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    category: "ART",
    state: "ALL",
    pincode: "",
  });

  setNewCategory("");

  setNewState("");

  setShowCategoryInput(false);

  setShowStateInput(false);
};
  /* ================= FILTER ================= */

  const filteredCompetitions =
    competitions.filter((c) => {

      const text =
        (
          searchText || ""
        ).toLowerCase();

      const matchesSearch =

        (c?.name || "")
          .toLowerCase()
          .includes(text)

        ||

        (c?.category || "")
          .toLowerCase()
          .includes(text)

        ||

        (c?.status || "")
          .toLowerCase()
          .includes(text)

        ||

        (c?.description || "")
          .toLowerCase()
          .includes(text)

        ||

        String(
        c?.pincode || ""
        )
        .toLowerCase()
        .includes(text)

        String(
  c?.state || "ALL"
)
.toLowerCase()
.trim()
.includes(
  text.toLowerCase().trim()
)
       

      const matchesFilter =

        filterStatus === "ALL"

        ||

        filterStatus === c?.status;

      return (
        matchesSearch &&
        matchesFilter
      );
    });

  /* ================= PAGINATION ================= */

  const indexOfLast =
    currentPage * pageSize;

  const indexOfFirst =
    indexOfLast - pageSize;

  const currentRows =
    filteredCompetitions.slice(
      indexOfFirst,
      indexOfLast
    );

  const totalPages =
    Math.ceil(
      filteredCompetitions.length /
      pageSize
    );

  const indexOfLastParticipant =
  participantsPage *
  participantsPageSize;

const indexOfFirstParticipant =
  indexOfLastParticipant -
  participantsPageSize;

const currentParticipants =
  participants.slice(
    indexOfFirstParticipant,
    indexOfLastParticipant
  );

const totalParticipantPages =
  Math.ceil(
    participants.length /
    participantsPageSize
  );
    return (
  <>

    {/* ================= PAGE ================= */}

    <div className="competition-page">

      {/* ================= TOOLBAR ================= */}

      <div className="competition-toolbar">

        <div className="competition-search-wrapper">

  <input
    type="text"
    placeholder="Search competitions..."
    className="competition-search-input"
    value={searchText}
    onChange={(e) =>
      setSearchText(e.target.value)
    }
  />

  {searchText && (

    <button
      className="competition-search-clear"
      onClick={() =>
        setSearchText("")
      }
    >
      ✕
    </button>

  )}

</div>
        <div className="competition-toolbar-right">

          <select
            className="competition-filter"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >

            <option value="ALL">
              All Categories
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="UPCOMING">
              Upcoming
            </option>

            <option value="CLOSED">
              Closed
            </option>

          </select>

          {canCreate && (

            <button
              className="competition-create-btn"
              onClick={() => setModal(true)}
            >
              + Create Competition
            </button>

          )}

        </div>

      </div>

      {/* ================= TABLE HEADER ================= */}

      <div className="competition-header-grid">

        <div>Status</div>

        <div>Details</div>

        <div>Timeline</div>

        <div>Description</div>

        <div>State</div>

        <div>Pincode</div>

        <div>Participants</div>

        <div>Actions</div>

      </div>

      {/* ================= COMPETITIONS ================= */}

      {currentRows.map((c) => (

        <div
          key={c.id}
          className="competition-card"
        >

          {/* STATUS */}

          <div className="competition-status-col">

            <span
              className={
                c.status === "ACTIVE"
                  ? "competition-status-active"
                  : c.status === "UPCOMING"
                  ? "competition-status-upcoming"
                  : "competition-status-closed"
              }
            >
              ● {c.status}
            </span>

          </div>

          {/* DETAILS */}

          <div className="competition-details-col">

            <div className="competition-icon-circle">

              {c.category === "ART" &&
                "🎨"}

              {c.category === "SINGING" &&
                "🎤"}

              {c.category === "DANCING" &&
                "💃"}

              {c.category ===
                "PUBLIC_SPEAKING" &&
                "🎙️"}

              {c.category ===
                "ENTERTAINMENT" &&
                "🎭"}

            </div>

            <div>

              <div className="competition-name">

                {c.name}

              </div>

              <div className="competition-category-chip">

                {c.category}

              </div>

            </div>

          </div>

          {/* TIMELINE */}

          <div className="competition-timeline-col">

            <div className="competition-date-line">

              📅 {c.startDate}

            </div>

            <div className="competition-date-to">

              to

            </div>

            <div className="competition-date-line">

              {c.endDate}

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="competition-description-col">

            {c.description ||
              "No Description"}

          </div>

          {/* STATE */}

          <div className="competition-state-col">

            <span className="competition-state-chip">

              {c.state || "ALL"}

            </span>

          </div>

          {/* PINCODE */}

          <div className="competition-pin-col">

            {c.pincode || "—"}

          </div>

          {/* PARTICIPANTS */}

          <div className="competition-participant-col">

            <div className="competition-participant-chip">

              👥 {c.totalParticipants || 0}

            </div>

          </div>

          {/* ACTION */}

          <div className="competition-action-col">

            <button
              className="competition-view-btn"
              onClick={() =>
                loadParticipants(
                  c.id,
                  c.name
                )
              }
            >
              View Details
            </button>

          </div>

        </div>

      ))}

      {/* ================= PAGINATION ================= */}

      {totalPages > 1 && (

        <div className="competition-pagination">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((p) => p - 1)
            }
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, i) => (

            <button
              key={i}
              className={
                currentPage === i + 1
                  ? "competition-page-active"
                  : ""
              }
              onClick={() =>
                setCurrentPage(i + 1)
              }
            >
              {i + 1}
            </button>

          ))}

          <button
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage((p) => p + 1)
            }
          >
            Next
          </button>

        </div>

      )}
            {/* ================= CREATE MODAL ================= */}

      {modal && canCreate && (

        <div className="competition-modal-backdrop">

          <div className="competition-modal">

            <span
              className="competition-modal-close"
              onClick={() => setModal(false)}
            >
              ✕
            </span>

            <div className="competition-modal-header">

              Create Competition

            </div>

            <div className="competition-modal-body">

              <label>
                Competition Name
              </label>

              <input
                placeholder="Competition Name"
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <label>
                Description
              </label>

             <textarea
  rows="7"
  className="competition-description-textarea"
  placeholder="Write competition details..."
  value={form.description}
  onChange={(e) =>
    setForm({
      ...form,
      description:
        e.target.value,
    })
  }
/>

              <label>
                Start Date
              </label>

             <input
  type="date"
  min={today}
  value={form.startDate}
  onChange={(e) => {

    const selectedDate =
      e.target.value;

    setForm({
      ...form,
      startDate: selectedDate,


      endDate:
        form.endDate &&
        form.endDate < selectedDate
          ? ""
          : form.endDate,
    });
  }}
/>

              <label>
                End Date
              </label>

              <input
                type="date"
                onChange={(e) =>
                  setForm({
                    ...form,
                    endDate:
                      e.target.value,
                  })
                }
              />

              <label>
  Category
</label>

<select
  value={form.category}
  onChange={(e) =>
    setForm({
      ...form,
      category:
        e.target.value,
    })
  }
>

  {categoriesList.map((cat) => (

    <option
      key={cat}
      value={cat}
    >
      {cat}
    </option>

  ))}

</select>

<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  }}
>

  {!showCategoryInput ? (

    <button
      type="button"
      className="competition-add-btn"
      onClick={() =>
        setShowCategoryInput(true)
      }
    >
      + Add New Category
    </button>

  ) : (

    <>

      <input
        type="text"
        placeholder="Enter category"
        value={newCategory}
        onChange={(e) =>
          setNewCategory(
            e.target.value
          )
        }
      />

      <button
        type="button"
        className="competition-add-btn"
        onClick={() => {

          if (
            !newCategory.trim()
          ) return;

          const formatted =
            newCategory
              .trim()
              .toUpperCase();

          if (
            categoriesList.includes(
              formatted
            )
          ) {

            alert(
              "Category already exists"
            );

            return;
          }

          setCategoriesList([
            ...categoriesList,
            formatted,
          ]);

          setForm({
            ...form,
            category:
              formatted,
          });

          setNewCategory("");

          setShowCategoryInput(
            false
          );
        }}
      >
        Save
      </button>

    </>

  )}

</div>

              <label>
  State
</label>

<select
  value={form.state}
  onChange={(e) =>
    setForm({
      ...form,
      state:
        e.target.value,
    })
  }
>

  {statesList.map((state) => (

    <option
      key={state}
      value={state}
    >
      {state}
    </option>

  ))}

</select>

<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  }}
>

  {!showStateInput ? (

    <button
      type="button"
      className="competition-add-btn"
      onClick={() =>
        setShowStateInput(true)
      }
    >
      + Add New State
    </button>

  ) : (

    <>

      <input
        type="text"
        placeholder="Enter state"
        value={newState}
        onChange={(e) =>
          setNewState(
            e.target.value
          )
        }
      />

      <button
        type="button"
        className="competition-add-btn"
        onClick={() => {

          if (
            !newState.trim()
          ) return;

          const formatted =
            newState
              .trim()
              .toUpperCase();

          if (
            statesList.includes(
              formatted
            )
          ) {

            alert(
              "State already exists"
            );

            return;
          }

          setStatesList([
            ...statesList,
            formatted,
          ]);

          setForm({
            ...form,
            state:
              formatted,
          });

          setNewState("");

          setShowStateInput(false);
        }}
      >
        Save
      </button>

    </>

  )}

</div>
              <label>
                Pincode
              </label>

              <input
                placeholder="Enter Pincode"
                onChange={(e) =>
                  setForm({
                    ...form,
                    pincode:
                      e.target.value,
                  })
                }
              />

            </div>

            <div className="competition-modal-footer">

  <button
    className="competition-save-btn"
    onClick={saveCompetition}
  >
    Save Competition
  </button>

  <button
    className="competition-clear-btn"
    onClick={clearForm}
  >
    Clear
  </button>

</div>
          </div>

        </div>

      )}

      {/* ================= PARTICIPANTS MODAL ================= */}

      {participantsModal && (

        <div className="competition-modal-backdrop">

          <div className="competition-modal competition-modal-lg">

            <span
              className="competition-modal-close"
              onClick={() =>
                setParticipantsModal(false)
              }
            >
              ✕
            </span>

            <div className="competition-modal-header">

              Participants —
              {" "}
              {selectedCompetition?.name}

            </div>

            <div className="competition-modal-body">

              {/* TABLE */}

              <table className="competition-participant-table">

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

                  {currentParticipants.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        style={{
                          textAlign:
                            "center",
                        }}
                      >
                        No participants found
                      </td>

                    </tr>

                  ) : (

                    currentParticipants.map((p) => (

                      <tr key={p.id}>

                        <td>
                          {p.name}
                        </td>

                        <td>
                          {p.phone}
                        </td>

                        <td>
                          {p.villageOrArea}
                        </td>

                        <td>
                          {p.category}
                        </td>

                        <td>
                          ❤️ {p.likes || 0}
                        </td>

                        <td>
                          💬 {p.comments || 0}
                        </td>

                        <td>
                          {p.referenceNumber}
                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

              {/* PAGINATION */}

              {totalParticipantPages > 1 && (

                <div className="competition-pagination">

                  <button
                    disabled={
                      participantsPage === 1
                    }
                    onClick={() =>
                      setParticipantsPage(
                        (p) => p - 1
                      )
                    }
                  >
                    Previous
                  </button>

                  {[...Array(
                    totalParticipantPages
                  )].map((_, i) => (

                    <button
                      key={i}
                      className={
                        participantsPage ===
                        i + 1
                          ? "competition-page-active"
                          : ""
                      }
                      onClick={() =>
                        setParticipantsPage(
                          i + 1
                        )
                      }
                    >
                      {i + 1}
                    </button>

                  ))}

                  <button
                    disabled={
                      participantsPage ===
                      totalParticipantPages
                    }
                    onClick={() =>
                      setParticipantsPage(
                        (p) => p + 1
                      )
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

    </div>

  </>
);
}