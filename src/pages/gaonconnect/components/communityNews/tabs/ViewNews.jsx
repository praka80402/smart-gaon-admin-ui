import React,{useEffect,useState} from "react";
import {
getAllNews,
deleteNews,
updateNews,
updateNewsWithMedia,
} from "../../../services/newsService";
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

export default function ViewNews(){
const [items,setItems]=useState([]);
const [editing,setEditing]=useState(null);
const [editVisible,setEditVisible]=useState(false);
const [viewItem,setViewItem]=useState(null);
const [currentImageIndex,setCurrentImageIndex]=useState(0);
const [page,setPage]=useState(1);
const pageSize=5;

const load=async()=>{
const res=await getAllNews(0,50);
setItems(getCollectionItems(res.data));
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
const paginatedItems=items.slice((page-1)*pageSize,page*pageSize);

return(
<div className="cn-page">

<div className="cn-header-fixed">
<div>
<h1>View News</h1>
<p>Manage published community news and announcements</p>
</div>

<div className="cn-badge">
NEWS PANEL
</div>
</div>

<div className="cn-news-list">

{paginatedItems.map((it)=>(
<div className="cn-news-card" key={it.id}>

<div className="cn-news-top">

<div className="cn-news-left">
<div className="cn-news-icon">📰</div>

<div>
<h3>{it.title}</h3>
<p>
{(it.summary||it.description||"").slice(0,140)}...
</p>
</div>
</div>

<div className="cn-news-actions">
<button
className="cn-view-btn"
onClick={()=>{
setCurrentImageIndex(0);
setViewItem(it);
}}
>
View
</button>

<button
className="cn-edit-btn"
onClick={()=>{
setEditing(it);
setEditVisible(true);
}}
>
Edit
</button>

<button
className="cn-delete-btn"
onClick={async()=>{
await deleteNews(it.id);
load();
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
No news found
</div>
)}

{totalPages>1&&(
<div className="cn-pagination">
<button
className="cn-page-btn"
disabled={page===1}
onClick={()=>setPage(page-1)}
>
Previous
</button>

<div className="cn-current-page">
{page}
</div>

<button
className="cn-page-btn"
disabled={page===totalPages}
onClick={()=>setPage(page+1)}
>
Next
</button>
</div>
)}

</div>

<EditModal
visible={editVisible}
onClose={()=>setEditVisible(false)}
initial={editing}
type="News"
onSave={async(payload,media)=>{
if(
media?.newImages?.length||
media?.newVideo||
media?.removedImageUrls?.length
){
await updateNewsWithMedia(
payload.id,
payload,
media.newImages,
media.newVideo,
media.removedImageUrls
);
}else{
await updateNews(payload.id,payload);
}

setEditVisible(false);
load();
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
onClick={()=>setViewItem(null)}
>
×
</button>

<h2>{viewItem.title}</h2>

<p>
{viewItem.content||viewItem.description}
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
          <img src={img} alt={`news ${index+1}`} />
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

</>
);
})()}
</div>
</div>
)}

</div>
);
}
