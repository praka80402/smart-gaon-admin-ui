// // src/pages/gaonconnect/GaonConnect.jsx
// import React, { useState, useEffect } from "react";
// import "./gaonconnect.css";
// import PostedItem from "./PostedItem";
// import EditModal from "./EditModal";
// import ForumFilter from "./ForumFilter";
// import VillageDirectory from "./VillageDirectory";

// import {
//   getAllNews,
//   getAllEvents,
//   createNewsWithImage,
//   createEventWithMedia,
//   deleteNews,
//   deleteEvent,
//   updateNews,
//   updateEvent,
//   updateNewsWithMedia,
//   updateEventWithMedia,
//   getAllForumPosts,
//   deleteForumPost,
// } from "./gaonConnectService";

// // ⭐ GAO TALENT — ADMIN SERVICE IMPORTS
// import {
//   adminGetEntries,
//   adminGetLikes,
//   adminGetComments,
//   adminDeclareWinner,
// } from "./gaonTalentAdminService";

// function formatDateISO() {
//   return new Date().toISOString().slice(0, 19);
// }

// const GaonConnect = () => {
//   const [activePage, setActivePage] = useState("Community Wall");

//   const [section, setSection] = useState("News");
//   const [title, setTitle] = useState("");
//   const [body, setBody] = useState("");

//   const [images, setImages] = useState([]);
//   const [video, setVideo] = useState(null);

//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // ---------------- Forum State ----------------
//   const [forumItems, setForumItems] = useState([]);
//   const [forumLoading, setForumLoading] = useState(false);

//   const [searchPhone, setSearchPhone] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [forumPage, setForumPage] = useState(0);
//   const [forumSize] = useState(10);
//   const [forumSort, setForumSort] = useState("createdAt,desc");
//   const [forumTotalPages, setForumTotalPages] = useState(1);

//   const [editVisible, setEditVisible] = useState(false);
//   const [editing, setEditing] = useState(null);

//   // ⭐ GAO TALENT STATES
//   const [talentCategory, setTalentCategory] = useState("ART");
//   const [talentLoading, setTalentLoading] = useState(false);
//   const [talentList, setTalentList] = useState([]);
//   const [selectedEntry, setSelectedEntry] = useState(null);
//   const [talentComments, setTalentComments] = useState([]);
//   const [talentLikes, setTalentLikes] = useState(0);

//   // ---------------- Load Community Wall ----------------
//   const load = async () => {
//     if (activePage !== "Community Wall") return;

//     setLoading(true);

//     try {
//       const res =
//         section === "News"
//           ? await getAllNews(0, 50)
//           : await getAllEvents(0, 50);

//       setItems(res.data || []);
//     } catch (err) {
//       console.error(err);
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, [section, activePage]);

//   // ---------------- Load Forum ----------------
//   const loadForum = async () => {
//     if (activePage !== "Forum") return;

//     setForumLoading(true);

//     try {
//       const params = {
//         page: forumPage,
//         size: forumSize,
//         sort: forumSort,
//       };

//       if (searchPhone.trim()) params.phone = searchPhone.trim();
//       if (fromDate && toDate) {
//         params.fromDate = new Date(fromDate).toISOString();
//         params.toDate = new Date(toDate).toISOString();
//       }

//       const res = await getAllForumPosts(params);
//       setForumItems(res.data?.content || []);
//       setForumTotalPages(res.data?.totalPages || 1);
//     } catch (err) {
//       console.error(err);
//       setForumItems([]);
//     } finally {
//       setForumLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadForum();
//   }, [activePage]);

//   useEffect(() => {
//     if (activePage === "Forum") loadForum();
//   }, [forumPage, forumSort]);

//   // ⭐ LOAD GAO TALENT — CATEGORY WISE
//   const loadTalent = async () => {
//     if (activePage !== "GayoTalent") return;

//     setTalentLoading(true);
//     try {
//       const res = await adminGetEntries(talentCategory);
//       setTalentList(res.data || []);
//     } catch (err) {
//       console.error(err);
//       setTalentList([]);
//     } finally {
//       setTalentLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadTalent();
//   }, [activePage, talentCategory]);

//   // ⭐ LOAD COMMENTS & LIKES FOR SELECTED ENTRY
//   const openTalentDetails = async (entry) => {
//     setSelectedEntry(entry);

//     try {
//       const likes = await adminGetLikes(entry.id);
//       const comments = await adminGetComments(entry.id);

//       setTalentLikes(likes.data);
//       setTalentComments(comments.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const markWinner = async (entryId) => {
//     if (!window.confirm("Declare this participant as winner?")) return;

