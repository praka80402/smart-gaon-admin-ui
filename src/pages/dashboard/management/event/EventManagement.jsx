import { useEffect, useState } from "react";
import "./eventManagement.css";

import {
  getEvents,
  getEventsBySection,
  deleteEvent,
  createEvent,
  updateEvent
} from "./event.service";

export const resolveButtonText = (event) => {
  if (event.description) {
    const match = event.description.match(/<!--BTN:([^-]+)-->/);
    if (match) return match[1].trim();
  }
  if (event.buttonText && typeof event.buttonText === "string" && event.buttonText !== "Register Now") {
    return event.buttonText.trim();
  }
  if (event.buttonName && typeof event.buttonName === "string" && event.buttonName !== "Register Now") {
    return event.buttonName.trim();
  }
  if (event.buttonType && typeof event.buttonType === "string" && event.buttonType !== "Register Now") {
    return event.buttonType.trim();
  }
  if (event.venue && typeof event.venue === "string" && event.venue.startsWith("BUTTON:")) {
    return event.venue.replace("BUTTON:", "").trim();
  }
  if (event.buttonText && typeof event.buttonText === "string") {
    return event.buttonText.trim();
  }
  return "Register Now";
};

export default function EventManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [venue, setVenue] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [buttonText, setButtonText] = useState("Register Now");
  const [sectionType, setSectionType] = useState("LANDING_EVENT");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [featured, setFeatured] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const isRegisterNow = buttonText === "Register Now";

  const loadEvents = async () => {
    try {
      let data = [];
      if (filter) {
        data = await getEventsBySection(filter);
      } else {
        data = await getEvents();
      }
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load events failed:", err);
      setEvents([]);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImage(null);
    setStartDate("");
    setEndDate("");
    setLocation("");
    setVenue("");
    setRegistrationLink("");
    setButtonText("Register Now");
    setSectionType("LANDING_EVENT");
    setDisplayOrder(1);
    setFeatured(false);
  };

  const handleSaveEvent = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in Event Title and Description");
      return;
    }

    if (isRegisterNow && (!startDate || !endDate || !location.trim() || !venue.trim())) {
      alert("Please fill all required fields: Start Date, End Date, Location, and Venue");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();

      // For non-"Register Now" events, the backend still requires non-empty date & location fields
      // to avoid Spring Boot parsing/validation exceptions (which trigger 401 logout).
      const today = new Date().toISOString().split("T")[0];
      const finalStartDate = isRegisterNow ? startDate : (startDate || today);
      const finalEndDate = isRegisterNow ? endDate : (endDate || startDate || today);
      const finalLocation = isRegisterNow ? location.trim() : (location.trim() || "Online");
      const finalVenue = isRegisterNow ? venue.trim() : "";

      const cleanDesc = description.replace(/\s*<!--BTN:[^-]+-->/g, "").trim();
      const finalDescription = (buttonText !== "Register Now")
        ? `${cleanDesc}\n<!--BTN:${buttonText}-->`
        : cleanDesc;

      formData.append("title", title.trim());
      formData.append("description", finalDescription);
      formData.append("startDate", finalStartDate);
      formData.append("endDate", finalEndDate);
      formData.append("location", finalLocation);
      formData.append("venue", finalVenue);
      formData.append("registrationLink", registrationLink.trim());
      formData.append("buttonText", buttonText);
      formData.append("buttonName", buttonText);
      formData.append("buttonType", buttonText);
      formData.append("sectionType", sectionType);
      formData.append("displayOrder", displayOrder);
      formData.append("featured", featured);
      formData.append("active", true);

      if (image) {
        formData.append("image", image);
      }

      if (editingId) {
        await updateEvent(editingId, formData);
        alert("Event Updated Successfully ✅");
      } else {
        await createEvent(formData);
        alert("Event Created Successfully ✅");
      }

      resetForm();
      loadEvents();
      setActiveTab("all");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to save event ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setTitle(event.title || "");
    const rawDesc = event.description || "";
    const cleanDesc = rawDesc.replace(/\s*<!--BTN:[^-]+-->/g, "").trim();
    setDescription(cleanDesc);
    setStartDate(event.startDate || "");
    setEndDate(event.endDate || "");
    setLocation(event.location && event.location.startsWith("BUTTON:") ? "" : (event.location || ""));
    setVenue(event.venue && event.venue.startsWith("BUTTON:") ? "" : (event.venue || ""));
    setRegistrationLink(event.registrationLink || "");
    const detectedBtn = resolveButtonText(event);
    setButtonText(detectedBtn);
    setSectionType(event.sectionType || "LANDING_EVENT");
    setDisplayOrder(event.displayOrder ?? 1);
    setFeatured(Boolean(event.featured));
    setActiveTab("create");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      loadEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  };

  return (
    <div className="event-wrapper">
      {/* TOP TABS */}
      <div className="event-topbar">
        <button
          className={`event-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("all");
          }}
        >
          All Events
        </button>

        <button
          className={`event-tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => {
            if (activeTab === "all" && !editingId) {
              resetForm();
            }
            setActiveTab("create");
          }}
        >
          {editingId ? "Edit Event" : "Create Event"}
        </button>
      </div>

      {/* ALL EVENTS TAB */}
      {activeTab === "all" && (
        <div className="event-content-card">
          <div className="event-card-header">
            <h3>Events Catalogue</h3>
            <span className="event-count-badge">
              Total Events: {events.length}
            </span>
          </div>

          <div className="event-filter-bar">
            <select
              className="event-filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Sections</option>
              <option value="LANDING_EVENT">Landing Page Events</option>
              <option value="HOME_EVENT">Home Page Events</option>
            </select>
          </div>

          <div className="event-table-container">
            <div className="event-table">
              <div className="event-table-header">
                <span>Image</span>
                <span>Title</span>
                <span>Type</span>
                <span>Button</span>
                <span>Location</span>
                <span>Venue</span>
                <span>Featured</span>
                <span>Action</span>
              </div>

              {events.length > 0 ? (
                events.map((event) => {
                  const btnLabel = resolveButtonText(event);
                  const btnBadgeClass =
                    btnLabel === "Register Now"
                      ? "badge-btn-register"
                      : btnLabel === "Visit"
                      ? "badge-btn-visit"
                      : "badge-btn-winners";

                  return (
                    <div className="event-table-row" key={event.id}>
                      <span>
                        <img
                          src={event.imageUrl || "https://placehold.co/80x50?text=No+Image"}
                          alt={event.title}
                        />
                      </span>

                      <span className="event-table-title" title={event.title}>
                        {event.title}
                      </span>

                      <span>
                        <span
                          className={`event-badge ${
                            event.sectionType === "HOME_EVENT"
                              ? "badge-home"
                              : "badge-landing"
                          }`}
                        >
                          {event.sectionType === "HOME_EVENT" ? "Home" : "Landing"}
                        </span>
                      </span>

                      <span>
                        <span className={`event-badge ${btnBadgeClass}`} title={btnLabel}>
                          {btnLabel}
                        </span>
                      </span>

                      <span>{btnLabel === "Register Now" ? (event.location || "—") : "—"}</span>

                      <span>{btnLabel === "Register Now" ? (event.venue || "—") : "—"}</span>

                      <span>
                        <span
                          className={`event-badge ${
                            event.featured ? "badge-featured-yes" : "badge-featured-no"
                          }`}
                        >
                          {event.featured ? "Yes" : "No"}
                        </span>
                      </span>

                      <span className="event-actions-cell">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(event)}
                          title="Edit Event"
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(event.id)}
                          title="Delete Event"
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="event-empty-state">
                  No events found. Click <strong>Create Event</strong> to add one.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT TAB */}
      {activeTab === "create" && (
        <div className="event-content-card">
          <div className="event-card-header">
            <h3>{editingId ? "Update Event" : "Create New Event"}</h3>
            {editingId && (
              <span className="event-count-badge">Editing ID: #{editingId}</span>
            )}
          </div>

          <div className="event-form">
            {/* ROW 1: Section Type + Featured */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  Section Placement <span className="required-star">*</span>
                </label>
                <select
                  value={sectionType}
                  onChange={(e) => setSectionType(e.target.value)}
                >
                  <option value="LANDING_EVENT">Landing Page Event</option>
                  <option value="HOME_EVENT">Home Page Event</option>
                </select>
              </div>

              <div className="form-group">
                <label>Featured Event</label>
                <select
                  value={String(featured)}
                  onChange={(e) => setFeatured(e.target.value === "true")}
                >
                  <option value="false">No (Normal)</option>
                  <option value="true">Yes (Featured)</option>
                </select>
              </div>
            </div>

            {/* ROW 2: Action Button Display (Radio Group) */}
            <div className="form-group">
              <label>
                Action Button Type <span className="required-star">*</span>
              </label>
              <div className="event-radio-group">
                {[
                  "Register Now",
                  "Winners & Prize Distribution",
                  "Visit"
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`event-btn-choice ${buttonText === opt ? "selected" : ""}`}
                    onClick={() => setButtonText(opt)}
                  >
                    <span className="choice-dot" />
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* ROW 3: Title */}
            <div className="form-group">
              <label>
                Event Title <span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            {/* ROW 4: Description */}
            <div className="form-group">
              <label>
                Description <span className="required-star">*</span>
              </label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description..."
                required
              />
            </div>

            {/* ROW 5: Image + Display Order */}
            <div className="form-row">
              <div className="form-group">
                <label>Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  min="1"
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>
            </div>

            {/* CONDITIONAL FIELDS: Only visible when "Register Now" is selected */}
            {isRegisterNow && (
              <>
                {/* Start Date + End Date */}
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Start Date <span className="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required={isRegisterNow}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      End Date <span className="required-star">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required={isRegisterNow}
                    />
                  </div>
                </div>

                {/* Location + Venue */}
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Location <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Lucknow, Uttar Pradesh"
                      required={isRegisterNow}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Venue <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. City Auditorium"
                      required={isRegisterNow}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Registration Link / Action Link */}
            <div className="form-group">
              <label>
                {isRegisterNow ? "Registration Link" : "Action Link / URL"}
              </label>
              <input
                type="text"
                value={registrationLink}
                onChange={(e) => setRegistrationLink(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {/* FORM ACTIONS */}
            <div className="form-actions">
              <button
                className="save-event-btn"
                onClick={handleSaveEvent}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Event"
                  : "Save Event"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-event-btn"
                  onClick={() => {
                    resetForm();
                    setActiveTab("all");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}