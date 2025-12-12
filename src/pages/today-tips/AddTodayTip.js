import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function AddTodayTip({ onSuccess, initialData = null, docId = null }) {
  const [title, setTitle] = useState("");
  const [occupation, setOccupation] = useState(""); // UPDATED: category → occupation
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 300 * 1024; // 300 KB

  const formatDateDDMMYYYY = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  const parseDateToISO = (ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    const [d, m, y] = ddmmyyyy.split("-");
    return `${y}-${m}-${d}`;
  };

  const toBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setOccupation(initialData.category || ""); // UPDATED
      setDescription(initialData.description || "");
      setDate(initialData.date ? parseDateToISO(initialData.date) : "");
      setImageBase64(initialData.imageBase64 || "");
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!title || !occupation || !date) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    let finalImage = imageBase64;
    if (imageFile) finalImage = await toBase64(imageFile);

    const payload = {
      title,
      category: occupation, // UPDATED
      description,
      imageBase64: finalImage,
      date: formatDateDDMMYYYY(date),
    };

    if (docId) {
      await updateDoc(doc(db, "today_tips", docId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "today_tips"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="addtip-wrapper">
      <h2 className="addtip-title">{docId ? "Edit Today Tip" : "Add Today Tip"}</h2>

      {/* Date */}
      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="date"
          className="form-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Title */}
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter tip title"
        />
      </div>

      {/* Occupation Dropdown */}
      <div className="form-group">
        <label className="form-label">Occupation</label>
        <select
          className="form-input"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        >
          <option value="">Select Occupation</option>
          <option value="Citizen">Citizen</option>
          <option value="Farmer">Farmer</option>
          <option value="Vendor">Vendor</option>
          <option value="Teacher">Teacher</option>
          <option value="Electrician">Electrician</option>
        </select>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a short description…"
        ></textarea>
      </div>

      {/* Old Image Preview */}
      {imageBase64 && !imageFile && (
        <div className="image-preview-block">
          <label className="form-label">Current Image</label>
          <img src={imageBase64} alt="preview" className="image-preview" />
        </div>
      )}

      {/* Upload Image */}
      <div className="form-group">
        <label className="form-label">Upload Image</label>

        <label className="upload-box">
          <input
            type="file"
            accept="image/*"
            className="hidden-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (file.size > MAX_FILE_SIZE) {
                alert("Image too large! Max allowed size is 300 KB.");
                e.target.value = "";
                return;
              }

              setImageFile(file);

              const reader = new FileReader();
              reader.onload = () => setImageBase64(reader.result);
              reader.readAsDataURL(file);
            }}
          />
          📁 Click to upload (Max 300 KB)
        </label>

        {imageBase64 && imageFile && (
          <img src={imageBase64} className="image-preview" alt="preview" />
        )}
      </div>

      {/* Save Button */}
      <button className="save-btn" disabled={loading} onClick={handleSave}>
        {loading ? "Saving..." : docId ? "Update Tip" : "Save Tip"}
      </button>

      {/* INLINE CSS */}
      <style>{`
        .addtip-wrapper {
          width: 100%;
          max-width: 520px;
          padding: 25px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        }

        .addtip-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #222;
        }

        .form-group {
          margin-bottom: -5px;
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #444;
        }

        .form-input {
          padding: 10px 10px;
          border-radius: 12px;
          border: 1.5px solid #ccc;
          background: #fafafa;
          font-size: 15px;
          width: 100%;
        }

        .textarea {
          height: 110px;
          resize: vertical;
          width: 100%;
        }

        .upload-box {
          width: 100%;
          padding: 10px 10px;
          border: 2px dashed #9ccc9c;
          background: #f1fff3;
          color: #2f7b3f;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }

        .upload-box:hover {
          background: #dfffe4;
          border-color: #40a751;
        }

        .hidden-input {
          display: none;
        }

        .image-preview {
          margin-top: 10px;
          width: 160px;
          height: 110px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
        }

        .save-btn {
          background: #40a751;
          color: white;
          padding: 14px;
          width: 105%;
          border: none;
          border-radius: 12px;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 15px;
          transition: 0.2s;
        }

        .save-btn:hover {
          background: #2f8b3f;
        }
      `}</style>
    </div>
  );
}
