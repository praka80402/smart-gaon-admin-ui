// import React from "react";
// import "./forum.css";
// const ForumFilter = ({
//   searchPhone,
//   setSearchPhone,
//   fromDate,
//   setFromDate,
//   toDate,
//   setToDate,
//   forumSort,
//   setForumSort,
//   onSearch,
// }) => (
//   <div className="gc-filter-row">
//     <input
//       placeholder="Search phone"
//       value={searchPhone}
//       onChange={(e) => setSearchPhone(e.target.value)}
//     />

//     <input
//       type="datetime-local"
//       value={fromDate}
//       onChange={(e) => setFromDate(e.target.value)}
//     />

//     <input
//       type="datetime-local"
//       value={toDate}
//       onChange={(e) => setToDate(e.target.value)}
//     />

//     <select value={forumSort} onChange={(e) => setForumSort(e.target.value)}>
//       <option value="createdAt,desc">Latest First</option>
//       <option value="createdAt,asc">Oldest First</option>
//     </select>

//     <button onClick={onSearch}>Search</button>
//   </div>
// );

// export default ForumFilter;

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
}) => (
  <div className="gc-filter-row">

  <input
    type="text"
    placeholder="Search phone"
    value={searchPhone}
    onChange={(e) => setSearchPhone(e.target.value)}
    className="gc-forum-input"
  />

  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="gc-forum-input"
  />

  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    className="gc-forum-input"
  />

  <button onClick={onSearch} className="gc-forum-btn">
    Search
  </button>

</div>

);

export default ForumFilter;
