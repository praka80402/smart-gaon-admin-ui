import React from "react";

const ForumFilter = ({
  searchPhone,
  setSearchPhone,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  forumSort,
  setForumSort,
  onSearch,
}) => (
  <div className="gc-filter-row">
    <input
      placeholder="Search phone"
      value={searchPhone}
      onChange={(e) => setSearchPhone(e.target.value)}
    />

    <input
      type="datetime-local"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
    />

    <input
      type="datetime-local"
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
    />

    <select value={forumSort} onChange={(e) => setForumSort(e.target.value)}>
      <option value="createdAt,desc">Latest First</option>
      <option value="createdAt,asc">Oldest First</option>
    </select>

    <button onClick={onSearch}>Search</button>
  </div>
);

export default ForumFilter;
