import { useState } from "react";
import "./createVillage.css";

export default function CreateVillage() {

  const [formData,setFormData] = useState({
    villageName:"",
    district:"",
    state:"",
    description:"",
    smartGaon:false,
  });

  const [images,setImages] = useState([]);

  const handleChange = (e) => {

    const {name,value,type,checked} = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      ...formData,
      images,
    });
  };

  return (

    <div className="sg-village-page-wrapper">

      <div className="sg-village-top-header">

        <div>

          <h1 className="sg-village-main-heading">
            Create Village
          </h1>

          <p className="sg-village-main-subheading">
            Add and manage your SmartGaon village details.
          </p>

        </div>

      </div>

      <div className="sg-village-main-card">

        <form
          className="sg-village-form-wrapper"
          onSubmit={handleSubmit}
        >

          <div className="sg-village-input-group">

            <label>
              Village Name
            </label>

            <input
              type="text"
              name="villageName"
              placeholder="Enter village name"
              value={formData.villageName}
              onChange={handleChange}
              required
            />

          </div>

          <div className="sg-village-grid-layout">

            <div className="sg-village-input-group">

              <label>
                District
              </label>

              <input
                type="text"
                name="district"
                placeholder="Enter district"
                value={formData.district}
                onChange={handleChange}
              />

            </div>

            <div className="sg-village-input-group">

              <label>
                State
              </label>

              <input
                type="text"
                name="state"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="sg-village-input-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Write village details..."
              value={formData.description}
              onChange={handleChange}
            />

          </div>

          <div className="sg-village-bottom-grid">

            <div className="sg-village-upload-box">

              <label htmlFor="villageImages">
                Upload Village Images
              </label>

              <input
                id="villageImages"
                type="file"
                multiple
                onChange={(e)=>setImages(e.target.files)}
              />

              {
                images.length > 0 &&
                <p className="sg-village-upload-count">
                  {images.length} files selected
                </p>
              }

            </div>

            <div className="sg-village-smart-toggle-card">

              <div>

                <h3>
                  Smart Gaon
                </h3>

                <p>
                  Enable digital smart features.
                </p>

              </div>

              <label className="sg-village-switch">

                <input
                  type="checkbox"
                  name="smartGaon"
                  checked={formData.smartGaon}
                  onChange={handleChange}
                />

                <span className="sg-village-slider"></span>

              </label>

            </div>

          </div>

          <div className="sg-village-action-buttons">

            <button
              type="button"
              className="sg-village-clear-btn"
            >
              Clear
            </button>

            <button
              type="submit"
              className="sg-village-submit-btn"
            >
              Create Village
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}