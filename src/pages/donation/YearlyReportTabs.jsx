import { useState } from "react";
import YearlyReport from "./YearlyReport";
import UploadYearlyCertificate from "./UploadYearlyCertificate";
import MailDispatcher from "./MailDispatcher";
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

        <button
          className={tab==="mail"?"active":""}
          onClick={()=>setTab("mail")}
        >
          Send Mail
        </button>

      </div>

      {tab==="report" && <YearlyReport/>}
      {tab==="upload" && <UploadYearlyCertificate/>}
      {tab==="mail" && <MailDispatcher/>}

    </div>
  );
}
