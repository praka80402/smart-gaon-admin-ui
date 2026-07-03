import React,{useEffect,useState} from "react";
import {
getAllEvents,
deleteEvent,
updateEvent,
updateEventWithMedia,
} from "../../../services/eventsService";

import EditModal from "../EditModal";

const getCollectionItems = (data) => {
if (Array.isArray(data)) return data;
if (Array.isArray(data?.content)) return data.content;
if (Array.isArray(data?.items)) return data.items;
return [];
};

const getMediaImages = (item) => {
if (Array.isArray(item?.imageUrls) && item.imageUrls.length > 0) {
return item.imageUrls;
}

if (Array.isArray(item?.images) && item.images.length > 0) {
return item.images
.map((img) => img?.imageUrl || img?.url || img)
.filter(Boolean);
}

if (item?.pictureUrl) return [item.pictureUrl];
if (item?.thumbnailUrl) return [item.thumbnailUrl];
if (item?.imageUrl) return [item.imageUrl];

return [];
};

// Format event date (single day or range), works with
// startDate/endDate or startDateTime/endDateTime
const formatEventDate = (item) => {
const start = item?.startDate || item?.startDateTime;
const end = item?.endDate || item?.endDateTime;
if (!start) return null;

const opts = { day: "numeric", month: "long", year: "numeric" };
const s = new Date(start).toLocaleDateString("en-IN", opts);

if (!end || end === start) return s;

const e = new Date(end).toLocaleDateString("en-IN", opts);
return e === s ? s : `${s} – ${e}`;
};

export default function ViewEvents(){

const [items,setItems]=useState([]);
const [editing,setEditing]=useState(null);
const [editVisible,setEditVisible]=useState(false);
const [viewItem,setViewItem]=useState(null);
const [currentImageIndex,setCurrentImageIndex]=useState(0);

const [page,setPage]=useState(1);

const pageSize=5;

const load=async()=>{

try{

const res=await getAllEvents(0,50);

setItems(getCollectionItems(res.data));

}catch(error){

console.log(error);

}

};

useEffect(()=>{
load();
},[]);

useEffect(()=>{
setPage(1);
},[items]);

useEffect(()=>{
setCurrentImageIndex(0);
},[viewItem]);

const totalPages=Math.ceil(items.length/pageSize);

const paginatedItems=
items.slice(
(page-1)*pageSize,
page*pageSize
);

return(

<div className="cn-page">

<div className="cn-header-fixed">

<div>

<h1>
View Events
</h1>

<p>
Manage village events, competitions and announcements
</p>

</div>

<div className="cn-badge">
EVENT PANEL
</div>

</div>

<div className="cn-news-list">

{paginatedItems.map((event)=>(

<div
className="cn-news-card"
key={event.id}
>

<div className="cn-news-top">

<div className="cn-news-left">

<div className="cn-news-icon">
🎉
</div>

<div>

<h3>
{event.title}
</h3>

{formatEventDate(event)&&(

<p className="cn-event-date">
📅 {formatEventDate(event)}
</p>

)}

<p>
{(
event.description||""
).slice(0,140)}...
</p>

</div>

</div>

<div className="cn-news-actions">

<button
className="sg-btn sg-btn-ghost sg-btn-sm"
onClick={()=>{
setCurrentImageIndex(0);
setViewItem(event);
}}
>
View
</button>

<button
className="sg-btn sg-btn-ghost sg-btn-sm"
onClick={()=>{
setEditing(event);
setEditVisible(true);
}}
>
Edit
</button>

<button
className="sg-btn sg-btn-danger sg-btn-sm"
onClick={async()=>{

try{

await deleteEvent(event.id);

load();

}catch(error){

console.log(error);

}

}}
>
Delete
</button>

</div>

</div>

</div>

))}

{paginatedItems.length===0&&(

<div className="cn-empty">
No events found
</div>

)}

{totalPages>1&&(

<div className="cn-pagination">

<button
className="cn-page-btn"
disabled={page===1}
onClick={()=>
setPage(page-1)
}
>
Previous
</button>

<div className="cn-current-page">
{page}
</div>

<button
className="cn-page-btn"
disabled={
page===totalPages
}
onClick={()=>
setPage(page+1)
}
>
Next
</button>

</div>

)}

</div>

<EditModal
visible={editVisible}
onClose={()=>
setEditVisible(false)
}
initial={editing}
type="Event"
onSave={async(
payload,
media
)=>{

try{

if(
media?.newImages?.length||
media?.newVideo||
media?.removedImageUrls?.length
){

await updateEventWithMedia(
payload.id,
payload,
media.newImages,
media.newVideo,
media.removedImageUrls
);

}else{

await updateEvent(
payload.id,
payload
);

}

setEditVisible(false);

load();

}catch(error){

console.log(error);

}

}}
/>

{viewItem&&(

<div className="cn-modal-backdrop">

<div className="cn-modal">
{(()=>{
const images=getMediaImages(viewItem);

return(
<>

<button
className="cn-close"
onClick={()=>
setViewItem(null)
}
>
×
</button>

<h2>
{viewItem.title}
</h2>

{formatEventDate(viewItem)&&(

<p className="cn-event-date">
📅 {formatEventDate(viewItem)}
</p>

)}

<p>
{viewItem.description}
</p>

{images.length>0&&(

<div className="cn-slider-shell">

{images.length>1&&(
<button
className="cn-slider-arrow cn-slider-arrow-left"
onClick={()=>
setCurrentImageIndex((prev)=>
prev===0 ? images.length-1 : prev-1
)
}
>
{"<"}
</button>
)}

<div className="cn-modal-images">
<div
className="cn-modal-track"
style={{
transform:`translateX(-${currentImageIndex*100}%)`,
}}
>
{images.map((img,index)=>(
<div className="cn-slide" key={index}>
<img
src={img}
alt={`event ${index+1}`}
/>
</div>
))}
</div>
</div>

{images.length>1&&(
<button
className="cn-slider-arrow cn-slider-arrow-right"
onClick={()=>
setCurrentImageIndex((prev)=>
prev===images.length-1 ? 0 : prev+1
)
}
>
{">"}
</button>
)}

</div>

)}

{images.length>1&&(
<div className="cn-slider-meta">
<span>{currentImageIndex+1} / {images.length}</span>
</div>
)}

{viewItem.videoUrl&&(

<video
controls
style={{
width:"100%",
marginTop:"20px",
borderRadius:"20px",
}}
>

<source
src={viewItem.videoUrl}
/>

</video>

)}

</>
);
})()}
</div>

</div>

)}

</div>

);

}
