import { useState } from "react";

import AddSubject from "./components/AddSubject";
import AddChapter from "./components/AddChapter";
import UploadContent from "./components/UploadContent";
import ManageContent from "./ManageContent";
import ManageSyllabus from "./components/ManageSyllabus";

export default function NcertDashboard() {

  const [refresh, setRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState("subject");

  return (
    <div className="ncert-dashboard">

      <h2>NCERT Syllabus</h2>

      {/* Tabs */}
      <div className="ncert-tabs">

        <button
          className={activeTab === "subject" ? "active" : ""}
          onClick={() => setActiveTab("subject")}
        >
          Add Subject
        </button>

        <button
          className={activeTab === "chapter" ? "active" : ""}
          onClick={() => setActiveTab("chapter")}
        >
          Add Chapter
        </button>

        <button
          className={activeTab === "upload" ? "active" : ""}
          onClick={() => setActiveTab("upload")}
        >
          Upload Content
        </button>

        {/* 🔥 NEW TAB */}
        <button
          className={activeTab === "list" ? "active" : ""}
          onClick={() => setActiveTab("list")}
        >
          NCERT Syllabus List
        </button>

    <button
  className={activeTab === "syllabus" ? "active" : ""}
  onClick={() => setActiveTab("syllabus")}
>
  Manage Subject & Chapter
</button>

      </div>

      {/* Content */}
      {activeTab === "subject" && (
        <AddSubject onAdded={() => setRefresh(r => r + 1)} />
      )}

      {activeTab === "chapter" && (
        <AddChapter refresh={refresh} />
      )}

      {activeTab === "upload" && (
        <UploadContent refresh={refresh} />
      )}

      {/* 🔥 NEW VIEW */}
      {activeTab === "list" && <ManageContent />}

      {activeTab === "syllabus" && <ManageSyllabus />}




    </div>
  );
}
