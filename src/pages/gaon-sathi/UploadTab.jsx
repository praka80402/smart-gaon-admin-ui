import React, { useState, useRef } from "react";
import axios from "axios";
import { uploadQAExcel } from "./QAApi";

function UploadTab() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // PDF Upload State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfCategory, setPdfCategory] = useState("Sarkari Schemes");
  const [pdfRoute, setPdfRoute] = useState("/scheme");
  const [pdfActionLabel, setPdfActionLabel] = useState("सरकारी योजनाएं देखें");
  const [pdfKeywords, setPdfKeywords] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // Dynamic Module Form State
  const [moduleName, setModuleName] = useState("");
  const [moduleCategory, setModuleCategory] = useState("General");
  const [routePath, setRoutePath] = useState("");
  const [actionLabel, setActionLabel] = useState("");
  const [keywords, setKeywords] = useState("");
  const [knowledgeSummary, setKnowledgeSummary] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const handleModuleCategoryChange = (cat) => {
    setPdfCategory(cat);
    if (cat === "Sarkari Schemes") {
      setPdfRoute("/scheme");
      setPdfActionLabel("सरकारी योजनाएं देखें");
    } else if (cat === "Job Board") {
      setPdfRoute("/job-board");
      setPdfActionLabel("नौकरियां देखें");
    } else if (cat === "Gaon Doctor") {
      setPdfRoute("/gaon-doctor");
      setPdfActionLabel("गांव डॉक्टर संपर्क करें");
    } else if (cat === "School Competition") {
      setPdfRoute("/school-competition");
      setPdfActionLabel("स्कूल प्रतियोगिताएं देखें");
    } else if (cat === "Village Directory") {
      setPdfRoute("/directory");
      setPdfActionLabel("गांव डायरेक्टरी देखें");
    }
  };

  const uploadExcel = async () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }
    setLoading(true);
    try {
      const res = await uploadQAExcel(file);
      alert(res || "Excel uploaded successfully!");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("Excel upload failed");
    }
    setLoading(false);
  };

  const uploadPdfDocument = async () => {
    if (!pdfFile) {
      alert("Please select a PDF document");
      return;
    }
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("category", pdfCategory);
      formData.append("routePath", pdfRoute);
      formData.append("actionLabel", pdfActionLabel);
      formData.append("keywords", pdfKeywords);

      const res = await axios.post("https://smartgaon.duckdns.org/api/admin/rag/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(res.data?.message || "PDF uploaded & indexed into RAG successfully!");
      setPdfFile(null);
    } catch (err) {
      alert("PDF upload failed: " + (err.response?.data?.message || err.message));
    }
    setPdfLoading(false);
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!moduleName || !routePath || !actionLabel) {
      alert("Please fill in Module Name, Route Path, and Action Label");
      return;
    }
    setFormLoading(true);
    try {
      await axios.post("https://smartgaon.duckdns.org/api/admin/rag/modules", {
        moduleName,
        category: moduleCategory,
        routePath,
        actionLabel,
        keywords,
        knowledgeSummary,
        isActive: true
      });
      alert("Dynamic RAG Module & Navigation Created Successfully!");
      setModuleName("");
      setRoutePath("");
      setActionLabel("");
      setKeywords("");
      setKnowledgeSummary("");
    } catch (err) {
      alert("Failed to create RAG Module: " + err.message);
    }
    setFormLoading(false);
  };

  return (
    <div style={{ marginTop: "20px", padding: "10px" }}>
      {/* SECTION 1: PDF DOCUMENT UPLOAD & RAG INDEXING */}
      <div style={{ background: "#f5f7fa", padding: "20px", borderRadius: "8px", marginBottom: "25px", border: "1px solid #e0e0e0" }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#0d47a1" }}>📄 Admin PDF Document Upload (RAG & Navigation Mapping)</h3>
        <p style={{ fontSize: "13px", color: "#555", marginBottom: "15px" }}>
          Upload PDF guidelines, rules, or booklets. RAG will index the text and bind it to the target navigation route.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <div>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Select Category / Topic:</label>
            <select
              value={pdfCategory}
              onChange={(e) => handleModuleCategoryChange(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="Sarkari Schemes">Sarkari Schemes (/scheme)</option>
              <option value="Job Board">Job Board & Employment (/job-board)</option>
              <option value="Gaon Doctor">Gaon Doctor & Health (/gaon-doctor)</option>
              <option value="School Competition">School Competition (/school-competition)</option>
              <option value="Village Directory">Village Directory (/directory)</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Target Navigation Route:</label>
            <input
              type="text"
              value={pdfRoute}
              onChange={(e) => setPdfRoute(e.target.value)}
              placeholder="/scheme"
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Action Button Text:</label>
            <input
              type="text"
              value={pdfActionLabel}
              onChange={(e) => setPdfActionLabel(e.target.value)}
              placeholder="सरकारी योजनाएं देखें"
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Keywords (Comma-separated):</label>
            <input
              type="text"
              value={pdfKeywords}
              onChange={(e) => setPdfKeywords(e.target.value)}
              placeholder="pm kisan, yojana, kist, 6000"
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
          style={{ padding: "8px", background: "#fff", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "15px" }}
        />
        <br />
        <button
          onClick={uploadPdfDocument}
          disabled={pdfLoading}
          style={{
            padding: "10px 20px",
            background: pdfLoading ? "#ccc" : "#0d47a1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: pdfLoading ? "not-allowed" : "pointer"
          }}
        >
          {pdfLoading ? "Indexing PDF..." : "📤 Upload & Index PDF into RAG"}
        </button>
      </div>

      {/* SECTION 2: DYNAMIC RAG MODULE CREATION */}
      <div style={{ background: "#f9fbe7", padding: "20px", borderRadius: "8px", marginBottom: "25px", border: "1px solid #dce775" }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#33691e" }}>⚙️ Create Dynamic AI Feature & Route (No Code Change)</h3>
        <form onSubmit={handleCreateModule}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label style={{ fontWeight: "bold", fontSize: "13px" }}>Feature / Module Name:</label>
              <input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="e.g. Pashu Chikitsa"
                style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ fontWeight: "bold", fontSize: "13px" }}>Target Route URL:</label>
              <input
                type="text"
                value={routePath}
                onChange={(e) => setRoutePath(e.target.value)}
                placeholder="e.g. /pashu-care"
                style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ fontWeight: "bold", fontSize: "13px" }}>Action Button Text:</label>
              <input
                type="text"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="e.g. पशु चिकित्सा सेवा देखें"
                style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ fontWeight: "bold", fontSize: "13px" }}>Keywords:</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="pashu, cow, doctor, vet, bimari"
                style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>AI Knowledge Text / Context Summary:</label>
            <textarea
              value={knowledgeSummary}
              onChange={(e) => setKnowledgeSummary(e.target.value)}
              placeholder="Enter detailed background description for Groq LLaMA AI..."
              rows={3}
              style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <button
            type="submit"
            disabled={formLoading}
            style={{
              padding: "10px 20px",
              background: formLoading ? "#ccc" : "#2e7d32",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: formLoading ? "not-allowed" : "pointer"
            }}
          >
            {formLoading ? "Creating..." : "➕ Add New Dynamic AI Module"}
          </button>
        </form>
      </div>

      {/* SECTION 3: BULK EXCEL UPLOAD */}
      <div style={{ background: "#fff3e0", padding: "20px", borderRadius: "8px", border: "1px solid #ffe0b2" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "#e65100" }}>📊 Bulk Excel Q&A Upload</h4>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "15px" }}
        />
        <br />
        <button
          onClick={uploadExcel}
          disabled={loading}
          style={{
            padding: "8px 15px",
            background: loading ? "#ccc" : "#ef6c00",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            borderRadius: "4px",
            fontWeight: "bold"
          }}
        >
          {loading ? "Uploading..." : "Upload Excel Data"}
        </button>
      </div>
    </div>
  );
}

export default UploadTab;