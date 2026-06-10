import { useEffect, useState } from "react";
import "./eventManagement.css";

import {
  getEvents,
  getEventsBySection,
  deleteEvent,
  createEvent,
  updateEvent
} from "./event.service";

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
  const [sectionType, setSectionType] = useState("LANDING_EVENT");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [featured, setFeatured] = useState(false);

  const loadEvents = async () => {

  let data = [];

  if (filter) {
    data = await getEventsBySection(filter);
  } else {
    data = await getEvents();
  }

  setEvents(data);
};

useEffect(() => {
  loadEvents();
}, [filter]);
const [editingId, setEditingId] = useState(null);

const handleSaveEvent = async () => {
  if (
  !title ||
  !description ||
  !startDate ||
  !endDate ||
  !location ||
  !venue
) {
  alert("Please fill all required fields");
  return;
}

  try {

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("location", location);
    formData.append("venue", venue);
    formData.append("registrationLink", registrationLink);
    formData.append("sectionType", sectionType);
    formData.append("displayOrder", displayOrder);
    formData.append("featured", featured);

    if (image) {
      formData.append("image", image);
    }

   if (editingId) {

  await updateEvent(
    editingId,
    formData
  );

  alert(
    "Event Updated Successfully"
  );

} else {

  await createEvent(formData);

  alert(
    "Event Created Successfully"
  );

}

setEditingId(null);

setTitle("");
setDescription("");
setImage(null);

setStartDate("");
setEndDate("");

setLocation("");
setVenue("");

setRegistrationLink("");

setSectionType(
  "LANDING_EVENT"
);

setDisplayOrder(1);

setFeatured(false);

loadEvents();

setActiveTab("all");

  } catch (error) {

    console.error(error);

    alert("Failed To Create Event");
  }
};

  return (
    <div className="event-wrapper">

      <div className="event-topbar">

        <button
          className={`event-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>

        <button
          className={`event-tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Create
        </button>

      </div>

      {/* ALL EVENTS */}

      {activeTab === "all" && (
        <div className="event-content-card">

          <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  }}
>
  <h3>All Events</h3>

  <h4>
    Total Events : {events.length}
  </h4>
</div>

          <div style={{ marginBottom: "20px" }}>
  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    style={{
      padding: "10px 15px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      minWidth: "220px"
    }}
  >
    <option value="">All Events</option>
    <option value="LANDING_EVENT">Landing Event</option>
    <option value="HOME_EVENT">Home Event</option>
  </select>
</div>

          <div className="event-table">

 <div className="event-table-header">
  <span>Image</span>
  <span>Title</span>
  <span>Type</span>
  <span>Location</span>
  <span>Venue</span>
  <span>Featured</span>
  <span>Action</span>
</div>

            {events.length > 0 ? (
  events.map((event) => (
    <div
      className="event-table-row"
      key={event.id}
    >
      <span>
        <img
          src={event.imageUrl}
          alt={event.title}
          width="80"
          height="50"
          style={{
            objectFit: "cover",
            borderRadius: "6px"
          }}
        />
      </span>

     <span>{event.title}</span>

<span>{event.sectionType}</span>

<span>{event.location}</span>

<span>{event.venue}</span>

<span>
  {event.featured ? "Yes" : "No"}
</span>

      <span
        style={{
          display: "flex",
          gap: "10px"
        }}
      >
        <button
  className="edit-btn"
  onClick={() => {

    setEditingId(event.id);

    setTitle(event.title || "");
    setDescription(event.description || "");
    setStartDate(event.startDate || "");
    setEndDate(event.endDate || "");
    setLocation(event.location || "");
    setVenue(event.venue || "");

    setRegistrationLink(
      event.registrationLink || ""
    );

    setSectionType(
      event.sectionType || "LANDING_EVENT"
    );

    setDisplayOrder(
      event.displayOrder || 1
    );

    setFeatured(
      event.featured || false
    );

    setActiveTab("create");

  }}
>
  Edit
</button>

       <button
  className="delete-btn"
  onClick={async () => {
            if (
              window.confirm(
                "Delete this event?"
              )
            ) {
              await deleteEvent(event.id);
              loadEvents();
            }
          }}
        >
          Delete
        </button>
      </span>
    </div>
  ))
) : (
  <div
    style={{
      padding: "30px",
      textAlign: "center"
    }}
  >
    No Events Found
  </div>
)}

          </div>

        </div>
      )}

      {/* CREATE EVENT */}

      {activeTab === "create" && (
        <div className="event-content-card">

          <h3>
  {editingId
    ? "Update Event"
    : "Create Event"}
</h3>

          <div className="event-form">

          <div className="form-group">
  <label>Event Type</label>

  <select
    value={sectionType}
    onChange={(e) => setSectionType(e.target.value)}
  >
    <option value="LANDING_EVENT">
      Landing Page Event
    </option>

    <option value="HOME_EVENT">
      Home Page Event
    </option>
  </select>
</div>

            <div className="form-group">
  <label>Event Title</label>

  <input
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Enter event title"
  />
</div>

 <div className="form-group">
  <label>Description</label>

  <textarea
    rows="5"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Enter description"
  />
</div>

            <div className="form-group">
  <label>Event Image</label>

  <input
    type="file"
    onChange={(e) => setImage(e.target.files[0])}
  />
</div>

    <div className="form-group">
  <label>Start Date</label>

  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
  />
</div>

           <div className="form-group">
  <label>End Date</label>

  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
  />
</div>

           <div className="form-group">
  <label>Location</label>

  <input
    type="text"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    placeholder="Enter location"
  />
</div>

<div className="form-group">
  <label>Venue</label>

  <input
    type="text"
    value={venue}
    onChange={(e) => setVenue(e.target.value)}
    placeholder="Enter venue"
  />
</div>

<div className="form-group">
  <label>Registration Link</label>

  <input
    type="text"
    value={registrationLink}
    onChange={(e) => setRegistrationLink(e.target.value)}
    placeholder="https://example.com"
  />
</div>

<div className="form-group">
  <label>Display Order</label>

  <input
    type="number"
    value={displayOrder}
    onChange={(e) =>
  setDisplayOrder(Number(e.target.value))
}
  />
</div>

<div className="form-group">
  <label>Featured</label>

  <select
    value={String(featured)}
    onChange={(e) =>
      setFeatured(e.target.value === "true")
    }
  >
   <option value="false">No</option>
    <option value="true">Yes</option>
  </select>
</div>
<button
  className="save-event-btn"
  onClick={handleSaveEvent}
>
  {editingId
    ? "Update Event"
    : "Save Event"}
</button>

          </div>

        </div>
      )}

    </div>
  );
}