//     try {
//       await adminDeclareWinner(entryId);
//       alert("Winner declared!");
//       loadTalent();
//     } catch (err) {
//       alert("Failed to declare winner");
//     }
//   };

//   // ---------------- File Upload ----------------
//   const previewImages = images.map((f) => URL.createObjectURL(f));
//   const previewVideo = video ? URL.createObjectURL(video) : null;

//   const onImagesChange = (e) => {
//     const files = Array.from(e.target.files || []);
//     if (files.length > 5) {
//       alert("Max 5 images allowed");
//       return;
//     }
//     setImages(files);
//   };

//   const onVideoChange = (e) => {
//     setVideo(e.target.files?.[0] || null);
//   };

//   // ---------------- Create ----------------
//   const handlePost = async () => {
//     if (!title.trim() || !body.trim()) {
//       alert("Enter title and body");
//       return;
//     }

//     setLoading(true);

//     try {
//       if (section === "News") {
//         const payload = {
//           category: "General",
//           title,
//           summary: body.substring(0, 150),
//           content: body,
//           author: "Admin",
//         };

//         await createNewsWithImage(payload, images, video);
//       } else {
//         if (images.length === 0) {
//           alert("Event requires at least one image");
//           setLoading(false);
//           return;
//         }

//         const payload = {
//           title,
//           description: body,
//           startDateTime: formatDateISO(),
//           endDateTime: formatDateISO(),
//           location: "Village",
//           contactInfo: "Admin",
//         };

//         await createEventWithMedia(payload, images, video);
//       }

//       setTitle("");
//       setBody("");
//       setImages([]);
//       setVideo(null);

//       await load();
//       alert("Posted!");
//     } catch (err) {
//       console.error(err);
//       alert("Post failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (item) => {
//     if (!window.confirm("Delete this item?")) return;

//     try {
//       section === "News"
//         ? await deleteNews(item.id)
//         : await deleteEvent(item.id);

//       await load();
//       alert("Deleted!");
//     } catch {
//       alert("Delete failed");
//     }
//   };

//   const handleDeleteForum = async (postId) => {
//     if (!window.confirm("Delete this forum post?")) return;

//     try {
//       await deleteForumPost(postId);
//       await loadForum();
//       alert("Forum post deleted");
//     } catch {
//       alert("Delete failed");
//     }
//   };

//   const openEdit = (item) => {
//     setEditing(item);
//     setEditVisible(true);
//   };

//   const closeEdit = () => {
//     setEditing(null);
//     setEditVisible(false);
//   };

//   const saveEdit = async (
//     payload,
//     { newImages = [], newVideo = null, removedImageUrls = [] } = {}
//   ) => {
//     try {
//       const mediaChanged =
//         newImages.length > 0 ||
//         newVideo !== null ||
//         removedImageUrls.length > 0;

//       if (section === "News") {
//         mediaChanged
//           ? await updateNewsWithMedia(
//               payload.id,
//               payload,
//               newImages,
//               newVideo,
//               removedImageUrls
//             )
//           : await updateNews(payload.id, payload);
//       } else {
//         mediaChanged
//           ? await updateEventWithMedia(
//               payload.id,
//               payload,
//               newImages,
//               newVideo,
//               removedImageUrls
//             )
//           : await updateEvent(payload.id, payload);
//       }

//       closeEdit();
//       await load();
//       alert("Updated!");
//     } catch {
//       alert("Update failed");
//     }
//   };

//   // ---------------- HEADER TEXT ----------------
//   const headerSubtitle = {
//     "Community Wall": "Manage news & events in your village.",
//     Forum: "View and manage community forum posts.",
//     "Raise Issue": "",
//     "Job Board": "",
//     Suggestions: "",
//     "Village Directory": "View and manage all users by pincode.",
//     GayoTalent: "View participants, comments & declare winners.",
//   };

//   return (
//     <div className="gc-container">
//       <div className="gc-header">
//         <h1>Gaon Connect – {activePage}</h1>
//         <p>{headerSubtitle[activePage]}</p>
//       </div>

//       {/* SUB MENU */}
//       <div className="gc-subheader">
//         {[
//           "Community Wall",
//           "Forum",
//           "GaonTalent",
//           "Raise Issue",
//           "Job Board",
//           "Village Directory",
//           "Suggestions"
//             // ⭐ NEW TAB
//         ].map((tab) => (
//           <div
//             key={tab}
//             className={`gc-sub-item ${activePage === tab ? "active" : ""}`}
//             onClick={() => setActivePage(tab)}
//           >
//             {tab}
//           </div>
//         ))}
//       </div>

//       {/* ---------------- ⭐ GAO TALENT PAGE ---------------- */}
//       {activePage === "GaonTalent" && (
//         <div className="gc-form-section">
//           <h2>Gaon Talent Participants</h2>

