import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Modal";
import TodayTipsList from "../../today-tips/TodayTipsList";
import HomeLayoutAdmin from "../../home-layout/HomeLayoutAdmin";
import BannerAdmin from "../../banners/bannerAdmin";
import GaonDoctorAdmin from "../../doctor/GaonDoctorAdmin";
import AdminQuickServices from "../../quick/AdminQuickServices";
import SchemeAdmin from "../../scheme/schemeAdmin";
import { getUserCount } from "../../userService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadUserCount();
  }, []);

  const loadUserCount = async () => {
    try {
      const count = await getUserCount();
      setTotalUsers(count);
    } catch (error) {
      console.error("Failed to fetch user count", error);
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="dashboard-container">
      <div className="dashboard-title">
        <h1>Admin Dashboard</h1>
      </div>

      {/* ── Cards ── */}
     <div className="stats-wrapper">
        <div className="stats-grid">
          <div
            className="stats-card color-1"
            onClick={() => navigate("/users")}
          >
            <p className="stats-title">
              {totalUsers}
              <br />
              Total Users
            </p>
          </div>

          {/* ✅ Added color-2 — was missing before */}
          <div
            className="stats-card color-2"
            onClick={() => setActiveModal("TIPS")}
          >
            <h2 className="stats-click">Today Tips</h2>
          </div>

          <div
            className="stats-card color-3"
            onClick={() => setActiveModal("SCHEME")}
          >
            <h2 className="stats-click">Schemes</h2>
          </div>

          <div
            className="stats-card color-4"
            onClick={() => setActiveModal("BANNER")}
          >
            <h2 className="stats-click">Banners</h2>
          </div>

          <div
            className="stats-card color-5"
            onClick={() => setActiveModal("HOME")}
          >
            <h2 className="stats-click">Home Layout</h2>
          </div>
          <div
            className="stats-card color-6"
            onClick={() => navigate("/dashboard/management")}
          >
            <h2 className="stats-click">DashBoard Management</h2>
          </div>
          
          <div
            className="stats-card color-7"
            onClick={() => navigate("/admin/KnowledgeBank")}
          >
            <h2 className="stats-click">Knowledge Bank</h2>
          </div>

          <div
            className="stats-card color-9"
           onClick={() => setActiveModal("GaonDoctorAdmin")}
          >
            <h2 className="stats-click">Doctor</h2>
          </div>
         <div
            className="stats-card color-8"
           onClick={() => setActiveModal("AdminQuickServices")}
          >
            <h2 className="stats-click">Quick Services</h2>
          </div>
          <div
            className="stats-card color-8"
            onClick={() => navigate("/admin/school-competition")}
          >
            <h2 className="stats-click">School Competition</h2>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal open={activeModal === "TIPS"} onClose={closeModal}>
        <TodayTipsList onClose={closeModal} />
      </Modal>

      <Modal
        open={activeModal === "SCHEME"}
        onClose={closeModal}
        className="modal-box-scheme"
      >
        <SchemeAdmin onClose={closeModal} />
      </Modal>

      <Modal open={activeModal === "BANNER"} onClose={closeModal}>
        <BannerAdmin onClose={closeModal} />
      </Modal>

      <Modal
        open={activeModal === "HOME"}
        onClose={closeModal}
        className="home-layout-modal"
      >
        <HomeLayoutAdmin onClose={closeModal} />
      </Modal>

    <Modal
  open={activeModal === "GaonDoctorAdmin"}
  onClose={closeModal}
  className="modal-box-doctor"
>
  <GaonDoctorAdmin onClose={closeModal} />
</Modal>

<Modal
  open={activeModal === "AdminQuickServices"}
  onClose={closeModal}
  className="modal-box-quickservices"
>
  <AdminQuickServices onClose={closeModal} />
</Modal>
    </div>
  );
};

export default Dashboard;