import { useEffect, useState } from "react";
import api from "./services/axiosInstance";
import EditCampaignModal from "./EditCampaignModal";
import ProjectDonationModal from "./ProjectDonationModal";
import "./donation.css";

export default function ProjectList() {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [donationProject, setDonationProject] = useState(null);

  const loadProjects = async () => {

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

      setProjects(
        campaigns.filter(
          c => String(c.type).toUpperCase().trim() === "PROJECT"
        )
      );

    } catch (err) {

      console.error(
        "Failed to load projects",
        err.response?.data || err
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadProjects();

  }, []);

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this campaign?")) return;

    try {

      await api.delete(
        `/admin/donation/campaign/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      alert("Campaign deleted successfully");

      loadProjects();

    } catch {

      alert("Delete failed");

    }

  };

  return (

    <div className="vp-wrapper">

      <div className="vp-card">

        <h2 className="vp-title">
          Project Campaigns
        </h2>

        {loading && (
          <p className="vp-status">
            Loading projects...
          </p>
        )}

        {!loading && projects.length === 0 && (
          <p className="vp-status">
            No projects available
          </p>
        )}

        {!loading && projects.length > 0 && (

          <div className="vp-list">

            {projects.map((p) => {

              const words = p.description
                ? p.description.split(" ")
                : [];

              const isExpanded = expandedId === p.id;

              return (

                <div
                  className="vp-row-card"
                  key={p.id}
                >

                  {/* LEFT SIDE */}
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
                            {isExpanded ? "Less" : "More"}
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

                  {/* CENTER */}
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

                  {/* RIGHT SIDE */}
                  <div className="vp-actions-modern">

                    <button
                      className="vp-btn vp-btn-edit"
                      onClick={() => setEditProject(p)}
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
                      onClick={() => setDonationProject(p)}
                    >
                      Donations
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

      {editProject && (

        <EditCampaignModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onUpdated={loadProjects}
        />

      )}

      {donationProject && (

        <ProjectDonationModal
          project={donationProject}
          onClose={() => setDonationProject(null)}
        />

      )}

    </div>

  );

}