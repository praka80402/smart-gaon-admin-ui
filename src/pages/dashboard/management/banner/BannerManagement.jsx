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

  const [sectionType, setSectionType] =
    useState("LANDING_BANNER");

  const [displayOrder, setDisplayOrder] =
    useState(1);

  const [editingId, setEditingId] =
    useState(null);

  const loadBanners = async () => {

    let data = [];

    if (filter) {
      data = await getBannersBySection(filter);
    } else {
      data = await getBanners();
    }

    setBanners(data);
  };

  useEffect(() => {
    loadBanners();
  }, [filter]);

  const handleSaveBanner = async () => {

    if (!image && !editingId) {
      alert("Please select image");
      return;
    }

    try {

      const formData = new FormData();

      formData.append(
        "sectionType",
        sectionType
      );

      formData.append(
        "displayOrder",
        displayOrder
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      if (image) {
  formData.append(
    "image",
    image
  );
}

if (editingId) {

        await updateBanner(
          editingId,
          formData
        );

        alert(
          "Banner Updated Successfully"
        );

      } else {

        await createBanner(
          formData
        );

        alert(
          "Banner Created Successfully"
        );

      }

      setEditingId(null);

      setImage(null);

      setSectionType(
        "LANDING_BANNER"
      );

      setDisplayOrder(1);

      loadBanners();

      setActiveTab("all");

    } 
    catch (error) {

  console.error("BANNER ERROR:", error);

  console.log(
    "SERVER RESPONSE:",
    error?.response?.data
  );

  alert(
    error?.response?.data?.message ||
    JSON.stringify(
      error?.response?.data
    ) ||
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
          className={
            activeTab === "all"
              ? "active-banner-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("all")
          }
        >
          All
        </button>

        <button
          className={
            activeTab === "create"
              ? "active-banner-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("create")
          }
        >
          Create
        </button>

      </div>

      <div className="banner-content">

        {activeTab === "all" && (

          <div>

            <h3>
              Total Banners :
              {banners.length}
            </h3>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Banners
              </option>

              <option value="LANDING_BANNER">
                Landing Banner
              </option>

              <option value="HOME_BANNER">
                Home Banner
              </option>
            </select>

            <div
              style={{
                marginTop: "20px"
              }}
            >

              {banners.map(
                (banner) => (

                  <div
                    key={banner.id}
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems:
                        "center",
                      marginBottom:
                        "20px"
                    }}
                  >

                    <img
                      src={
                        banner.imageUrl
                      }
                      alt=""
                      width="150"
                    />

                    <div>

                      <p>
                        {
                          banner.sectionType
                        }
                      </p>

                      <p>
                        Order :
                        {
                          banner.displayOrder
                        }
                      </p>

                    </div>

                    <button
                      onClick={() => {

                        setEditingId(
                          banner.id
                        );

                        setSectionType(
                          banner.sectionType
                        );

                        setDisplayOrder(
                          banner.displayOrder
                        );

                        setActiveTab(
                          "create"
                        );

                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={async () => {

                        if (
                          window.confirm(
                            "Delete Banner?"
                          )
                        ) {

                          await deleteBanner(
                            banner.id
                          );

                          loadBanners();

                        }

                      }}
                    >
                      Delete
                    </button>

                  </div>

                )
              )}

            </div>

          </div>

        )}

        {activeTab === "create" && (

          <div>

            <h3>
              {editingId
                ? "Update Banner"
                : "Create Banner"}
            </h3>

            <div
              className="form-group"
            >

              <label>
                Banner Type
              </label>

              <select
                value={
                  sectionType
                }
                onChange={(e) =>
                  setSectionType(
                    e.target.value
                  )
                }
              >
                <option value="LANDING_BANNER">
                  Landing Banner
                </option>

                <option value="HOME_BANNER">
                  Home Banner
                </option>
              </select>

            </div>

            <div
              className="form-group"
            >

              <label>
                Display Order
              </label>

              <input
                type="number"
                value={
                  displayOrder
                }
                onChange={(e) =>
                  setDisplayOrder(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>

            <div
              className="form-group"
            >

              <label>
                Banner Image
              </label>

              <input
                type="file"
                onChange={(e) =>
                  setImage(
                    e.target.files[0]
                  )
                }
              />

            </div>

            <button
              className="save-banner-btn"
              onClick={
                handleSaveBanner
              }
            >
              {editingId
                ? "Update Banner"
                : "Save Banner"}
            </button>

          </div>

        )}

      </div>

    </div>
  );
}