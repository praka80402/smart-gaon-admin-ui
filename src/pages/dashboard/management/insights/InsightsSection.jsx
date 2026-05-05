import React from "react";
import "./insights.css";

const InsightsSection = ({ data }) => {
  const topState = data.reduce((max, item) =>
    item.count > (max?.count || 0) ? item : max,
    {}
  );

  return (
    <div className="insights-container">
      <h2>SmartGaon Insights</h2>

      <div className="insight-cards">
        <div className="insight-card">
          <h4>Top Performing State</h4>
          <p>{topState?.stateName || "-"}</p>
        </div>

        <div className="insight-card">
          <h4>Highest Villages</h4>
          <p>{topState?.count || 0}</p>
        </div>

        <div className="insight-card">
          <h4>Total States</h4>
          <p>{data.length}</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;