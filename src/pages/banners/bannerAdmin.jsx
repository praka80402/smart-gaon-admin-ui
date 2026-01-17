import React, { useEffect, useState } from "react";
import BannerForm from "./bannerForm";
import BannerList from "./bannerList";
import { getBanners } from "./bannerApi";
import "./banner.css";

const BannerAdmin = () => {
  const [activeTab, setActiveTab] = useState("create"); // create | list
  const [banners, setBanners] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const loadBanners = async () => {
    const res = await getBanners();
    setBanners(res.data);
    setSelectedBanner(null);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  return (
    <div className="banner-admin">

      <h2>Banner Management</h2>

      {/* TABS */}
      <div className="banner-tabs">
        <button
          className={activeTab === "create" ? "active" : ""}
          onClick={() => setActiveTab("create")}
        >
          Create Banner
        </button>

        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          Banner List
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "create" && (
        <BannerForm
          selectedBanner={selectedBanner}
          onSuccess={() => {
            loadBanners();
            setActiveTab("list");
          }}
        />
      )}

      {activeTab === "list" && (
        <BannerList
          banners={banners}
          onEdit={(banner) => {
            setSelectedBanner(banner);
            setActiveTab("create");
          }}
          onRefresh={loadBanners}
        />
      )}

    </div>
  );
};

export default BannerAdmin;
