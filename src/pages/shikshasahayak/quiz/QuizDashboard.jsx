import { useState } from "react";
import "./quiz.css";

import AddQuestion from "./components/AddQuestion";
import UploadQuestions from "./components/UploadQuestions";
import ManageQuestions from "./components/ManageQuestions";
import ManageBatches from "./components/ManageBatches";
import ManageConfig from "./components/ManageConfig";
import ResolveDuplicates from "./components/ResolveDuplicates";

export default function QuizDashboard() {
  const role = localStorage.getItem("adminRole");
  const isSuperOrState = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const [activeTab, setActiveTab] = useState(
    isSuperOrState ? "add" : "manage"
  );

  return (
    <div className="ncert-dashboard">
      <h2>Quiz Management</h2>

      <div className="ncert-tabs">
        {isSuperOrState && (
          <>
            <button
              className={activeTab === "add" ? "active" : ""}
              onClick={() => setActiveTab("add")}
            >
              Add Question
            </button>
            <button
              className={activeTab === "upload" ? "active" : ""}
              onClick={() => setActiveTab("upload")}
            >
              Upload Excel
            </button>
          </>
        )}

        <button
          className={activeTab === "manage" ? "active" : ""}
          onClick={() => setActiveTab("manage")}
        >
          Manage Questions
        </button>

        {isSuperOrState && (
          <>
            <button
              className={activeTab === "duplicates" ? "active" : ""}
              onClick={() => setActiveTab("duplicates")}
            >
              Duplicates
            </button>
            <button
              className={activeTab === "batches" ? "active" : ""}
              onClick={() => setActiveTab("batches")}
            >
              Batches
            </button>
            <button
              className={activeTab === "config" ? "active" : ""}
              onClick={() => setActiveTab("config")}
            >
              Config
            </button>
          </>
        )}
      </div>

      {isSuperOrState && activeTab === "add" && <AddQuestion />}
      {isSuperOrState && activeTab === "upload" && <UploadQuestions />}
      {activeTab === "manage" && <ManageQuestions />}
      {isSuperOrState && activeTab === "duplicates" && <ResolveDuplicates />}
      {isSuperOrState && activeTab === "batches" && <ManageBatches />}
      {isSuperOrState && activeTab === "config" && <ManageConfig />}
    </div>
  );
}
