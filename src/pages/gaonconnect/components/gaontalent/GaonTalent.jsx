
import React, { useState } from "react";

import Competitions from "./Competitions";

import "./styles.css";

import Engagement from "./Engagement";

export default function GaonTalent() {

  const [tab, setTab] =
    useState("competitions");

  return (

    <div className="gt-container">


      <div className="admin-tabs-wrapper">

    

        <button
          className={
            tab === "competitions"
              ? "admin-tab admin-tab-active"
              : "admin-tab"
          }
          onClick={() =>
            setTab("competitions")
          }
        >

          <div className="admin-tab-icon">

            🏆

          </div>

          <div className="admin-tab-content">

            <span className="admin-tab-title">

              Competitions

            </span>

            <span className="admin-tab-subtitle">

              Manage contests, entries and categories

            </span>

          </div>

          <div className="admin-tab-status">

            LIVE

          </div>

        </button>


        <button
          className={
            tab === "engagement"
              ? "admin-tab admin-tab-active"
              : "admin-tab"
          }
          onClick={() =>
            setTab("engagement")
          }
        >

          <div className="admin-tab-icon">

            📊

          </div>

          <div className="admin-tab-content">

            <span className="admin-tab-title">

              Engagement

            </span>

            <span className="admin-tab-subtitle">

              Monitor reports, winners and analytics

            </span>

          </div>

          <div className="admin-tab-status">

            ADMIN

          </div>

        </button>

      </div>

      <div className="content-box">

        {tab === "competitions" && (

          <Competitions />

        )}

        {tab === "engagement" && (

          <Engagement />

        )}

      </div>

    </div>
  );
}

