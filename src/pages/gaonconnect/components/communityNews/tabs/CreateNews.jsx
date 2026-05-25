import React,{useState} from "react";
import {createNewsWithImage} from "../../../services/newsService";
import {createEventWithMedia} from "../../../services/eventsService";

export default function CreatePost(){

const role=localStorage.getItem("adminRole");

const canCreate=
role==="SUPER_ADMIN"||role==="STATE_ADMIN";

const [type,setType]=useState("news");
const [title,setTitle]=useState("");
const [body,setBody]=useState("");
const [images,setImages]=useState([]);
const [video,setVideo]=useState(null);

const resetForm=()=>{
setTitle("");
setBody("");
setImages([]);
setVideo(null);
};

const formatDate=()=>
new Date().toISOString().slice(0,19);

const handleSubmit=async()=>{

if(!canCreate){
alert("You are not authorized to create posts.");
return;
}

if(!title.trim()||!body.trim()){
alert("Required fields missing");
return;
}

if(type==="event"&&images.length===0){
alert("Event requires at least 1 image");
return;
}

try{

if(type==="news"){

await createNewsWithImage(
{
category:"General",
title,
summary:body.slice(0,150),
content:body,
author:"Admin",
},
images,
video
);

alert("News Posted!");

}else{

await createEventWithMedia(
{
title,
description:body,
startDateTime:formatDate(),
endDateTime:formatDate(),
location:"Village",
contactInfo:"Admin",
},
images,
video
);

alert("Event Posted!");
}

resetForm();

}catch(error){
console.error(error);
alert("Failed to create post");
}
};

if(!canCreate){
return(
<div style={{padding:"40px",textAlign:"center"}}>
<h2>Access Denied</h2>
<p>You are not authorized to create News or Events.</p>
</div>
);
}

return(
<div className="cn-modern-page">

<div className="cn-modern-wrapper">

<div className="cn-modern-header">

<div>
<h1 className="cn-title">
Create News / Event
</h1>

<p className="cn-subtitle">
Manage community announcements, updates and local events
</p>
</div>

<div className="cn-badge">
ADMIN PANEL
</div>

</div>

<div className="cn-form-card">

<div className="cn-field-grid">

<div className="cn-field">

<label>Select Type</label>

<select
value={type}
onChange={(e)=>setType(e.target.value)}
>
<option value="news">News</option>
<option value="event">Event</option>
</select>

</div>

<div className="cn-field">

<label>
{type==="news"
?"Headline"
:"Event Title"}
</label>

<input
value={title}
placeholder={
type==="news"
?"Enter news headline"
:"Enter event title"
}
onChange={(e)=>setTitle(e.target.value)}
/>

</div>

</div>

<div className="cn-field">

<label>
{type==="news"
?"Body"
:"Event Description"}
</label>

<textarea
value={body}
placeholder={
type==="news"
?"Write full news content..."
:"Write event details..."
}
onChange={(e)=>setBody(e.target.value)}
/>

</div>

<div className="cn-upload-grid">

<div className="cn-upload-card">

<div className="cn-upload-icon">
🖼️
</div>

<div className="cn-upload-content">

<h4>
{type==="news"
?"Images (0–5)"
:"Images (1–5)"}
</h4>

<p>
Upload high quality images
</p>

<input
type="file"
multiple
accept="image/*"
onChange={(e)=>
setImages([...e.target.files])
}
/>

</div>

</div>

<div className="cn-upload-card">

<div className="cn-upload-icon">
🎥
</div>

<div className="cn-upload-content">

<h4>
Video (optional)
</h4>

<p>
Upload short event/news video
</p>

<input
type="file"
accept="video/*"
onChange={(e)=>
setVideo(e.target.files?.[0])
}
/>

</div>

</div>

</div>

<button
className="cn-submit-btn"
onClick={handleSubmit}
>
{type==="news"
?"Publish News"
:"Publish Event"}
</button>

</div>

</div>

</div>
);
}