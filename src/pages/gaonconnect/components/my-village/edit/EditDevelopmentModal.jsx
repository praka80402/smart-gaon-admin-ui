

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
  
  <div
    style={{
      position: "relative",  
      marginTop: "20px",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      background: "#f9fafb"
    }}
  >

    {/* ADD THIS BUTTON HERE */}
    <button
      onClick={() => setEditDev(null)}
      style={{
        position: "absolute",
        top: "10px",
        right: "12px",
        background: "#0e0f0fd0",
        border: "none",
        // fontSize: "20px",
        cursor: "pointer",
        // fontWeight: "bold"
      }}
    >
      ×
    </button>

    <h4>Edit Development</h4>
    <h3 style={{ marginBottom: "20px", fontSize: "22px", fontWeight: "600" }}>
      Edit Development
    </h3>

    <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column" }}>
      <label style={{ marginBottom: "5px", fontWeight: "500" }}>Progress %</label>
      <input
        type="number"
        min="0"
        max="100"
        value={editProgress}
        onChange={(e) => setEditProgress(e.target.value)}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px"
        }}
      />
    </div>

    <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column" }}>
      <label style={{ marginBottom: "5px", fontWeight: "500" }}>Remarks</label>
      <input
        value={editRemarks}
        onChange={(e) => setEditRemarks(e.target.value)}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px"
        }}
      />
    </div>

    <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column" }}>
      <label style={{ marginBottom: "5px", fontWeight: "500" }}>YouTube Video</label>
      <input
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px"
        }}
      />
    </div>

    <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Existing Images</h4>

<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
  {existingImages.map((img, i) => (
    <div
      key={i}
      style={{
        position: "relative",
        width: "90px",
        height: "70px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #ddd"
      }}
    >
      <img
        src={img}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />

      <button
        onClick={() =>
          setExistingImages(existingImages.filter((_, x) => x !== i))
        }
        style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          background: "#311717",
          color: "#e9e1e1",
          border: "none",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        ×
      </button>
    </div>
  ))}
</div>

    <input
      type="file"
      multiple
      onChange={(e) => setNewImages(Array.from(e.target.files))}
      style={{ marginTop: "10px" }}
    />

    <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>Existing Reports</h4>

    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {existingReports.map((rep, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 8px",
            border: "1px solid #ddd",
            borderRadius: "6px"
          }}
        >
          <a href={rep} target="_blank" rel="noreferrer">
            Report {i + 1}
          </a>

          <button
            onClick={() =>
              setExistingReports(existingReports.filter((_, x) => x !== i))
            }
            style={{
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "2px 6px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>

    <input
      type="file"
      multiple
      accept="application/pdf"
      onChange={(e) => setNewReports(Array.from(e.target.files))}
      style={{ marginTop: "10px" }}
    />

    <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
      <button
        onClick={handleUpdate}
        style={{
          background: "#2563eb",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Update Development
      </button>

      <button
        onClick={() => setEditDev(null)}
        style={{
          background: "#eb2424",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </div>
  </div>
);

}