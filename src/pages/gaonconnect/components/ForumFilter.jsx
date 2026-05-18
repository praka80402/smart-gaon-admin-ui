import React from "react";
import "./forum.css";

const ForumFilter = ({
  searchPhone,
  setSearchPhone,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onSearch,
  onClear,
}) => {

  return (

    <div className="gc-filter-row">

      {/* PHONE SEARCH */}

      <input
        type="text"
        placeholder="Search phone"
        value={searchPhone}
        onChange={(e) => setSearchPhone(e.target.value)}
        className="gc-forum-input"
      />

      {/* FROM DATE */}

      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="gc-forum-input"
      />

      {/* TO DATE */}

      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="gc-forum-input"
      />

      {/* SEARCH BUTTON */}

      <button
        onClick={onSearch}
        className="gc-forum-btn"
      >
        Search
      </button>

      {/* CLEAR BUTTON */}

      <button
        onClick={onClear}
        className="gc-forum-btn gc-clear-btn"
      >
        Clear
      </button>

    </div>

  );
};

export default ForumFilter;