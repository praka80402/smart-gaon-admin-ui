import React, { useEffect, useState } from "react";
import { getStayEnquiries } from "./stay.service";
import StayTable from "./StayTable";
import "./stay-enquiry.css";

const StayEnquiry = () => {
  const [data, setData] = useState([]);
  const [phone, setPhone] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const limit = 5; // ✅ 5 per page

  // 🔹 Fetch Data
  const fetchData = async () => {
    try {
      const res = await getStayEnquiries();
      console.log("DATA:", res);
      setData(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [phone, fromDate, toDate]);

  // 🔹 Date validation
  const isValidDateRange = () => {
    if (fromDate && toDate) {
      return new Date(fromDate) <= new Date(toDate);
    }
    return true;
  };

  // 🔹 Filter Logic
  const filteredData = data.filter((item) => {
    const matchPhone =
      phone === "" || item.phone.includes(phone);

    const itemCheckIn = item.checkIn ? new Date(item.checkIn) : null;
    const itemCheckOut = item.checkOut ? new Date(item.checkOut) : null;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchFrom = !from || (itemCheckIn && itemCheckIn >= from);
    const matchTo = !to || (itemCheckOut && itemCheckOut <= to);

    return matchPhone && matchFrom && matchTo;
  });

  // 🔥 PAGINATION LOGIC (MISSING THA — अब add किया)
  const totalPages = Math.ceil(filteredData.length / limit);

  const paginatedData = filteredData.slice(
    (page - 1) * limit,
    page * limit
  );

  return (
    <div className="stay-container">

      <h2>Stay Enquiry</h2>

      {/* 🔹 Filters */}
      <div className="filter-box">

        {/* Phone with clear */}
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setPhone(value);
              }
            }}
          />
          {phone && (
            <span className="clear-btn" onClick={() => setPhone("")}>
              ×
            </span>
          )}
        </div>

        {/* From Date */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        {/* To Date */}
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        {/* Search */}
        <button
          onClick={() => {
            if (!isValidDateRange()) {
              alert("From Date should be before To Date");
              return;
            }
            fetchData();
          }}
        >
          Search
        </button>
      </div>

      {/* 🔹 Table */}
      <StayTable data={paginatedData} />

      {/* 🔹 Pagination */}
      <div className="pagination">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default StayEnquiry;