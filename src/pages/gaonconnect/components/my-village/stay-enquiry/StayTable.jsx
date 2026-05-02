import React, { useState } from "react";
import "./stay-enquiry.css";
import StayViewModal from "./StayViewModal";

const StayTable = ({ data }) => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <table className="enquiry-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Guests</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No Data Found
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{item.checkIn}</td>
                <td>{item.checkOut}</td>
                <td>{item.guests}</td>

                <td>
                  <button
                    className="enquiry-view-btn"
                    onClick={() => setSelected(item)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selected && (
        <StayViewModal
          data={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default StayTable;