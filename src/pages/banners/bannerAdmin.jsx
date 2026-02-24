// import React, { useEffect, useState } from "react";
// import BannerForm from "./bannerForm";
// import BannerList from "./bannerList";
// import { getBanners } from "./bannerApi";
// import "./banner.css";

// const BannerAdmin = () => {
//   const [activeTab, setActiveTab] = useState("create"); // create | list
//   const [banners, setBanners] = useState([]);
//   const [selectedBanner, setSelectedBanner] = useState(null);

//   const loadBanners = async () => {
//     const res = await getBanners();
//     setBanners(res.data);
//     setSelectedBanner(null);
//   };

//   useEffect(() => {
//     loadBanners();
//   }, []);

//   return (
//     <div className="banner-admin">

//       <h2>Banner Management</h2>

//       {/* TABS */}
//       <div className="banner-tabs">
//         <button
//           className={activeTab === "create" ? "active" : ""}
//           onClick={() => setActiveTab("create")}
//         >
//           Create Banner
//         </button>

//         <button
//           className={activeTab === "list" ? "active" : ""}
//           onClick={() => setActiveTab("list")}
//         >
//           Banner List
//         </button>
//       </div>

//       {/* TAB CONTENT */}
//       {activeTab === "create" && (
//         <BannerForm
//           selectedBanner={selectedBanner}
//           onSuccess={() => {
//             loadBanners();
//             setActiveTab("list");
//           }}
//         />
//       )}

//       {activeTab === "list" && (
//         <BannerList
//           banners={banners}
//           onEdit={(banner) => {
//             setSelectedBanner(banner);
//             setActiveTab("create");
//           }}
//           onRefresh={loadBanners}
//         />
//       )}

//     </div>
//   );
// };

// export default BannerAdmin;

import React, { useEffect, useState } from "react";
import BannerForm from "./bannerForm";
import BannerList from "./bannerList";
import { getBanners } from "./bannerApi";
import "./banner.css";

const BannerAdmin = () => {

  /* ================= ROLE CONTROL ================= */
  const role = localStorage.getItem("adminRole");

  const canManageBanner =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  /* ================= STATES ================= */
  const [activeTab, setActiveTab] = useState(
    canManageBanner ? "create" : "list"
  );

  const [banners, setBanners] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const loadBanners = async () => {
    const res = await getBanners();
    setBanners(res.data || []);
    setSelectedBanner(null);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  return (
    <div className="banner-admin">

      <h2>Banner Management</h2>

      {/* ================= TABS ================= */}
      <div className="banner-tabs">

        {/* 🔒 Create Tab Only For SUPER + STATE */}
        {canManageBanner && (
          <button
            className={activeTab === "create" ? "active" : ""}
            onClick={() => setActiveTab("create")}
          >
            Create Banner
          </button>
        )}

        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          Banner List
        </button>

      </div>

      {/* ================= TAB CONTENT ================= */}

      {/* 🔒 Create Form Only For SUPER + STATE */}
      {activeTab === "create" && canManageBanner && (
        <BannerForm
          selectedBanner={selectedBanner}
          onSuccess={() => {
            loadBanners();
            setActiveTab("list");
          }}
        />
      )}

      {/* Banner List (All Can View) */}
      {activeTab === "list" && (
        <BannerList
          banners={banners}
          canManage={canManageBanner}  // 🔥 Pass control
          onEdit={(banner) => {
            if (!canManageBanner) return;
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