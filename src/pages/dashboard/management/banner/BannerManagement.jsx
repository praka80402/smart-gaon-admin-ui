import { useEffect, useState } from "react";
import "./bannerManagement.css";

import {
  getBanners,
  getBannersBySection,
  createBanner,
  updateBanner,
  deleteBanner
} from "./banner.service";

export default function BannerManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [banners, setBanners] = useState([]);
  const [filter, setFilter] = useState("");
  const [image, setImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [sectionType, setSectionType] = useState("LANDING_BANNER");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [editingId, setEditingId] = useState(null);

  const loadBanners = async () => {
    let data = [];
    if (filter) {
      data = await getBannersBySection(filter);
    } else {
      data = await getBanners();
    }
    setBanners(data || []);
  };

  useEffect(() => {
    loadBanners();
  }, [filter]);

  const resetForm = () => {
    setEditingId(null);
    setImage(null);
    setExistingImageUrl(null);
    setSectionType("LANDING_BANNER");
    setDisplayOrder(1);
  };

  const handleEditBanner = (banner) => {
    setEditingId(banner.id);
    setSectionType(banner.sectionType || "LANDING_BANNER");
    setDisplayOrder(banner.displayOrder || 1);
    setExistingImageUrl(banner.imageUrl || null);
    setImage(null);
    setActiveTab("create");
  };

  const handleSaveBanner = async (e) => {
    if (e) e.preventDefault();

    if (!image && !editingId) {
      alert("Please select an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("sectionType", sectionType);
      formData.append("displayOrder", displayOrder);

      if (image) {
        formData.append("image", image);
      }

      if (editingId) {
        await updateBanner(editingId, formData);
        alert("Banner Updated Successfully");
      } else {
        await createBanner(formData);
        alert("Banner Created Successfully");
      }

      resetForm();
      loadBanners();
      setActiveTab("all");
    } catch (error) {
      console.error("BANNER ERROR:", error);
      console.log("SERVER RESPONSE:", error?.response?.data);
      alert(
        error?.response?.data?.message ||
        JSON.stringify(error?.response?.data) ||
        error.message
      );
    }
  };

  return (
    <div className="banner-management">
      <div className="banner-header">
        <h2>Banner Management</h2>
      </div>

      <div className="banner-tabs">
        <button
          className={`banner-tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("all");
          }}
        >
          All Banners
        </button>

        <button
          className={`banner-tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => {
            if (activeTab !== "create" && !editingId) {
              resetForm();
            }
            setActiveTab("create");
          }}
        >
          {editingId ? "Update Banner" : "Create Banner"}
        </button>
      </div>

      <div className="banner-content">
        {activeTab === "all" && (
          <div>
            <div className="banner-card-header">
              <h3>All Banners</h3>
              <span className="banner-count-badge">
                Total Banners: {banners.length}
              </span>
            </div>

            <div className="banner-filter-bar">
              <select
                className="banner-filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All Banner Types</option>
                <option value="LANDING_BANNER">Landing Banner</option>
                <option value="HOME_BANNER">Home Banner</option>
              </select>
            </div>

            <div className="banner-table-container">
              <div className="banner-table">
                <div className="banner-table-header">
                  <span>Image</span>
                  <span>Section Type</span>
                  <span>Display Order</span>
                  <span>Actions</span>
                </div>

                {banners.length === 0 ? (
                  <div className="banner-empty-state">
                    No banners found for the selected filter.
                  </div>
                ) : (
                  banners.map((banner) => (
                    <div key={banner.id} className="banner-table-row">
                      <div>
                        <img
                          src={banner.imageUrl}
                          alt="Banner"
                          className="banner-thumb"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>

                      <div>
                        <span
                          className={`banner-badge ${
                            banner.sectionType === "HOME_BANNER"
                              ? "badge-home"
                              : "badge-landing"
                          }`}
                        >
                          {banner.sectionType === "HOME_BANNER"
                            ? "Home Banner"
                            : "Landing Banner"}
                        </span>
                      </div>

                      <div>
                        <span className="order-badge">
                          Order #{banner.displayOrder}
                        </span>
                      </div>

                      <div className="banner-actions-cell">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => handleEditBanner(banner)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this banner?")) {
                              await deleteBanner(banner.id);
                              loadBanners();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "create" && (
          <div>
            <div className="banner-card-header">
              <h3>{editingId ? "Update Banner" : "Create New Banner"}</h3>
            </div>

            <form className="banner-form" onSubmit={handleSaveBanner}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Banner Type <span className="required-star">*</span>
                  </label>
                  <select
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value)}
                  >
                    <option value="LANDING_BANNER">Landing Banner</option>
                    <option value="HOME_BANNER">Home Banner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Display Order <span className="required-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Banner Image {!editingId && <span className="required-star">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />

                {(image || existingImageUrl) && (
                  <div className="banner-preview-box">
                    <img
                      src={image ? URL.createObjectURL(image) : existingImageUrl}
                      alt="Banner Preview"
                    />
                    <span className="banner-preview-text">
                      {image
                        ? `Selected: ${image.name}`
                        : "Current active banner image"}
                    </span>
                  </div>
                )}
              </div>

              <div className="banner-form-actions">
                <button type="submit" className="save-banner-btn">
                  {editingId ? "Update Banner" : "Save Banner"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="cancel-banner-btn"
                    onClick={() => {
                      resetForm();
                      setActiveTab("all");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}