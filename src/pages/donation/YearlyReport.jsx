import { useState } from "react";
import api from "./services/axiosInstance";
import "./donation.css";

export default function YearlyReport() {

  const [fy, setFy] = useState("");
  const [phone, setPhone] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  /* ================= LOAD ALL USERS ================= */
 const loadAll = async () => {
   if (!fy) return alert("Select Financial Year");

    try {

      setLoading(true);

      const res = await api.get(`/admin/report/yearly/${fy}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`
        }
      });

      setList(res.data || []);

    } catch (err) {

      console.error(err);
      alert("Failed to load report");

    } finally {

      setLoading(false);

    }

  };

  /* ================= SEARCH BY PHONE ================= */
 const loadByPhone = async () => {

    if (!fy || !phone) {
      return alert("Enter phone & FY");
    }
    try {
      setLoading(true);

     const res = await api.get(
        `/admin/report/yearly/${fy}/${phone}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      setList(res.data || []);

    } catch (err) {

      console.error(err);
      alert("No user found");

    } finally {

      setLoading(false);

    }

  };

  /* ================= DOWNLOAD PDF ================= */

  const downloadPDF = async () => {

    if (!fy || !phone) {
      return alert("Enter phone & FY first");
    }

    try {

      const res = await api.get(
        `/admin/report/yearly/download?fy=${fy}&phone=${phone}&type=pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      const blob = new Blob(
        [res.data],
        { type: "application/pdf" }
      );

      const link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);

      link.download = `Donation-${phone}-${fy}.pdf`;

      link.click();

    } catch {

      alert("PDF download failed");

    }

  };

  /* ================= DOWNLOAD EXCEL ================= */

  const downloadExcel = async () => {

    if (!fy || !phone) {
      return alert("Enter phone & FY first");
    }

    try {

      const res = await api.get(
        `/admin/report/yearly/download?fy=${fy}&phone=${phone}&type=excel`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      const blob = new Blob([res.data]);

      const link = document.createElement("a");

      link.href = window.URL.createObjectURL(blob);

      link.download = `Donation-${phone}-${fy}.xlsx`;

      link.click();

    } catch {

      alert("Excel download failed");

    }

  };

  /* ================= TOTAL ================= */

  const total = list.reduce(
    (sum, r) => sum + (r.amount || 0),
    0
  );

  return (

    <div className="yr-report-wrapper">

      {/* HEADER */}

      <div className="yr-top-header">

        <div>

          <h2>Yearly Donation Report</h2>

          <p>
            Track yearly donations, donors & downloadable reports
          </p>

        </div>

        <div className="yr-badge">
          {fy || "No FY Selected"}
        </div>

      </div>

      
      {/* FILTER CARD */}

      <div className="yr-filter-card">

        <div className="yr-filter-grid">

          <div className="yr-input-group">

            <label>Select Financial Year</label>

            <select
              value={fy}
              onChange={(e)=>setFy(e.target.value)}
            >

              <option value="">Select FY</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2026-27">2026-27</option>

            </select>

          </div>

          <div className="yr-input-group">

            <label>Phone Number</label>

            <input
              placeholder="Enter Phone Number"
              value={phone}
              onChange={(e)=>setPhone(e.target.value)}
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div className="yr-action-row">

          <button
            className="yr-btn primary"
            onClick={loadAll}
          >
            View All Users
          </button>

          <button
            className="yr-btn success"
            onClick={loadByPhone}
          >
            Search User
          </button>

          <button
            className="yr-btn danger"
            onClick={()=>setShowDownload(true)}
          >
            Download Report
          </button>

        </div>

      </div>

      {/* LOADING */}

      {loading && (

        <div className="yr-empty-state">

          <p>Loading report...</p>

        </div>

      )}

      {/* EMPTY */}

      {!loading && list.length === 0 && (

        <div className="yr-empty-state">

          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
            alt=""
          />

          <h3>No Donation Data Found</h3>

          <p>
            Select financial year and search users
          </p>

        </div>

      )}

      {/* TABLE */}

      {list.length > 0 && (

        <div className="yr-table-card">

          <div className="yr-table-header">

            <h3>Donation Records</h3>

            <span>{list.length} Records</span>

          </div>

          <div className="yr-table-wrapper">

            <table className="yr-modern-table">

              <thead>

                <tr>

                  <th>User</th>
                  <th>Phone</th>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>FY</th>

                </tr>

              </thead>

              <tbody>

                {list.map((r, i)=>(

                  <tr
                    key={i}
                    onClick={()=>setPhone(r.phone)}
                  >

                    <td>

                      <div className="yr-user-cell">

                        <div className="yr-user-avatar">
                          {r.name?.charAt(0)}
                        </div>

                        <span>{r.name}</span>

                      </div>

                    </td>

                    <td>{r.phone}</td>

                    <td>{r.campaignTitle}</td>

                    <td>

                      <span className="yr-type-badge">
                        {r.campaignType}
                      </span>

                    </td>

                    <td className="yr-amount">
                      ₹{r.amount}
                    </td>

                    <td>{r.financialYear}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/* DOWNLOAD MODAL */}

      {showDownload && (

        <div className="yr-modal-overlay">

          <div className="yr-modal">

            <h3>Download Donation Report</h3>

            <p>Select file format</p>

            <div className="yr-modal-actions">

              <button
                className="yr-btn primary"
                onClick={()=>{
                  downloadPDF();
                  setShowDownload(false);
                }}
              >
                Download PDF
              </button>

              <button
                className="yr-btn success"
                onClick={()=>{
                  downloadExcel();
                  setShowDownload(false);
                }}
              >
                Download Excel
              </button>

            </div>

            <button
              className="yr-close-btn"
              onClick={()=>setShowDownload(false)}
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>

  );

}