//           <label>Select Category</label>
//           <select
//             value={talentCategory}
//             onChange={(e) => setTalentCategory(e.target.value)}
//           >
//             <option value="ART">Art</option>
//             <option value="PUBLIC_SPEAKING">Public Speaking</option>
//             <option value="SINGING">Singing</option>
//             <option value="DANCING">Dancing</option>
//             <option value="ENTERTAINMENT">Entertainment</option>
//           </select>

//           {talentLoading ? (
//             <p>Loading...</p>
//           ) : talentList.length === 0 ? (
//             <p>No participants found</p>
//           ) : (
//             <div className="gc-cart-grid">
//               {talentList.map((entry) => (
//                 <div
//                   key={entry.id}
//                   className="talent-card"
//                   onClick={() => openTalentDetails(entry)}
//                 >
//                   <img
//                     src={entry.profileImageUrl}
//                     alt=""
//                     className="talent-thumb"
//                   />
//                   <h4>{entry.name}</h4>
//                   <p>{entry.category}</p>

//                   {entry.winner && (
//                     <span className="winner-badge">Winner</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* SELECTED ENTRY MODAL */}
//           {selectedEntry && (
//             <div className="talent-modal">
//               <div className="talent-modal-content">
//                 <button
//                   className="close-btn"
//                   onClick={() => setSelectedEntry(null)}
//                 >
//                   ✖
//                 </button>

//                 <h2>{selectedEntry.name}</h2>
//                 <p>Category: {selectedEntry.category}</p>

//                 <img
//                   src={selectedEntry.profileImageUrl}
//                   alt=""
//                   className="talent-large-img"
//                 />

//                 <br />

//                 <h3>Media</h3>
//                 {selectedEntry.mediaType === "mp4" ? (
//                   <video
//                     controls
//                     src={selectedEntry.mediaUrl}
//                     className="talent-video"
//                   />
//                 ) : (
//                   <img
//                     src={selectedEntry.mediaUrl}
//                     alt=""
//                     className="talent-large-img"
//                   />
//                 )}

//                 <h3>Likes: {talentLikes}</h3>

//                 <h3>Comments</h3>
//                 {talentComments.length === 0 ? (
//                   <p>No comments</p>
//                 ) : (
//                   talentComments.map((c, i) => (
//                     <div key={i} className="comment-item">
//                       <b>{c.username}</b>
//                       <p>{c.text}</p>
//                     </div>
//                   ))
//                 )}

//                 <button
//                   className="gc-submit"
//                   onClick={() => markWinner(selectedEntry.id)}
//                 >
//                   Declare Winner
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Existing pages */}
//       {/* COMMUNITY WALL */}
//       {activePage === "Community Wall" && (
//         <>
//           <div className="gc-form-section">
//             <h2>Post News / Events</h2>

//             <label>Headline</label>
//             <input value={title} onChange={(e) => setTitle(e.target.value)} />

//             <label>Section</label>
//             <select value={section} onChange={(e) => setSection(e.target.value)}>
//               <option value="News">News</option>
//               <option value="Event">Event</option>
//             </select>

//             <label>Body Text</label>
//             <textarea value={body} onChange={(e) => setBody(e.target.value)} />

//             <label>{section === "News" ? "Images (0–5)" : "Images (1–5)"}</label>
//             <input type="file" multiple accept="image/*" onChange={onImagesChange} />

//             <div className="gc-preview-row">
//               {previewImages.map((src, i) => (
//                 <img key={i} src={src} className="gc-thumb-small" alt="" />
//               ))}
//             </div>

//             <label>Video (optional)</label>
//             <input type="file" accept="video/*" onChange={onVideoChange} />

//             {previewVideo && (
//               <video controls src={previewVideo} className="gc-video-preview" />
//             )}

//             <button className="gc-submit" onClick={handlePost}>
//               Post
//             </button>
//           </div>

//           <div className="gc-posted-section">
//             <h3>Posted Items</h3>

//             {loading ? (
//               <p>Loading...</p>
//             ) : items.length === 0 ? (
//               <p>No items</p>
//             ) : (
//               <div className="gc-cart-grid">
//                 {items.map((it) => (
//                   <PostedItem
//                     key={it.id}
//                     item={it}
//                     type={section}
//                     onEdit={openEdit}
//                     onDelete={handleDelete}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* FORUM PAGE */}
//       {activePage === "Forum" && (
//         <div className="gc-form-section">
//           <h2>Forum Posts</h2>

