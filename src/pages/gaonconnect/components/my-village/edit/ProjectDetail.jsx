// import "./projectdetail.css";

// export default function ProjectDetail({ project, onBack }) {

//   const dev = project.development;

//   return (
//     <div className="project-page">

//       <button className="back-btn" onClick={onBack}>
//         ← Back
//       </button>

//       <h1>{dev.master?.title}</h1>

//       <p className="phase">
//         Phase {dev.phaseNumber}
//       </p>

//       {dev.master?.imageUrl && (
//         <img
//           src={dev.master.imageUrl}
//           className="main-image"
//         />
//       )}

//       <p className="description">
//         {dev.description}
//       </p>

//       <div className="meta">

//         <p><strong>Status:</strong> {dev.status}</p>

//         <p><strong>Start:</strong> {dev.startDate}</p>

//         <p><strong>End:</strong> {dev.endDate}</p>

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

        
//          {project.images?.map((img, i) => (
//   <img
//     key={img.id || i}
//     src={img.imageUrl}
//     alt="development"
//     className="gallery-img"
//   />
// ))}
        

//       </div>

//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { getProjectById } from "../service/developmentservice";
import "./projectdetail.css";

export default function ProjectDetail({ project, onBack }) {

  const [data, setData] = useState(null);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {

      const res = await getProjectById(project.development.id);

      setData(res.data);

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
          className="main-image"
        />
      )}

      <p className="description">
        {data.description}
      </p>

      <div className="meta">

        <p><strong>Status:</strong> {data.status}</p>

        <p><strong>Start:</strong> {data.startDate}</p>

        <p><strong>End:</strong> {data.endDate}</p>

        <p>
          <strong>Progress:</strong>
          {project.progressPercent}%
        </p>

      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${project.progressPercent}%`
          }}
        />
      </div>

      <h3>Gallery Images</h3>

      <div className="gallery">

        {data.images?.map((img) => (
          <img
            key={img.id}
            src={img.imageUrl}
            className="gallery-img"
          />
        ))}

      </div>

    </div>
  );
}