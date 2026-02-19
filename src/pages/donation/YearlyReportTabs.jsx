import { useState } from "react";
import YearlyReport from "./YearlyReport";
import UploadYearlyCertificate from "./UploadYearlyCertificate";
import "./donation.css";

export default function YearlyReportTabs(){

  const [tab,setTab] = useState("report");

  return (
    <div className="donation-card">

      <h2>Financial Year Management</h2>

      <div className="donation-tabs">

        <button
          className={tab==="report"?"active":""}
          onClick={()=>setTab("report")}
        >
          Yearly Report
        </button>

        <button
          className={tab==="upload"?"active":""}
          onClick={()=>setTab("upload")}
        >
          Upload Year Certificate
        </button>

      </div>

      {tab==="report" && <YearlyReport/>}
      {tab==="upload" && <UploadYearlyCertificate/>}

    </div>
  );
}
