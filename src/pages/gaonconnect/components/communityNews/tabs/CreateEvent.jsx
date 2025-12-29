// // src/pages/communityNews/tabs/CreateEvent.jsx
// import React, { useState } from "react";
// import { createEventWithMedia } from "../../../services/eventsService";

// export default function CreateEvent() {
//   const [title, setTitle] = useState("");
//   const [body, setBody] = useState("");
//   const [images, setImages] = useState([]);
//   const [video, setVideo] = useState(null);

//   const formatDate = () => new Date().toISOString().slice(0, 19);

//   const handlePost = async () => {
//     if (!title.trim() || !body.trim()) return alert("Required fields missing");
//     if (images.length === 0) return alert("Event requires at least 1 image");

//     await createEventWithMedia(
//       {
//         title,
//         description: body,
//         startDateTime: formatDate(),
//         endDateTime: formatDate(),
//         location: "Village",
//         contactInfo: "Admin",
//       },
//       images,
//       video
//     );

//     setTitle("");
//     setBody("");
//     setImages([]);
//     setVideo(null);

//     alert("Event Posted!");
//   };

//   return (
//     <div className="cn-form">
//       <h2>Create Event</h2>

//       <label>Title</label>
//       <input value={title} onChange={(e) => setTitle(e.target.value)} />

//       <label>Description</label>
//       <textarea value={body} onChange={(e) => setBody(e.target.value)} />

//       <label>Images (1–5)</label>
//       <input type="file" multiple accept="image/*" onChange={(e) => setImages([...e.target.files])} />

//       <label>Video</label>
//       <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0])} />

//       <button className="submit" onClick={handlePost}>Submit</button>
//     </div>
//   );
// }
