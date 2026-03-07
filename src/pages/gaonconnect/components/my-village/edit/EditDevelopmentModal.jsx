// import { updateVillageDevelopment } from "../service/villageDevelopmentService";

// export default function EditDevelopmentModal({
//   editDev,
//   setEditDev,
//   editProgress,
//   setEditProgress,
//   editRemarks,
//   setEditRemarks,
//   existingImages,
//   setExistingImages,
//   newImages,
//   setNewImages,
//   videoUrl,
//   setVideoUrl,
//   existingReports,
//   setExistingReports,
//   newReports,
//   setNewReports,
//   refreshDevelopment
// }) {

//   if (!editDev) return null;

//   const handleUpdate = async () => {

//     const formData = new FormData();

//     formData.append("progress", Number(editProgress));
//     formData.append("remarks", editRemarks || "");
//     formData.append("videoUrl", videoUrl || "");

//     existingImages.forEach(img => {
//       formData.append("existingImages", img);
//     });

//     existingReports.forEach(rep => {
//       formData.append("existingReports", rep);
//     });

//     newImages.forEach(img => {
//       formData.append("images", img);
//     });

//     newReports.forEach(pdf => {
//       formData.append("reports", pdf);
//     });

//     await updateVillageDevelopment(editDev.id, formData);

//     await refreshDevelopment();

//     setEditDev(null);
//     setExistingImages([]);
//     setExistingReports([]);
//     setNewImages([]);
//     setNewReports([]);
//     setVideoUrl("");
//   };

//   return (
//     <div style={{
//       marginTop: "20px",
//       padding: "20px",
//       border: "1px solid #ddd",
//       borderRadius: "10px",
//       background: "#f9fafb"
//     }}>

//       <h4>Edit Development</h4>

//       <label>Progress %</label>
//       <input
//         type="number"
//         min="0"
//         max="100"
//         value={editProgress}
//         onChange={(e)=>setEditProgress(e.target.value)}
//       />

//       <label>Remarks</label>
//       <input
//         value={editRemarks}
//         onChange={(e)=>setEditRemarks(e.target.value)}
//       />

//       <label>YouTube Video</label>
//       <input
//         value={videoUrl}
//         onChange={(e)=>setVideoUrl(e.target.value)}
//       />

//       <h5>Existing Images</h5>
//       {existingImages.map((img,i)=>(
//         <div key={i}>
//           <img src={img} width="80" alt="" />
//           <button onClick={()=>
//             setExistingImages(existingImages.filter((_,x)=>x!==i))
//           }>✕</button>
//         </div>
//       ))}

//       <input
//         type="file"
//         multiple
//         onChange={(e)=>setNewImages(Array.from(e.target.files))}
//       />

//       <h5>Existing Reports</h5>
//       {existingReports.map((rep,i)=>(
//         <div key={i}>
//           <a href={rep} target="_blank" rel="noreferrer">
//             Report {i+1}
//           </a>
//           <button onClick={()=>
//             setExistingReports(existingReports.filter((_,x)=>x!==i))
//           }>✕</button>
//         </div>
//       ))}

//       <input
//         type="file"
//         multiple
//         accept="application/pdf"
//         onChange={(e)=>setNewReports(Array.from(e.target.files))}
//       />

//       <br/><br/>

//       <button onClick={handleUpdate}>
//         Update Development
//       </button>

//       <button onClick={()=>setEditDev(null)}>
//         Cancel
//       </button>

//     </div>
//   );
// }

import { updateVillageDevelopment } from "../service/villageDevelopmentService";

export default function EditDevelopmentModal({
  selectedVillage,
  editDev,
  setEditDev,
  editProgress,
  setEditProgress,
  editRemarks,
  setEditRemarks,
  existingImages,
  setExistingImages,
  newImages,
  setNewImages,
  videoUrl,
  setVideoUrl,
  existingReports,
  setExistingReports,
  newReports,
  setNewReports,
  refreshDevelopment
}) {

  if (!editDev) return null;

  const handleUpdate = async () => {

    try {

      const formData = new FormData();

      formData.append("progress", Number(editProgress));
      formData.append("remarks", editRemarks || "");
      formData.append("videoUrl", videoUrl || "");

      existingImages.forEach(img => {
        formData.append("existingImages", img);
      });

      existingReports.forEach(rep => {
        formData.append("existingReports", rep);
      });

      newImages.forEach(img => {
        formData.append("images", img);
      });

      newReports.forEach(pdf => {
        formData.append("reports", pdf);
      });

      await updateVillageDevelopment(
        selectedVillage.id,
        editDev.development.id,
        formData
      );

      await refreshDevelopment();

      setEditDev(null);
      setExistingImages([]);
      setExistingReports([]);
      setNewImages([]);
      setNewReports([]);
      setVideoUrl("");

    } catch (err) {

      console.error(err);
      alert("Update failed");

    }

  };

  return (
    <div style={{
      marginTop: "20px",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      background: "#f9fafb"
    }}>

      <h4>Edit Development</h4>

      <label>Progress %</label>
      <input
        type="number"
        min="0"
        max="100"
        value={editProgress}
        onChange={(e)=>setEditProgress(e.target.value)}
      />

      <label>Remarks</label>
      <input
        value={editRemarks}
        onChange={(e)=>setEditRemarks(e.target.value)}
      />

      <label>YouTube Video</label>
      <input
        value={videoUrl}
        onChange={(e)=>setVideoUrl(e.target.value)}
      />

      <h5>Existing Images</h5>

      {existingImages.map((img,i)=>(
        <div key={i}>
          <img src={img} width="80" alt="" />
          <button onClick={()=>
            setExistingImages(existingImages.filter((_,x)=>x!==i))
          }>
            ✕
          </button>
        </div>
      ))}

      <input
        type="file"
        multiple
        onChange={(e)=>setNewImages(Array.from(e.target.files))}
      />

      <h5>Existing Reports</h5>

      {existingReports.map((rep,i)=>(
        <div key={i}>
          <a href={rep} target="_blank" rel="noreferrer">
            Report {i+1}
          </a>

          <button onClick={()=>
            setExistingReports(existingReports.filter((_,x)=>x!==i))
          }>
            ✕
          </button>
        </div>
      ))}

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={(e)=>setNewReports(Array.from(e.target.files))}
      />

      <br/><br/>

      <button onClick={handleUpdate}>
        Update Development
      </button>

      <button onClick={()=>setEditDev(null)}>
        Cancel
      </button>

    </div>
  );

}