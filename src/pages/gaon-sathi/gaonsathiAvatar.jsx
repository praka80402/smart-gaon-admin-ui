import  { useEffect, useState } from "react";
import { api } from "../gaonconnect/services/apiConfig";
import "./gaonsathi.css";

function GaonSathiGallery() {

  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const res = await api.get("/admin/gaon-sathi/images");
    setImages(res.data);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadImage = async () => {

    if (!file) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    await api.post("/admin/gaon-sathi/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setFile(null);
    fetchImages();
  };

  return (
    <div className="gallery-container">

      <h2 className="page-title">Gaon Sathi Avatar Selection</h2>

      <div className="upload-box">
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadImage}>Upload</button>
      </div>

      <h3 className="list-title">Image List</h3>

      <div className="image-grid">
        {images.map((img) => (
          <div key={img.id} className="image-card">
            <img src={img.imageUrl} alt="avatar" />
            <p>ID: {img.id}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default GaonSathiGallery;