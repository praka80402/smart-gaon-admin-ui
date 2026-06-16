import { useEffect, useState } from "react";
import { api } from "../gaonconnect/services/apiConfig";
import "./gaonsathi.css";

function GaonSathiGallery() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await api.get(
        "/admin/gaon-sathi/images"
      );

      setImages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!file) {
      alert("Please select image");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      await api.post(
        "/admin/gaon-sathi/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setFile(null);
      fetchImages();

      alert(
        "Image uploaded successfully"
      );
    } catch (error) {
      console.log(error);
      alert("Upload failed");
    }
  };

  return (
    <div className="gallery-container">
      <h2 className="page-title">
        Gaon Sathi Avatar Selection
      </h2>

      {/* Upload Section */}
      <div className="upload-box">
        <input
          type="file"
          onChange={handleFileChange}
        />

        <button onClick={uploadImage}>
          Upload
        </button>
      </div>

      {/* Images */}
      <div className="image-grid">
        {images.length === 0 ? (
          <p>No avatars found</p>
        ) : (
          images.map((img) => (
            <div
              key={img.id}
              className="image-card"
            >
              <img
                src={img.imageUrl}
                alt="avatar"
              />

              <div className="image-info">
                <h4>
                  {img.name ||
                    `Avatar ${img.id}`}
                </h4>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GaonSathiGallery;