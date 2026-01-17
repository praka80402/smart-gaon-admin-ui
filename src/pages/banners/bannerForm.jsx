// import React, { useState, useEffect } from "react";
// import { createBanner, updateBanner } from "./bannerApi";
// import "./banner.css";

// const BannerForm = ({ selectedBanner, onSuccess }) => {
//   const [banner, setBanner] = useState({
//     eventName: "",
//     bannerTitle: "",
//     startDate: "",
//     endDate: "",
//     eventDetails: "",
//   });

//   const [images, setImages] = useState([]);

//   useEffect(() => {
//     if (selectedBanner) {
//       setBanner(selectedBanner);
//     }
//   }, [selectedBanner]);

//   const handleChange = (e) => {
//     setBanner({ ...banner, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     if (e.target.files.length > 10) {
//       alert("Max 10 images allowed");
//       return;
//     }
//     setImages(e.target.files);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();
//     formData.append(
//       "banner",
//       new Blob([JSON.stringify(banner)], { type: "application/json" })
//     );

//     for (let i = 0; i < images.length; i++) {
//       formData.append("images", images[i]);
//     }

//     if (selectedBanner) {
//       await updateBanner(selectedBanner.id, formData);
//     } else {
//       await createBanner(formData);
//     }

//     onSuccess();
//   };

//   return (
//     <form className="banner-form" onSubmit={handleSubmit}>
//         <label>Banner Name</label>
//       <input name="eventName" placeholder="Event Name" value={banner.eventName} onChange={handleChange} required />
//       <label>Banner Title</label>
//       <input name="bannerTitle" placeholder="Banner Title" value={banner.bannerTitle} onChange={handleChange} required />
//       <label>Start Date</label>
//       <input type="date" name="startDate" value={banner.startDate} onChange={handleChange} required />
//       <label>End Date</label>
//       <input type="date" name="endDate" value={banner.endDate} onChange={handleChange} required />
//       <label>Banner Details</label>
//       <textarea name="eventDetails" placeholder="Event Details" value={banner.eventDetails} onChange={handleChange} />
//       <input type="file" multiple accept="image/*" onChange={handleImageChange} />

//       <button type="submit">
//         {selectedBanner ? "Update Banner" : "Create Banner"}
//       </button>
//     </form>
//   );
// };

// export default BannerForm;

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createBanner, updateBanner } from "./bannerApi";
import "./banner.css";

const BannerForm = ({ selectedBanner, onSuccess }) => {
  const [banner, setBanner] = useState({
    eventName: "",
    bannerTitle: "",
    startDate: null,
    endDate: null,
    eventDetails: "",
  });

  const [images, setImages] = useState([]);

  useEffect(() => {
    if (selectedBanner) {
      const toDate = (d) => {
        if (!d) return null;
        const [dd, mm, yyyy] = d.split("/");
        return new Date(yyyy, mm - 1, dd);
      };

      setBanner({
        eventName: selectedBanner.eventName || "",
        bannerTitle: selectedBanner.bannerTitle || "",
        startDate: toDate(selectedBanner.startDate),
        endDate: toDate(selectedBanner.endDate),
        eventDetails: selectedBanner.eventDetails || "",
      });
    }
  }, [selectedBanner]);

  const formatDate = (date) => {
    if (!date) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 10) {
      alert("Max 10 images allowed");
      return;
    }
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (banner.endDate < banner.startDate) {
      alert("End Date cannot be before Start Date");
      return;
    }

    const payload = {
      ...banner,
      startDate: formatDate(banner.startDate),
      endDate: formatDate(banner.endDate),
    };

    const formData = new FormData();
    formData.append(
      "banner",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

      if (selectedBanner) {
    await updateBanner(selectedBanner.id, formData);
    alert("Banner updated successfully ✅");
  } else {
    await createBanner(formData);
    alert("Banner created successfully ✅");
  }

    // selectedBanner
    //   ? await updateBanner(selectedBanner.id, formData)
    //   : await createBanner(formData);

    onSuccess();
  };

  return (
    <form className="banner-form" onSubmit={handleSubmit}>
      <label>Banner Name</label>
      <input
        value={banner.eventName}
        onChange={(e) =>
          setBanner({ ...banner, eventName: e.target.value })
        }
        required
      />

      <label>Banner Title</label>
      <input
        value={banner.bannerTitle}
        onChange={(e) =>
          setBanner({ ...banner, bannerTitle: e.target.value })
        }
        required
      />

      <label>Start Date (dd/mm/yyyy)</label>
<DatePicker
  selected={banner.startDate}
  onChange={(date) => setBanner({ ...banner, startDate: date })}
  dateFormat="dd/MM/yyyy"
  placeholderText="dd/mm/yyyy"
  showIcon
  toggleCalendarOnIconClick
  onKeyDown={(e) => e.preventDefault()}
  className="date-input"
  required
/>

<label>End Date (dd/mm/yyyy)</label>
<DatePicker
  selected={banner.endDate}
  onChange={(date) => setBanner({ ...banner, endDate: date })}
  dateFormat="dd/MM/yyyy"
  minDate={banner.startDate}
  placeholderText="dd/mm/yyyy"
  showIcon
  toggleCalendarOnIconClick
  onKeyDown={(e) => e.preventDefault()}
  className="date-input"
  required
/>


      <label>Banner Details</label>
      <textarea
        value={banner.eventDetails}
        onChange={(e) =>
          setBanner({ ...banner, eventDetails: e.target.value })
        }
      />

      <input type="file" multiple accept="image/*" onChange={handleImageChange} />

      <button type="submit">
        {selectedBanner ? "Update Banner" : "Create Banner"}
      </button>
    </form>
  );
};

export default BannerForm;
