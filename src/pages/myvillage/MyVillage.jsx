import { useState } from "react";
import VillageList from "./VillageList";
import CreateVillage from "./CreateVillage";
import DevelopmentCatalogue from "./DevelopmentCatalogue";
import "./admin.css";

const SUBTABS = [
  ["list", "Village list"],
  ["create", "Create village"],
  ["catalogue", "Phases & developments"],
];

export default function MyVillage() {
  const [tab, setTab] = useState("list");

  return (
    <div className="sg-app" style={{ background: "transparent", minHeight: "auto" }}>
      {/* Sub-tab bar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "12px 0",
          borderBottom: "1px solid var(--line)",
          marginBottom: 8,
        }}
      >
        {SUBTABS.map(([id, label]) => (
          <button
            key={id}
            className={`sg-nav-tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "list" && <VillageList onCreate={() => setTab("create")} />}
      {tab === "create" && <CreateVillage onDone={() => setTab("list")} />}
      {tab === "catalogue" && <DevelopmentCatalogue />}
    </div>
  );
}
