import React, { useState, useEffect } from "react";
import {
  getAllModules,
  saveModule,
  updateModule,
  deleteModule,
  getAliasesByModule,
  getAllAliases,
  saveAlias,
  updateAlias,
  deleteAlias,
  resolveNavigation,
} from "./NavigationApi";
import "./NavigationTab.css";

// ─── INITIAL FORM STATES ──────────────────────────────────
const emptyModule = {
  moduleCode: "",
  moduleName: "",
  routePath: "",
  icon: "",
  active: true,
};

const emptyAlias = {
  moduleCode: "",
  aliasText: "",
  language: "hi",
  active: true,
};

const LANGUAGES = ["en", "hi", "bn", "mr", "ta", "te"];
const ALIAS_MODULE_STORAGE_KEY = "gaonSathiAliasModuleCode";

function NavigationTab() {
  const [subTab, setSubTab] = useState("modules"); // modules | aliases | resolve

  // ── MODULE STATE ──
  const [modules, setModules] = useState([]);
  const [moduleForm, setModuleForm] = useState(emptyModule);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleLoading, setModuleLoading] = useState(false);

  // ── ALIAS STATE ──
  const [aliases, setAliases] = useState([]);
  const [aliasForm, setAliasForm] = useState(emptyAlias);
  const [editingAlias, setEditingAlias] = useState(null);
  const [aliasModuleCode, setAliasModuleCode] = useState(
    () => localStorage.getItem(ALIAS_MODULE_STORAGE_KEY) || ""
  );
  const [aliasLoading, setAliasLoading] = useState(false);

  // ── RESOLVE STATE ──
  const [resolveMsg, setResolveMsg] = useState("");
  const [resolveResult, setResolveResult] = useState(null);
  const [resolveLoading, setResolveLoading] = useState(false);

  // ─── LOAD MODULES ON MOUNT ─────────────────────────────
  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    if (!aliasModuleCode.trim()) {
      localStorage.removeItem(ALIAS_MODULE_STORAGE_KEY);
      return;
    }

    localStorage.setItem(ALIAS_MODULE_STORAGE_KEY, aliasModuleCode.trim());
  }, [aliasModuleCode]);

