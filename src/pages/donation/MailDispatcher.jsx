import React, { useState } from "react";
import { api } from "../gaonconnect/services/apiConfig";
import "./mailDispatcher.css";

const MailDispatcher = () => {
  const [activeTab, setActiveTab] = useState("single"); // 'single' | 'multiple' | 'broadcast'
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    userId: "",
    userIds: "",
    emails: "",
    subject: "",
    body: "",
  });
  
  const [attachment, setAttachment] = useState({
    base64: "",
    name: "",
    size: 0,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatus({ type: "error", message: "File size exceeds 10MB limit." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      setAttachment({
        base64: base64String,
        name: file.name,
        size: file.size,
      });
      setStatus({ type: "", message: "" });
    };
    reader.readAsDataURL(file);
  };

  const clearAttachment = () => {
    setAttachment({ base64: "", name: "", size: 0 });
    const fileInput = document.getElementById("tab-file-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      let endpoint = "";
      let payload = {
        subject: formData.subject,
        body: formData.body,
        attachmentBase64: attachment.base64 || null,
        attachmentName: attachment.name || null,
      };

      if (activeTab === "single") {
        endpoint = "/api/admin/mail/send-single";
        payload.email = formData.email ? formData.email.trim() : null;
        payload.phone = formData.phone ? formData.phone.trim() : null;
        payload.userId = formData.userId ? parseInt(formData.userId) : null;
      } else if (activeTab === "multiple") {
        endpoint = "/api/admin/mail/send-multiple";
        payload.emails = formData.emails 
          ? formData.emails.split(",").map(e => e.trim()).filter(Boolean)
          : [];
        payload.userIds = formData.userIds
          ? formData.userIds.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          : [];
      } else if (activeTab === "broadcast") {
        endpoint = "/api/admin/mail/send-all";
      }

      const res = await api.post(endpoint, payload);
      setStatus({ 
        type: "success", 
        message: res.data.message || "Email action completed successfully!" 
      });
      
      setFormData(prev => ({
        ...prev,
        email: "",
        phone: "",
        userId: "",
        userIds: "",
        emails: "",
        subject: "",
        body: ""
      }));
      clearAttachment();

    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Failed to complete email transfer.";
      setStatus({ type: "error", message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mail-dispatcher-tab-wrapper">
      <div className="mail-header-banner">
        <h3>Send Mail</h3>
        <p>Send report certificates, announcements, and direct mail updates to system users.</p>
      </div>

      <div className="mail-sub-tabs">
        <button 
          type="button"
          className={`sub-tab-btn ${activeTab === "single" ? "active" : ""}`}
          onClick={() => { setActiveTab("single"); setStatus({ type: "", message: "" }); }}
        >
          Single Receiver
        </button>
        <button 
          type="button"
          className={`sub-tab-btn ${activeTab === "multiple" ? "active" : ""}`}
          onClick={() => { setActiveTab("multiple"); setStatus({ type: "", message: "" }); }}
        >
          Multiple Targets
        </button>
        <button 
          type="button"
          className={`sub-tab-btn ${activeTab === "broadcast" ? "active" : ""}`}
          onClick={() => { setActiveTab("broadcast"); setStatus({ type: "", message: "" }); }}
        >
          Global Broadcast
        </button>
      </div>

      <div className="mail-tab-form-card">
        {status.message && (
          <div className={`status-banner ${status.type}`}>
            <span>{status.type === "success" ? "✓" : "⚠"} {status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="dispatcher-form">
          {activeTab === "single" && (
            <div className="form-group-row">
              <div className="form-input-field">
                <label>Receiver Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                />
              </div>
              <div className="form-input-field">
                <label>Or User ID</label>
                <input 
                  type="number" 
                  name="userId" 
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="e.g. 2"
                />
              </div>
              <div className="form-input-field">
                <label>Or Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9308907319"
                />
              </div>
            </div>
          )}

          {activeTab === "multiple" && (
            <div className="form-group-column">
              <div className="form-input-field">
                <label>Comma Separated Emails</label>
                <textarea 
                  name="emails" 
                  value={formData.emails}
                  onChange={handleInputChange}
                  placeholder="email1@gmail.com, email2@gmail.com, email3@gmail.com"
                  rows={2}
                />
              </div>
              <div className="form-input-field">
                <label>Or Comma Separated User IDs</label>
                <input 
                  type="text" 
                  name="userIds" 
                  value={formData.userIds}
                  onChange={handleInputChange}
                  placeholder="1, 3, 4"
                />
              </div>
            </div>
          )}

          {activeTab === "broadcast" && (
            <div className="broadcast-notification-hint">
              <p>
                <strong>💡 Global Broadcast:</strong> This will dispatch an email to all active registered members in the database. 
                Use <code>{"{name}"}</code> inside the Subject or Body to personalize it automatically for each recipient.
              </p>
            </div>
          )}

          <div className="form-input-field">
            <label>Subject Line</label>
            <input 
              type="text" 
              name="subject" 
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter subject heading..."
              required
            />
          </div>

          <div className="form-input-field">
            <label>Mail Message Body</label>
            <textarea 
              name="body" 
              value={formData.body}
              onChange={handleInputChange}
              placeholder="Write message details..."
              rows={5}
              required
            />
          </div>

          <div className="attachment-upload-section">
            <label className="upload-label">Attachments (PDF, Excel, Doc, CSV, Images etc.)</label>
            <div className="upload-drag-area">
              <input 
                type="file" 
                id="tab-file-upload" 
                onChange={handleFileChange}
                className="hidden-file-input"
              />
              <label htmlFor="tab-file-upload" className="upload-trigger-btn">
                📁 Choose Document File
              </label>
              {attachment.name ? (
                <div className="selected-file-badge">
                  <span>📎 {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)</span>
                  <button type="button" className="remove-file-btn" onClick={clearAttachment}>✕</button>
                </div>
              ) : (
                <span className="no-file-text">No attachment selected (Optional)</span>
              )}
            </div>
          </div>

          <button type="submit" className="submit-dispatcher-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-loader">Sending...</span>
            ) : (
              "🚀 Send Message Now"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MailDispatcher;
