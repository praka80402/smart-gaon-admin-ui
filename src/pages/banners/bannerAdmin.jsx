// import React, { useEffect, useState } from "react";
// import BannerForm from "./bannerForm";
// import BannerList from "./bannerList";
// import { getBanners } from "./bannerApi";
// import "./banner.css";

// const BannerAdmin = () => {

//   /* ================= ROLE CONTROL ================= */
//   const role = localStorage.getItem("adminRole");

//   const canManageBanner =
//     role === "SUPER_ADMIN" || role === "STATE_ADMIN";

//   /* ================= STATES ================= */
//   const [activeTab, setActiveTab] = useState(
//     canManageBanner ? "create" : "list"
//   );

//   const [banners, setBanners] = useState([]);
//   const [selectedBanner, setSelectedBanner] = useState(null);

//   const loadBanners = async () => {
//     const res = await getBanners();
//     setBanners(res.data || []);
//     setSelectedBanner(null);
//   };

//   useEffect(() => {
//     loadBanners();
//   }, []);

//   return (
//     <div className="banner-admin">

//       <h2>Banner Management</h2>

//       {/* ================= TABS ================= */}
//       <div className="banner-tabs">

//         {/* 🔒 Create Tab Only For SUPER + STATE */}
//         {canManageBanner && (
//           <button
//             className={activeTab === "create" ? "active" : ""}
//             onClick={() => setActiveTab("create")}
//           >
//             Create Banner
//           </button>
//         )}

//         <button
//           className={activeTab === "list" ? "active" : ""}
//           onClick={() => setActiveTab("list")}
//         >
//           Banner List
//         </button>

//       </div>

//       {/* ================= TAB CONTENT ================= */}

//       {/* 🔒 Create Form Only For SUPER + STATE */}
//       {activeTab === "create" && canManageBanner && (
//         <BannerForm
//           selectedBanner={selectedBanner}
//           onSuccess={() => {
//             loadBanners();
//             setActiveTab("list");
//           }}
//         />
//       )}

//       {/* Banner List (All Can View) */}
//       {activeTab === "list" && (
//         <BannerList
//           banners={banners}
//           canManage={canManageBanner}  // 🔥 Pass control
//           onEdit={(banner) => {
//             if (!canManageBanner) return;
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

const BannerAdmin = ({ isOpen = true, onClose = () => {} }) => {

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

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    // Overlay (click outside to close)
    <div className="bm-overlay" onClick={onClose}>

      {/* Modal Box (stop click from closing) */}
      <div className="bm-box" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="bm-header">
          <h2>Banner Management</h2>
          <button className="bm-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className="banner-tabs">
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

        {/* ── Tab Content ── */}
        <div className="bm-body">

          {activeTab === "create" && canManageBanner && (
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
              canManage={canManageBanner}
              onEdit={(banner) => {
                if (!canManageBanner) return;
                setSelectedBanner(banner);
                setActiveTab("create");
              }}
              onRefresh={loadBanners}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default BannerAdmin;