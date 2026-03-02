import { useState } from "react";
import CreateDevelopment from "./CreateDevelopment";
import DevelopmentList from "./DevelopmentList";

export default function DevelopmentMain() {

  const [activeTab, setActiveTab] = useState("create");

  return (
    <div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px"
        }}
      >
        <button
          onClick={() => setActiveTab("create")}
          style={{
            padding: "10px 20px",
            background: activeTab === "create" ? "#2c3e50" : "#ccc",
            color: activeTab === "create" ? "white" : "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Create Project
        </button>

        <button
          onClick={() => setActiveTab("list")}
          style={{
            padding: "10px 20px",
            background: activeTab === "list" ? "#2c3e50" : "#ccc",
            color: activeTab === "list" ? "white" : "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Project List
        </button>
      </div>

      {activeTab === "create" && <CreateDevelopment />}
      {activeTab === "list" && <DevelopmentList />}

    </div>
  );
}