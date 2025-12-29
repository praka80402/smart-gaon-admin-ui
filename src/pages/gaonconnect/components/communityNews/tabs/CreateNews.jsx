// // src/pages/communityNews/tabs/CreateNews.jsx
// import React, { useState } from "react";
// import { createNewsWithImage } from "../../../services/newsService";

// export default function CreateNews() {
//   const [title, setTitle] = useState("");
//   const [body, setBody] = useState("");
//   const [images, setImages] = useState([]);
//   const [video, setVideo] = useState(null);

//   const handlePost = async () => {
//     if (!title.trim() || !body.trim()) return alert("Required fields missing");

//     await createNewsWithImage(
//       {
//         category: "General",
//         title,
//         summary: body.slice(0, 150),
//         content: body,
//         author: "Admin",
//       },
//       images,
//       video
//     );

//     setTitle("");
//     setBody("");
//     setImages([]);
//     setVideo(null);

//     alert("News Posted!");
//   };

//   return (
//     <div className="cn-form">
//       <h2>Create News</h2>

//       <label>Headline</label>
//       <input value={title} onChange={(e) => setTitle(e.target.value)} />

//       <label>Body</label>
//       <textarea value={body} onChange={(e) => setBody(e.target.value)} />

//       <label>Images (0–5)</label>
//       <input type="file" multiple accept="image/*" onChange={(e) => setImages([...e.target.files])} />

//       <label>Video</label>
//       <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0])} />

//       <button className="submit" onClick={handlePost}>Submit</button>
//     </div>
//   );
// }

// src/pages/communityNews/tabs/CreatePost.jsx
import React, { useState } from "react";
import { createNewsWithImage } from "../../../services/newsService";
import { createEventWithMedia } from "../../../services/eventsService";

export default function CreatePost() {
  const [type, setType] = useState("news"); // "news" or "event"

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setImages([]);
    setVideo(null);
  };

  const formatDate = () => new Date().toISOString().slice(0, 19);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Required fields missing");
      return;
    }

    // Event image validation
    if (type === "event" && images.length === 0) {
      alert("Event requires at least 1 image");
      return;
    }

    if (type === "news") {
      // ------- CREATE NEWS -------
      await createNewsWithImage(
        {
          category: "General",
          title,
          summary: body.slice(0, 150),
          content: body,
          author: "Admin",
        },
        images,
        video
      );

      alert("News Posted!");
    } else {
      // ------- CREATE EVENT -------
      await createEventWithMedia(
        {
          title,
          description: body,
          startDateTime: formatDate(),
          endDateTime: formatDate(),
          location: "Village",
          contactInfo: "Admin",
        },
        images,
        video
      );

      alert("Event Posted!");
    }

    resetForm();
  };

  return (
    <div className="cn-form">
      <h2>Create News / Event</h2>

      {/* TYPE DROPDOWN */}
      <label>Select Type</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="news">News</option>
        <option value="event">Event</option>
      </select>

      {/* TITLE */}
      <label>{type === "news" ? "Headline" : "Event Title"}</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      {/* BODY */}
      <label>{type === "news" ? "Body" : "Event Description"}</label>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} />

      {/* IMAGES */}
      <label>{type === "news" ? "Images (0–5)" : "Images (1–5)"}</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => setImages([...e.target.files])}
      />

      {/* VIDEO */}
      <label>Video (optional)</label>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideo(e.target.files?.[0])}
      />

      {/* SUBMIT */}
      <button className="submit" onClick={handleSubmit}>
        {type === "news" ? "Submit News" : "Submit Event"}
      </button>
    </div>
  );
}
