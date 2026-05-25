import { useEffect, useMemo, useState } from "react";
import api from "./services/axiosInstance";
import EditCampaignModal from "./EditCampaignModal";
import ProgramDonationModal from "./ProgramDonationModal";
import "./donation.css";

export default function ProgramList() {

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editProgram, setEditProgram] = useState(null);
  const [donationProgram, setDonationProgram] = useState(null);

  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const loadPrograms = async () => {

    try {

      const res = await api.get(
        "/admin/donation/campaigns",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      const campaigns = Array.isArray(res.data)
        ? res.data
        : res.data.content || [];

      setPrograms(
        campaigns.filter(
          c => String(c.type).toUpperCase().trim() === "PROGRAM"
        )
      );

    } catch (err) {

      console.error(
        "Failed to load programs",
        err.response?.data || err
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadPrograms();

  }, []);

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this program?")) return;

    try {

      await api.delete(
        `/admin/donation/campaign/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      alert("Program deleted successfully");

      loadPrograms();

    } catch {

      alert("Delete failed");

    }

  };

  const totalPages = Math.ceil(
    programs.length / ITEMS_PER_PAGE
  );

  const paginatedPrograms = useMemo(() => {

    const start =
      (page - 1) * ITEMS_PER_PAGE;

    return programs.slice(
      start,
      start + ITEMS_PER_PAGE
    );

  }, [programs, page]);

  return (

    <div className="vp-wrapper">

      <div className="vp-card">

        <h2 className="vp-title">
          Program Campaigns
        </h2>

        {loading && (

          <div className="vp-loader-wrap">

            {[1,2,3].map(i => (

              <div
                className="vp-skeleton-card"
                key={i}
              />

            ))}

          </div>

        )}

        {!loading && programs.length === 0 && (

          <p className="vp-status">
            No programs available
          </p>

        )}

        {!loading && programs.length > 0 && (

          <>

            <div className="vp-list">

              {paginatedPrograms.map((p) => {

                const words = p.description
                  ? p.description.split(" ")
                  : [];

                const isExpanded =
                  expandedId === p.id;

                return (

                  <div
                    className="vp-row-card"
                    key={p.id}
                  >

                    <div className="vp-left">

                      <div className="vp-cover-wrap">

                        {p.imageUrl ? (

                          <img
                            src={p.imageUrl}
                            className="vp-cover-img-lg"
                            alt="cover"
                          />

                        ) : (

                          <div className="vp-no-cover">
                            No Image
                          </div>

                        )}

                      </div>

                      <div className="vp-info">

                        <h3>{p.title}</h3>

                        <p>

                          {isExpanded
                            ? p.description
                            : words.slice(0, 12).join(" ")
                          }

                          {words.length > 12 && (

                            <button
                              className="vp-viewmore"
                              onClick={() =>
                                setExpandedId(
                                  isExpanded ? null : p.id
                                )
                              }
                            >
                              {isExpanded
                                ? "Less"
                                : "More"}
                            </button>

                          )}

                        </p>

                        <div className="vp-tags">

                          <span>
                            {p.state === "ALL"
                              ? "All India"
                              : p.state}
                          </span>

                          {p.district && (
                            <span>{p.district}</span>
                          )}

                          {p.village && (
                            <span>{p.village}</span>
                          )}

                        </div>

                      </div>

                    </div>

                    <div className="vp-center">

                      <div className="vp-money-box">
                        <label>Target</label>
                        <strong>
                          ₹{p.targetAmount}
                        </strong>
                      </div>

                      <div className="vp-money-box">
                        <label>Raised</label>
                        <strong className="green">
                          ₹{p.raisedAmount}
                        </strong>
                      </div>

                      <div className="vp-money-box">
                        <label>Remaining</label>
                        <strong className="red">
                          ₹{
                            (p.targetAmount || 0) -
                            (p.raisedAmount || 0)
                          }
                        </strong>
                      </div>

                    </div>

                    <div className="vp-actions-modern">

                      <button
                        className="vp-btn vp-btn-edit"
                        onClick={() => setEditProgram(p)}
                      >
                        Edit
                      </button>

                      <button
                        className="vp-btn vp-btn-delete"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>

                      <button
                        className="vp-btn vp-btn-donations"
                        onClick={() => setDonationProgram(p)}
                      >
                        Donations
                      </button>

                    </div>

                  </div>

                );

              })}

            </div>

            <div className="vp-pagination">

              <button
                disabled={page === 1}
                onClick={() =>
                  setPage(prev => prev - 1)
                }
              >
                Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage(prev => prev + 1)
                }
              >
                Next
              </button>

            </div>

          </>

        )}

      </div>

      {editProgram && (

        <EditCampaignModal
          project={editProgram}
          onClose={() => setEditProgram(null)}
          onUpdated={loadPrograms}
        />

      )}

      {donationProgram && (

        <ProgramDonationModal
          program={donationProgram}
          onClose={() => setDonationProgram(null)}
        />

      )}

    </div>

  );

}