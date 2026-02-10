import React from "react";
import { deleteBanner } from "./bannerApi";
import "./banner.css";

const BannerList = ({ banners, onEdit, onRefresh }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Delete this banner?")) {
      await deleteBanner(id);
      onRefresh();
    }
  };

  return (
    <div className="banner-table-wrapper">
      <table className="banner-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Banner Title</th>
            <th>Dates</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {banners.map((b) => (
            <tr key={b.id}>
              <td>{b.eventName}</td>
              <td>{b.bannerTitle}</td>
              <td>
                {b.startDate} <br /> {b.endDate}
              </td>

              {/* MULTIPLE IMAGES */}
              <td>
                <div className="table-image-row">
                  {b.images?.map((img, i) => (
                    <img key={i} src={img} alt="banner" />
                  ))}
                </div>
              </td>

              <td className="actions">

  <button
    className="icon-btn edit"
    title="Edit"
    onClick={() => onEdit(b)}
  >
    ✏️
  </button>

  <button
    className="icon-btn delete"
    title="Delete"
    onClick={() => handleDelete(b.id)}
  >
    🗑
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BannerList;
