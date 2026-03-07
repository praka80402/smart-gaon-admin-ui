
// import { useEffect, useState } from "react";
// import { getProjectById } from "../service/developmentservice";
// import "./projectdetail.css";

// export default function ProjectDetail({ project, onBack }) {

//   const [data, setData] = useState(null);

//   useEffect(() => {
//     loadProject();
//   }, []);

//   const loadProject = async () => {
//     try {

//       const res = await getProjectById(project.development.id);

//       setData(res.data);

//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (!data) {
//     return <p>Loading project...</p>;
//   }

//   return (
//     <div className="project-page">

//       <button className="back-btn" onClick={onBack}>
//         ← Back
//       </button>

//       <h1>{data.master?.title}</h1>

//       <p className="phase">
//         Phase {data.phaseNumber}
//       </p>

//       {data.master?.imageUrl && (
//         <img
//           src={data.master.imageUrl}
//           className="main-image"
//         />
//       )}

//       <p className="description">
//         {data.description}
//       </p>

//       <div className="meta">

//         <p><strong>Status:</strong> {data.status}</p>

//         <p><strong>Start:</strong> {data.startDate}</p>

//         <p><strong>End:</strong> {data.endDate}</p>

//         <p>
//           <strong>Progress:</strong>
//           {project.progressPercent}%
//         </p>

//       </div>

//       <div className="progress-bar">
//         <div
//           className="progress-fill"
//           style={{
//             width: `${project.progressPercent}%`
//           }}
//         />
//       </div>

//       <h3>Gallery Images</h3>

//       <div className="gallery">

//         {data.images?.map((img) => (
//           <img
//             key={img.id}
//             src={img.imageUrl}
//             className="gallery-img"
//           />
//         ))}

//       </div>

//     </div>
//   );
// }

import { useEffect, useState } from "react";

import { getProjectById } from "../service/developmentservice";

import {
  getDevelopmentImages,
  getDevelopmentVideo,
  getDevelopmentReports
} from "../service/villageDevelopmentService";

import "./projectdetail.css";

export default function ProjectDetail({ project, onBack }) {

  const [data, setData] = useState(null);

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState("");
  const [reports, setReports] = useState([]);

  useEffect(() => {

    loadProject();
    loadMedia();

  }, []);

  const loadProject = async () => {

    try {

      const res = await getProjectById(project.development.id);
      setData(res.data);

    } catch (err) {

      console.error(err);

    }

  };

  const loadMedia = async () => {

    try {

      const img = await getDevelopmentImages(project.id);
      const vid = await getDevelopmentVideo(project.id);
      const rep = await getDevelopmentReports(project.id);

      setImages(img || []);
      setVideo(vid || "");
      setReports(rep || []);

    } catch (err) {

      console.error(err);

    }

  };

  if (!data) {
    return <p>Loading project...</p>;
  }

  return (

    <div className="project-page">

      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <h1>{data.master?.title}</h1>

      <p className="phase">
        Phase {data.phaseNumber}
      </p>

      {data.master?.imageUrl && (

        <img
          src={data.master.imageUrl}
          alt="development"
          className="main-image"
        />

      )}

      <p className="description">
        {data.description}
      </p>

      <div className="meta">

        <p>
          <strong>Status:</strong> {data.status}
        </p>

        <p>
          <strong>Start:</strong> {data.startDate}
        </p>

        <p>
          <strong>End:</strong> {data.endDate}
        </p>

        <p>
          <strong>Progress:</strong> {project.progressPercent}%
        </p>

      </div>

      <div className="progress-bar">

        <div
          className="progress-fill"
          style={{ width: `${project.progressPercent}%` }}
        />

      </div>

      {/* ================= MEDIA & GALLERY ================= */}

      <h2 className="section-title">
        Media & Gallery
      </h2>

      {/* ================= GALLERY ================= */}

      {images.length > 0 && (

        <>
          <h3 className="sub-title">Gallery</h3>

          <div className="gallery">

            {images.map((img, index) => (

              <img
                key={index}
                src={img}
                alt="gallery"
                className="gallery-img"
              />

            ))}

          </div>
        </>

      )}

      {/* ================= VIDEO ================= */}

      {video && (

        <>
          <h3 className="sub-title">Media</h3>

          <div
            className="video-container"
            onClick={() => window.open(video, "_blank")}
          >

            <img
              src={`https://img.youtube.com/vi/${video.split("v=")[1]}/0.jpg`}
              alt="youtube"
              className="video-thumb"
            />

          </div>
        </>

      )}

      {/* ================= REPORTS ================= */}

      {reports.length > 0 && (

        <>
          <h3 className="sub-title">Reports</h3>

          <div className="reports">

            {reports.map((rep, index) => (

              <a
                key={index}
                href={rep}
                target="_blank"
                rel="noreferrer"
                className="report-link"
              >
                📄 Report {index + 1}
              </a>

            ))}

          </div>
        </>

      )}

    </div>

  );

}