
import { useState } from "react";
import CreateVillage from "./CreateVillage";
import VillageList from "./VillageList";
import Development from "./Development/Development";
import "./admin.css";

export default function AdminDashboard() {

  const [mainTab, setMainTab] = useState("create");

  return (
    <div className="container">

      {/* Top Tabs */}
      <div className="top-tabs">
        <button
          className={mainTab === "create" ? "active-tab" : ""}
          onClick={() => setMainTab("create")}
        >
          Create
        </button>

        <button
  className={mainTab === "list" ? "active-tab" : ""}
  onClick={() => setMainTab("list")}
>
  Village List
</button>

        <button
          className={mainTab === "development" ? "active-tab" : ""}
          onClick={() => setMainTab("development")}
        >
          Development
        </button>
      </div>

      {/* Content */}
      <div className="content-area">

        {mainTab === "create" && <CreateVillage />}
        {mainTab === "list" && <VillageList />}
        {mainTab === "development" && <Development />}
      </div>

    </div>
  );
}