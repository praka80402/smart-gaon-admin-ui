
import React,{useState} from "react";
import {createEventWithMedia} from "../../../services/eventsService";

export default function CreateEvent(){

const role=localStorage.getItem("adminRole");

const canCreate=
role==="SUPER_ADMIN"||
role==="STATE_ADMIN";

const [title,setTitle]=useState("");
const [body,setBody]=useState("");

const [startDate,setStartDate]=useState("");
const [endDate,setEndDate]=useState("");

const [images,setImages]=useState([]);
const [video,setVideo]=useState(null);

const [loading,setLoading]=useState(false);

const resetForm=()=>{

setTitle("");
setBody("");

setStartDate("");
setEndDate("");

setImages([]);
setVideo(null);

};

const handleSubmit=async()=>{

if(!canCreate){
alert("You are not authorized.");
return;
}

if(
!title.trim()||
!body.trim()
){
alert("Required fields missing");
return;
}

if(!startDate||!endDate){
alert("Select event dates");
return;
}

if(images.length===0){
alert("Event requires at least 1 image");
return;
}

try{

setLoading(true);

await createEventWithMedia(
{
title:title.trim(),
description:body.trim(),

startDateTime:startDate,
endDateTime:endDate,

location:"Village",
contactInfo:"Admin",
},
images,
video
);

alert("Event Posted!");

resetForm();

}catch(error){

console.log("EVENT ERROR:",error);

if(error?.response){

console.log(
"SERVER RESPONSE:",
error.response.data
);

console.log(
"STATUS:",
error.response.status
);

}

alert("Failed to create event");

}finally{

setLoading(false);

}

};

if(!canCreate){

return(

<div className="cn-access-denied">

<div className="cn-access-card">

<h2>
Access Denied
</h2>

<p>
You are not authorized to create events.
</p>

</div>

</div>

);

}

return(

<div className="cn-modern-page">

<div className="cn-modern-wrapper">

<div className="cn-modern-header">

<div>

<h1 className="cn-title">
Create Event
</h1>

<p className="cn-subtitle">
Manage village events and announcements
</p>

</div>

<div className="cn-badge">
EVENT PANEL
</div>

</div>

<div className="cn-form-card">

<div className="cn-field">

<label>
Event Title
</label>

<input
type="text"
value={title}
placeholder="Enter event title"
onChange={(e)=>
setTitle(e.target.value)
}
/>

</div>

<div className="cn-field">

<label>
Event Description
</label>

<textarea
value={body}
placeholder="Write full event details..."
onChange={(e)=>
setBody(e.target.value)
}
/>

</div>

<div className="cn-top-grid">

<div className="cn-field">

<label>
Start Date & Time
</label>

<input
type="datetime-local"
value={startDate}
onChange={(e)=>
setStartDate(e.target.value)
}
/>

</div>

<div className="cn-field">

<label>
End Date & Time
</label>

<input
type="datetime-local"
value={endDate}
onChange={(e)=>
setEndDate(e.target.value)
}
/>

</div>

</div>

<div className="cn-upload-grid">

<div className="cn-upload-card">

<div className="cn-upload-icon">
🖼️
</div>

<div className="cn-upload-info">

<h4>
Images (1–5)
</h4>

<p>
Upload event images
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

<div className="cn-upload-info">

<h4>
Video (optional)
</h4>

<p>
Upload short event video
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
disabled={loading}
>

{loading
?"Publishing..."
:"Publish Event"}

</button>

</div>

</div>

</div>

);

}
