// src/pages/communityNews/EditModal.jsx
import React, { useEffect, useState } from "react";
import "./communityNews.css";

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

// API value ("2026-07-15" or "2026-07-15T10:30:00") -> datetime-local value ("2026-07-15T10:30")
const toInputDateTime = (value) => {
  if (!value) return "";
  const v = String(value);
  return v.includes("T") ? v.slice(0, 16) : `${v}T00:00`;
};

// datetime-local value ("2026-07-15T10:30") -> API value with seconds ("2026-07-15T10:30:00")
const toApiDateTime = (value) => {
  if (!value) return value;
  return value.length === 16 ? `${value}:00` : value;
};

const EditModal = ({ visible, onClose, initial, type, onSave }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [existingImages, setExistingImages] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);

  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);

  const [existingVideoUrl, setExistingVideoUrl] = useState(null);
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setBody(initial.summary || initial.description || "");

      setStartDate(
        toInputDateTime(initial.startDate || initial.startDateTime)
      );
      setEndDate(toInputDateTime(initial.endDate || initial.endDateTime));

      setExistingImages(getMediaImages(initial));

      setExistingVideoUrl(initial.videoUrl || null);

      setRemovedImageUrls([]);
      setNewImages([]);
      setNewVideo(null);
      setRemoveExistingVideo(false);
    }
  }, [initial]);

  if (!visible) return null;

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedImageUrls((prev) => [...prev, url]);
  };

  const onNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + newImages.length + files.length;

    if (total > 5) return alert("Max 5 images allowed");

    setNewImages((prev) => [...prev, ...files]);
  };

  const onNewVideoChange = (e) => {
    const f = e.target.files?.[0] || null;
    setNewVideo(f);
    if (f) setRemoveExistingVideo(true);
  };

  const newImagePreviews = newImages.map((f) => URL.createObjectURL(f));
  const newVideoPreview = newVideo ? URL.createObjectURL(newVideo) : null;

  const handleSave = async () => {
    const payload = { ...initial, title };

    if (type === "News") {
      payload.summary = body.substring(0, 150);
      payload.content = body;
    } else {
      payload.description = body;

      if (!startDate || !endDate) {
        return alert("Select event start and end dates");
      }

      if (new Date(endDate) < new Date(startDate)) {
        return alert("End date cannot be before start date");
      }

      payload.startDateTime = toApiDateTime(startDate);
      payload.endDateTime = toApiDateTime(endDate);
    }

    const mediaChanged =
      newImages.length > 0 ||
      newVideo !== null ||
      removedImageUrls.length > 0 ||
      removeExistingVideo;

    mediaChanged
      ? await onSave(payload, {
          newImages,
          newVideo,
          removedImageUrls,
          removeExistingVideo,
        })
      : await onSave(payload);
  };

  return (
    <div className="cn-modal-backdrop">
      <div className="cn-modal">
        <h3>Edit {type}</h3>

        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Body</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} />

        {type === "Event" && (
          <>
            <label>Start Date & Time</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <label>End Date & Time</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        )}

        <label>Existing Images</label>
        <div className="cn-existing-images">
          {existingImages.length === 0 && <p className="muted">No images</p>}

          {existingImages.map((url) => (
            <div key={url} className="cn-existing-thumb">
              <img src={url} className="cn-thumb" alt="" />
              <button onClick={() => removeExistingImage(url)}>Remove</button>
            </div>
          ))}
        </div>

        <label>Add New Images</label>
        <input type="file" accept="image/*" multiple onChange={onNewImagesChange} />

        <div className="cn-preview-row">
          {newImagePreviews.map((src, i) => (
            <img key={i} src={src} className="cn-thumb" alt={`Preview ${i + 1}`} />
          ))}
        </div>

        <label>Existing Video</label>
        {existingVideoUrl && !removeExistingVideo ? (
          <div>
            <video controls className="cn-video" src={existingVideoUrl} />
            <button onClick={() => { setRemoveExistingVideo(true); setExistingVideoUrl(null); }}>
              Remove Video
            </button>
          </div>
        ) : (
          <p className="muted">No video</p>
        )}

        <label>Upload New Video</label>
        <input type="file" accept="video/*" onChange={onNewVideoChange} />
        {newVideoPreview && <video controls className="cn-video" src={newVideoPreview} />}

        <div className="cn-actions">
          <button className="save" onClick={handleSave}>Save</button>
          <button className="cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
