// import { useState } from "react";
// import api from "./services/axiosInstance";
// import "./donation.css";

// export default function YearlyReport() {

//   const [fy, setFy] = useState("");
//   const [phone, setPhone] = useState("");
//   const [list, setList] = useState([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= LOAD ALL USERS ================= */
//   const loadAll = async () => {

//     if (!fy) return alert("Select Financial Year");

//     try {
//       setLoading(true);

//       const res = await api.get(`/admin/report/yearly/${fy}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
//       });

//       setList(res.data || []);

//     } catch (err) {
//       console.error(err);
//       alert("Failed to load report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= SEARCH BY PHONE ================= */
//   const loadByPhone = async () => {

//     if (!fy || !phone) return alert("Enter phone & FY");

//     try {
//       setLoading(true);

//       const res = await api.get(`/admin/report/yearly/${fy}/${phone}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
//       });

//       setList(res.data || []);

//     } catch (err) {
//       console.error(err);
//       alert("No user found");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= DOWNLOAD REPORT ================= */
//  /* ================= DOWNLOAD PDF ================= */
// const downloadPDF = async () => {

//   if (!fy || !phone) return alert("Enter phone & FY first");

//   try {
//     const res = await api.get(
//       `/admin/report/yearly/download?fy=${fy}&phone=${phone}&type=pdf`,
//       {
//         responseType: "blob",
//         headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
//       }
//     );

//     const blob = new Blob([res.data], { type: "application/pdf" });

//     const link = document.createElement("a");
//     link.href = window.URL.createObjectURL(blob);
//     link.download = `Donation-${phone}-${fy}.pdf`;
//     link.click();

//   } catch {
//     alert("PDF download failed");
//   }
// };

// /* ================= DOWNLOAD EXCEL ================= */
// const downloadExcel = async () => {

//   if (!fy || !phone) return alert("Enter phone & FY first");

//   try {
//     const res = await api.get(
//       `/admin/report/yearly/download?fy=${fy}&phone=${phone}&type=excel`,
//       {
//         responseType: "blob",
//         headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
//       }
//     );

//     const blob = new Blob([res.data]);

//     const link = document.createElement("a");
//     link.href = window.URL.createObjectURL(blob);
//     link.download = `Donation-${phone}-${fy}.xlsx`;
//     link.click();

//   } catch {
//     alert("Excel download failed");
//   }
// };


//   /* ===== TOTAL ===== */
//   const total = list.reduce((sum, r) => sum + (r.amount || 0), 0);

//   return (
//     <div className="donation-card">

//       <h3>Yearly Donation Report</h3>

//       {/* FILTER BAR */}
//       <div style={{display:"flex",gap:"10px",marginBottom:"15px",flexWrap:"wrap"}}>

//         <select value={fy} onChange={e=>setFy(e.target.value)}>
//           <option value="">Select FY</option>
//           <option value="2024-25">2024-25</option>
//           <option value="2025-26">2025-26</option>
//           <option value="2026-27">2026-27</option>
//         </select>

//         <input
//           placeholder="Enter Phone Number"
//           value={phone}
//           onChange={e=>setPhone(e.target.value)}
//         />

//         <button className="view-btn" onClick={loadAll}>All Users</button>
//        <button className="delete-btn" onClick={downloadPDF}>Download PDF</button>
// <button className="view-btn" onClick={downloadExcel}>Download Excel</button>


//       </div>

//       {loading && <p>Loading...</p>}
//       {!loading && list.length === 0 && <p>No data</p>}

//       {list.length > 0 && (
//         <>
//         <table className="campaign-table">
//           <thead>
//             <tr>
//               <th>User</th>
//               <th>Phone</th>
//               <th>Project / Program</th>
//               <th>Type</th>
//               <th>Amount</th>
//               <th>FY</th>
//             </tr>
//           </thead>

//           <tbody>
//             {list.map((r,i)=>(
//               <tr key={i}>
//                 <td>{r.name}</td>
//                 <td>{r.phone}</td>
//                 <td>{r.campaignTitle}</td>
//                 <td>{r.campaignType}</td>
//                 <td>₹{r.amount}</td>
//                 <td>{r.financialYear}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <h3 style={{marginTop:"15px"}}>Total Donation: ₹{total}</h3>
//         </>
//       )}

//     </div>
//   );
// }


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
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
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

    if (!fy || !phone) return alert("Enter phone & FY");

    try {
      setLoading(true);

      const res = await api.get(`/admin/report/yearly/${fy}/${phone}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
      });

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

    if (!fy || !phone) return alert("Enter phone & FY first");

    try {
      const res = await api.get(
        `/admin/report/yearly/download?fy=${fy}&phone=${phone}&type=pdf`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });

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

    if (!fy || !phone) return alert("Enter phone & FY first");

    try {
      const res = await api.get(
        `/admin/report/yearly/download?fy=${fy}&phone=${phone}&type=excel`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
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

  /* ===== TOTAL ===== */
  const total = list.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="donation-card">

      <h3>Yearly Donation Report</h3>

      {/* FILTER BAR */}
      <div style={{display:"flex",gap:"10px",marginBottom:"15px",flexWrap:"wrap"}}>

        <select value={fy} onChange={e=>setFy(e.target.value)}>
          <option value="">Select FY</option>
          <option value="2024-25">2024-25</option>
          <option value="2025-26">2025-26</option>
          <option value="2026-27">2026-27</option>
        </select>

        <input
          placeholder="Enter Phone Number"
          value={phone}
          onChange={e=>setPhone(e.target.value)}
        />

        <button className="view-btn" onClick={loadAll}>All Users</button>
        <button className="edit-btn" onClick={loadByPhone}>Search User</button>

        <button className="delete-btn" onClick={()=>setShowDownload(true)}>
          Download
        </button>

      </div>

      {loading && <p>Loading...</p>}
      {!loading && list.length === 0 && <p>No data</p>}

      {list.length > 0 && (
        <>
        <table className="campaign-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Phone</th>
              <th>Project / Program</th>
              <th>Type</th>
              <th>Amount</th>
              <th>FY</th>
            </tr>
          </thead>

          <tbody>
            {list.map((r,i)=>(
              <tr key={i} onClick={()=>setPhone(r.phone)}>
                <td>{r.name}</td>
                <td>{r.phone}</td>
                <td>{r.campaignTitle}</td>
                <td>{r.campaignType}</td>
                <td>₹{r.amount}</td>
                <td>{r.financialYear}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{marginTop:"15px"}}>Total Donation: ₹{total}</h3>
        </>
      )}

      {/* DOWNLOAD MODAL */}
      {showDownload && (
        <div className="download-modal">
          <div className="download-box">
            <h4>Select Format</h4>

            <button onClick={()=>{downloadPDF(); setShowDownload(false);}}>
              Download PDF
            </button>

            <button onClick={()=>{downloadExcel(); setShowDownload(false);}}>
              Download Excel
            </button>

            <button className="cancel-btn" onClick={()=>setShowDownload(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