//           <ForumFilter
//             searchPhone={searchPhone}
//             setSearchPhone={setSearchPhone}
//             fromDate={fromDate}
//             setFromDate={setFromDate}
//             toDate={toDate}
//             setToDate={setToDate}
//             forumSort={forumSort}
//             setForumSort={(value) => {
//               setForumSort(value);
//               setForumPage(0);
//             }}
//             onSearch={() => {
//               setForumPage(0);
//               loadForum();
//             }}
//           />

//           {forumLoading ? (
//             <p>Loading...</p>
//           ) : forumItems.length === 0 ? (
//             <p>No forum posts found</p>
//           ) : (
//             <div className="gc-cart-grid">
//               {forumItems.map((it) => (
//                 <PostedItem
//                   key={it.postId}
//                   item={it}
//                   type="Forum"
//                   onDelete={() => handleDeleteForum(it.postId)}
//                 />
//               ))}
//             </div>
//           )}

//           <div className="gc-pagination">
//             <button
//               disabled={forumPage === 0}
//               onClick={() => setForumPage(forumPage - 1)}
//             >
//               ◀ Previous
//             </button>

//             <span>
//               Page {forumPage + 1} of {forumTotalPages}
//             </span>

//             <button
//               disabled={forumPage + 1 >= forumTotalPages}
//               onClick={() => setForumPage(forumPage + 1)}
//             >
//               Next ▶
//             </button>
//           </div>
//         </div>
//       )}

//       {/* VILLAGE DIRECTORY */}
//       {activePage === "Village Directory" && (
//         <VillageDirectory />
//       )}

//       <EditModal
//         visible={editVisible}
//         onClose={closeEdit}
//         initial={editing}
//         type={section}
//         onSave={saveEdit}
//       />
//     </div>
//   );
// };

// export default GaonConnect;
// --------------------------------------------
// import React, { useState } from "react";
// import "./gaonconnect.css";

// import NewsEvents from "./components/NewsEvents";
// import Forum from "./components/Forum";
// import Directory from "./components/Directory";
// import Suggestions from "./components/Suggestions";
// import GaonTalent from "./components/gaontalent/GaonTalent";

// const GaonConnect = () => {
//   const [activePage, setActivePage] = useState("Community Wall");

//   // const headerSub = {
//   //   "Community Wall": "Manage news & events in your village.",
//   //   Forum: "View & manage forum posts.",
//   //   GaonTalent: "Manage competitions & participants.",
//   //   "Village Directory": "View & manage residents.",
//   //   Suggestions: "User suggestions panel.",
//   // };

//   const tabs = [
//     "Community Wall",
//     "Forum",
//     "GaonTalent",
//     "Village Directory",
//     "Suggestions",
//   ];

//   return (
//     <div className="gc-container">
//       {/* <div className="gc-header">
//         <h1>Gaon Connect – {activePage}</h1>
//         <p>{headerSub[activePage]}</p>
//       </div> */}

//       <div className="gc-subheader">
//         {tabs.map((tab) => (
//           <div
//             key={tab}
//             className={`gc-sub-item ${activePage === tab ? "active" : ""}`}
//             onClick={() => setActivePage(tab)}
//           >
//             {tab}
//           </div>
//         ))}
//       </div>

//       {activePage === "Community Wall" && <NewsEvents />}
//       {activePage === "Forum" && <Forum />}
//       {/* {activePage === "GaonTalent" && <GaonTalentDashboard />} */}

//       {activePage === "GaonTalent" && <GaonTalent />}
//       {activePage === "Village Directory" && <Directory />}
//       {activePage === "Suggestions" && <Suggestions />}
//     </div>
//   );
// };

// export default GaonConnect;


// -------------------------------------

import React, { useState } from "react";
import "./gaonconnect.css";

import NewsEvents from "./components/NewsEvents";
import Forum from "./components/Forum";
import Directory from "./components/Directory";
import Suggestions from "./components/Suggestions";
import GaonTalent from "./components/gaontalent/GaonTalent";

const GaonConnect = () => {
  const [activePage, setActivePage] = useState("Community Wall");

  const tabs = [
    "Community Wall",
    "Forum",
    "GaonTalent",
    "Village Directory",
    "Report Problem",
    "Suggestions",
  ];

  return (
    <div className="gc-container">
      

      <div className="gc-top-divider"></div>

      <div className="gc-subheader">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`gc-sub-item ${activePage === tab ? "active" : ""}`}
            onClick={() => setActivePage(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {activePage === "Community Wall" && <NewsEvents />}
      {activePage === "Forum" && <Forum />}
      {activePage === "GaonTalent" && <GaonTalent />}
      {activePage === "Village Directory" && <Directory />}
      {activePage === "Suggestions" && <Suggestions />}
    </div>
  );
};

export default GaonConnect;
