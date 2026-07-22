import { useEffect, useState } from "react";
import VillageList from "./VillageList";
import CreateVillage from "./CreateVillage";
import DevelopmentCatalogue from "./DevelopmentCatalogue";
import VillageRequests from "./VillageRequests";
import { getPendingCount } from "./services/villageRequestService";
import "./admin.css";

const SUBTABS = [
  ["list", "Village list"],
  ["create", "Create village"],
  ["catalogue", "Phases & developments"],
  ["requests", "Village requests"],
];

export default function MyVillage() {
  const [tab, setTab] = useState("list");
  const [pending, setPending] = useState(0);

  // Small badge on the "Village requests" tab
  useEffect(() => {
    getPendingCount()
      .then((res) => setPending(res.data?.count || 0))
      .catch(() => {});
  }, [tab]); // refresh when switching tabs (e.g. after approving)

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
            {id === "requests" && pending > 0 && (
              <span className="sg-tab-count">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "list" && <VillageList onCreate={() => setTab("create")} />}
      {tab === "create" && <CreateVillage onDone={() => setTab("list")} />}
      {tab === "catalogue" && <DevelopmentCatalogue />}
      {tab === "requests" && <VillageRequests />}
    </div>
  );
}