useEffect(() => {
  const savedModuleCode =
    localStorage.getItem(ALIAS_MODULE_STORAGE_KEY)?.trim();

  if (!savedModuleCode) return;

  setAliasForm((prev) => ({
    ...prev,
    moduleCode: savedModuleCode,
  }));

  loadAliases(savedModuleCode);
}, []);

  const loadModules = async () => {
    setModuleLoading(true);
    try {
      const data = await getAllModules();
      setModules(data);
   } catch (err) {
  const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Unknown error";
  alert("Error: " + msg);
  console.error("Load modules error:", err?.response || err);
}

    setModuleLoading(false);
  };

  // ─── MODULE HANDLERS ──────────────────────────────────

  const handleModuleSubmit = async () => {
    const { moduleCode, moduleName, routePath } = moduleForm;
    if (!moduleCode || !moduleName || !routePath) {
      alert("Module Code, Module Name and Route Path are required.");
      return;
    }
    setModuleLoading(true);
    try {
      if (editingModule) {
        await updateModule(editingModule.id, moduleForm);
        alert("Module updated successfully!");
      } else {
        await saveModule(moduleForm);
        alert("Module saved successfully!");
      }
      setModuleForm(emptyModule);
      setEditingModule(null);
      loadModules();
  } catch (err) {
  const msg = err?.response?.data?.message || err?.response?.data || err?.message || "Unknown error";
  alert("Error: " + msg);
  console.error("Module save error:", err?.response || err);
}

    setModuleLoading(false);
  };

  const handleEditModule = (mod) => {
    setEditingModule(mod);
    setModuleForm({
      moduleCode: mod.moduleCode,
      moduleName: mod.moduleName,
      routePath: mod.routePath,
      icon: mod.icon || "",
      active: mod.active,
    });
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this module?")) return;
    setModuleLoading(true);
    try {
      await deleteModule(id);
      loadModules();
    } catch {
      alert("Failed to delete module.");
    }
    setModuleLoading(false);
  };

  const cancelModuleEdit = () => {
    setEditingModule(null);
    setModuleForm(emptyModule);
  };

  // ─── ALIAS HANDLERS ───────────────────────────────────

  const loadAliases = async (code) => {
    const normalizedCode = code?.trim();
    if (!normalizedCode) {
      setAliases([]);
      return [];
    }

    setAliasLoading(true);
    try {
      const data = await getAliasesByModule(normalizedCode);
      setAliases(data);
      return data;
    } catch {
      setAliases([]);
      alert("Failed to load aliases.");
      return [];
    } finally {
      setAliasLoading(false);
    }
  };

  const loadAllAliases = async () => {
  setAliasLoading(true);

  try {
    const data = await getAllAliases();

    console.log("All aliases response:", data);

    setAliases(data);
  } catch (err) {
    console.error("Load all aliases error:", err);
    console.error("Response:", err?.response);

    alert(
      err?.response?.data?.message ||
      JSON.stringify(err?.response?.data) ||
      err?.message ||
      "Failed to load all aliases."
    );
  } finally {
    setAliasLoading(false);
  }
};

  const handleAliasFetch = async () => {
    const code = aliasModuleCode.trim();
    if (!code) {
      alert("Please enter a Module Code first.");
      return;
    }
    

    setAliasModuleCode(code);
    setAliasForm({ ...emptyAlias, moduleCode: code });
    await loadAliases(code);
  };

  const handleAliasSubmit = async () => {
    const { moduleCode, aliasText, language } = aliasForm;
    if (!moduleCode || !aliasText || !language) {
      alert("Please fill in all required fields.");
      return;
    }
    setAliasLoading(true);
    try {
      const code = moduleCode.trim();
      if (editingAlias) {
        await updateAlias(editingAlias.id, aliasForm);
        alert("Alias updated successfully!");
      } else {
        await saveAlias(aliasForm);
        alert("Alias saved successfully!");
      }

      setAliasModuleCode(code);
      setAliasForm({ ...emptyAlias, moduleCode: code });
      setEditingAlias(null);
      await loadAliases(code);

    } catch (err) {
  console.error(err.response?.data || err);

  alert(
    err?.response?.data?.message ||
    JSON.stringify(err?.response?.data) ||
    "Failed to save alias."
  );
    } finally {
      setAliasLoading(false);
    }
  };

  const handleEditAlias = (alias) => {
    setEditingAlias(alias);
    setAliasForm({
      moduleCode: alias.moduleCode,
      aliasText: alias.aliasText,
      language: alias.language || "hi",
      active: alias.active,
    });
  };

  const handleDeleteAlias = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alias?")) return;
    setAliasLoading(true);
    try {
      await deleteAlias(id);
      await loadAliases(aliasModuleCode);
    } catch {
     alert("Failed to delete alias.");
    } finally {
      setAliasLoading(false);
    }
  };

  const cancelAliasEdit = () => {
    setEditingAlias(null);
    setAliasForm({ ...emptyAlias, moduleCode: aliasModuleCode });
  };

  // ─── RESOLVE HANDLER ──────────────────────────────────

  const handleResolve = async () => {
    if (!resolveMsg.trim()) {
      alert("Please enter a message.");
      return;
    }
    setResolveLoading(true);
    setResolveResult(null);
    try {
      const data = await resolveNavigation(resolveMsg);
      setResolveResult(data);
    } catch {
      alert("Failed to resolve navigation.");
    }
    setResolveLoading(false);
  };

  

  // ─── RENDER ───────────────────────────────────────────

  return (
  <div className="nav-container">
    <div className="nav-main-card">

      <h2 className="page-title">
        Navigation Management
      </h2>

      {/* SUB TABS */}
      <div className="nt-sub-tabs">
        {[
          { key: "modules", label: "📦 Modules" },
          { key: "aliases", label: "🏷️ Aliases" },
          { key: "resolve", label: "🤖 Resolve Navigation" },
        ].map((t) => (
          <button
            key={t.key}
            className={`nt-sub-tab-btn${subTab === t.key ? " active" : ""}`}
            onClick={() => setSubTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
        </div>

   

      {/* ── MODULES TAB ── */}
      {subTab === "modules" && (
        <div style={{ marginTop: "16px" }}>

          {/* FORM */}
          <div className="nt-card">
            <p className="nt-section-title">
              {editingModule ? "✏️ Edit Module" : "➕ Add New Module"}
            </p>

            <div className="nt-row">
              <div className="nt-col">
                <label className="nt-label">Module Code *</label>
                <input
                  className="nt-input"
                  placeholder="e.g. jobs, kisan_mitra"
                  value={moduleForm.moduleCode}
                  disabled={!!editingModule}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, moduleCode: e.target.value })
                  }
                />
              </div>
              <div className="nt-col">
                <label className="nt-label">Module Name *</label>
                <input
                  className="nt-input"
                  placeholder="e.g. Gaon Jobs"
                  value={moduleForm.moduleName}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, moduleName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="nt-row">
              <div className="nt-col">
                <label className="nt-label">Route Path *</label>
                <input
                  className="nt-input"
                  placeholder="e.g. /jobs"
                  value={moduleForm.routePath}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, routePath: e.target.value })
                  }
                />
              </div>
              <div className="nt-col">
                <label className="nt-label">Icon</label>
                <input
                  className="nt-input"
                  placeholder="e.g. briefcase"
                  value={moduleForm.icon}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, icon: e.target.value })
                  }
                />
              </div>
              <div className="nt-col-sm">
                <label className="nt-label">Active</label>
                <select
                  className="nt-select"
                  value={moduleForm.active.toString()}
                  onChange={(e) =>
                    setModuleForm({
                      ...moduleForm,
                      active: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div>
              <button
                className="nt-btn-green"
                onClick={handleModuleSubmit}
                disabled={moduleLoading}
              >
                {moduleLoading
                  ? "Saving..."
                  : editingModule
                  ? "Update Module"
                  : "Save Module"}
              </button>
              {editingModule && (
                <button className="nt-btn-outline" onClick={cancelModuleEdit}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="nt-card">
            <p className="nt-section-title">📋 All Modules</p>
            {moduleLoading ? (
              <p className="nt-loading">Loading...</p>
            ) : modules.length === 0 ? (
              <p className="nt-empty">No modules found.</p>
            ) : (
              <table className="nt-table">
                <thead>
                  <tr>
                    {["Code", "Name", "Route", "Icon", "Status", "Actions"].map(
                      (h) => <th key={h}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((mod) => (
                    <tr key={mod.id}>
                      <td>
                        <span className="nt-code-chip">{mod.moduleCode}</span>
                      </td>
                      <td>{mod.moduleName}</td>
                      <td>{mod.routePath}</td>
                      <td>{mod.icon || "—"}</td>
                      <td>
                        <span className={mod.active ? "nt-badge-active" : "nt-badge-inactive"}>
                          {mod.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="nt-btn-edit"
                          onClick={() => handleEditModule(mod)}
                        >
                          Edit
                        </button>
                        <button
                          className="nt-btn-red"
                          onClick={() => handleDeleteModule(mod.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── ALIASES TAB ── */}
      {subTab === "aliases" && (
        <div style={{ marginTop: "16px" }}>

          {/* MODULE CODE FETCH */}
          <div className="nt-card">
            <p className="nt-section-title">🔍 View Aliases by Module Code</p>
            <div className="nt-fetch-row">
              <input
                className="nt-fetch-input"
               placeholder="Enter Module Code (e.g. jobs)"
                value={aliasModuleCode}
                onChange={(e) => setAliasModuleCode(e.target.value)}
              />
              <button className="nt-btn-green" onClick={handleAliasFetch}>
                Fetch Aliases
              </button>

               <button
                className="nt-btn-outline"
                onClick={loadAllAliases}
                >
                View All Aliases
                  </button>
            </div>
          </div>

          {/* ALIAS FORM */}
          <div className="nt-card">
            <p className="nt-section-title">
              {editingAlias ? "✏️ Edit Alias" : "➕ Add New Alias"}
            </p>

            <div className="nt-row">
              <div className="nt-col">
                <label className="nt-label">Module Code *</label>
                <input
                  className="nt-input"
                  placeholder="e.g. jobs"
                  value={aliasForm.moduleCode}
                  onChange={(e) =>
                    setAliasForm({ ...aliasForm, moduleCode: e.target.value })
                  }
                />
              </div>
              <div className="nt-col">
                <label className="nt-label">Alias Text *</label>
                <input
                  className="nt-input"
                  placeholder="e.g. naukri, rozgaar"
                  value={aliasForm.aliasText}
                  onChange={(e) =>
                    setAliasForm({ ...aliasForm, aliasText: e.target.value })
                  }
                />
              </div>
              <div className="nt-col-sm">
                <label className="nt-label">Language *</label>
                <select
                  className="nt-select"
                  value={aliasForm.language}
                  onChange={(e) =>
                    setAliasForm({ ...aliasForm, language: e.target.value })
                  }
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="nt-col-xs">
                <label className="nt-label">Active</label>
                <select
                  className="nt-select"
                  value={aliasForm.active.toString()}
                  onChange={(e) =>
                    setAliasForm({
                      ...aliasForm,
                      active: e.target.value === "true",
                    })
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div>
              <button
                className="nt-btn-green"
                onClick={handleAliasSubmit}
                disabled={aliasLoading}
              >
                {aliasLoading
                  ? "Saving..."
                  : editingAlias
                  ? "Update Alias"
                  : "Save Alias"}
              </button>
              {editingAlias && (
                <button className="nt-btn-outline" onClick={cancelAliasEdit}>
                  Cancel
                </button>
              )}
            </div>
          </div>
         
          {/* ALIAS TABLE */}
          {(aliasLoading || aliasModuleCode.trim()) && (
            <div className="nt-card">
              <p className="nt-section-title">
                📋 Aliases — <code>{aliasModuleCode}</code>
              </p>
              {aliasLoading ? (
                <p className="nt-loading">Loading...</p>
              ) : aliases.length === 0 ? (
                <p className="nt-empty">No aliases found for this module.</p>
              ) : (
                <table className="nt-table">
                  <thead>
                    <tr>
                      {["Alias Text", "Language", "Status", "Actions"].map(
                        (h) => <th key={h}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {aliases.map((alias) => (
                      <tr key={alias.id}>
                        <td>{alias.aliasText}</td>
                        <td>
                          <span className="nt-badge-lang">
                            {alias.language || "—"}
                          </span>
                        </td>
                        <td>
                          <span className={alias.active ? "nt-badge-active" : "nt-badge-inactive"}>
                            {alias.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="nt-btn-edit"
                            onClick={() => handleEditAlias(alias)}
                          >
                            Edit
                          </button>
                          <button
                            className="nt-btn-red"
                            onClick={() => handleDeleteAlias(alias.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── RESOLVE TAB ── */}
      {subTab === "resolve" && (
        <div style={{ marginTop: "16px" }}>
          <div className="nt-card">
            <p className="nt-section-title">🤖Detect Navigation from Message</p>
            <p className="nt-resolve-desc">
               Enter a user message to automatically detect the matching module.
            </p>

            <div className="nt-resolve-input-row">
              <input
                className="nt-resolve-input"
              placeholder='e.g. "Open Kisan Mitra" or "Show Jobs"'
                value={resolveMsg}
                onChange={(e) => setResolveMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResolve()}
              />
              <button
                className="nt-btn-green"
                onClick={handleResolve}
                disabled={resolveLoading}
              >
                {resolveLoading ? "Detecting..." : "Resolve"}
              </button>
            </div>

            {resolveResult && (
              <div className="nt-resolve-box">
                <p className="nt-resolve-box-title">✅ Matched Navigation Route:</p>
                {[
                  ["Module Code", resolveResult.moduleCode],
                  ["Module Name", resolveResult.moduleName],
                  ["Route Path", resolveResult.routePath],
                  ["Icon", resolveResult.icon || "—"],
                  ["Active", resolveResult.active ? "Yes" : "No"],
                ].map(([key, val]) => (
                  <div key={key} className="nt-resolve-row">
                    <span className="nt-resolve-key">{key}</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {!resolveLoading && resolveResult === null && resolveMsg && (
           <p className="nt-error-text">
  No matching route found.
</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NavigationTab;
