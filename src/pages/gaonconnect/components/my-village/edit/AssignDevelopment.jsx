// import { useState } from "react";
// import { assignDevelopmentToVillage } from "../service/villageDevelopmentService";

// export default function AssignDevelopment({
//   selectedVillage,
//   phases,
//   getByPhase,
//   refreshDevelopment
// }) {

//   const [phase,setPhase] = useState("");
//   const [projects,setProjects] = useState([]);
//   const [selectedProject,setSelectedProject] = useState(null);

//   const [progress,setProgress] = useState("");
//   const [remarks,setRemarks] = useState("");

//   const [images,setImages] = useState([]);
//   const [videoUrl,setVideoUrl] = useState("");
//   const [reports,setReports] = useState([]);

//   const handlePhaseChange = async(value)=>{

//     setPhase(value);
//     setSelectedProject(null);

//     if(!value){
//       setProjects([]);
//       return;
//     }

//     const res = await getByPhase(value);
//     setProjects(res.data);

//   };

//   const handleAssign = async()=>{

//     if(!selectedProject){
//       alert("Select project");
//       return;
//     }

//     if(!progress){
//       alert("Enter progress");
//       return;
//     }

//     try{

//       const formData = new FormData();

//       formData.append("villageId", selectedVillage.id);
//       formData.append("developmentId", selectedProject.id);
//       formData.append("progress", Number(progress));
//       formData.append("remarks", remarks || "");
//       formData.append("videoUrl", videoUrl || "");

//       if(images.length > 0){
//         images.forEach(img=>{
//           formData.append("images", img);
//         });
//       }

//       if(reports.length > 0){
//         reports.forEach(pdf=>{
//           formData.append("reports", pdf);
//         });
//       }

//       await assignDevelopmentToVillage(formData);

//       alert("Development Assigned Successfully");

//       await refreshDevelopment();

//       setProgress("");
//       setRemarks("");
//       setImages([]);
//       setReports([]);
//       setVideoUrl("");
//       setSelectedProject(null);

//     }catch(err){

//       console.error(err);
//       alert("Assign development failed");

//     }

//   };

//   return (
//     <div>

//       <h4>Add Development</h4>

//       <select
//         value={phase}
//         onChange={(e)=>handlePhaseChange(e.target.value)}
//       >
//         <option value="">Select Phase</option>

//         {phases.map(p=>(
//           <option key={p} value={p}>
//             Phase {p}
//           </option>
//         ))}

//       </select>

//       {projects.map(p=>(
//         <div key={p.id}>

//           <input
//             type="radio"
//             name="project"
//             checked={selectedProject?.id === p.id}
//             onChange={()=>setSelectedProject(p)}
//           />

//           {p.master?.title}

//         </div>
//       ))}

//       <input
//         type="number"
//         placeholder="Progress %"
//         value={progress}
//         onChange={(e)=>setProgress(e.target.value)}
//       />

//       <input
//         placeholder="Remarks"
//         value={remarks}
//         onChange={(e)=>setRemarks(e.target.value)}
//       />

//       <input
//         type="file"
//         multiple
//         accept="image/*"
//         onChange={(e)=>setImages(Array.from(e.target.files))}
//       />

//       <input
//         placeholder="YouTube Video URL"
//         value={videoUrl}
//         onChange={(e)=>setVideoUrl(e.target.value)}
//       />

//       <input
//         type="file"
//         multiple
//         accept="application/pdf"
//         onChange={(e)=>setReports(Array.from(e.target.files))}
//       />

//       <button onClick={handleAssign}>
//         Assign Development
//       </button>

//     </div>
//   );
// }

import { useState } from "react";
import { assignDevelopmentToVillage } from "../service/villageDevelopmentService";

export default function AssignDevelopment({
  selectedVillage,
  phases,
  getByPhase,
  refreshDevelopment
}) {

  const [phase, setPhase] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [progress, setProgress] = useState("");
  const [remarks, setRemarks] = useState("");

  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [reports, setReports] = useState([]);

  const handlePhaseChange = async (value) => {

    setPhase(value);
    setSelectedProject(null);

    if (!value) {
      setProjects([]);
      return;
    }

    const res = await getByPhase(value);
    setProjects(res.data);

  };

  const handleAssign = async () => {

    if (!selectedProject) {
      alert("Select project");
      return;
    }

    if (!progress) {
      alert("Enter progress");
      return;
    }

    try {

      const formData = new FormData();

      formData.append("developmentId", selectedProject.id);
      formData.append("progress", Number(progress));
      formData.append("remarks", remarks || "");
      formData.append("videoUrl", videoUrl || "");

      images.forEach(img => {
        formData.append("images", img);
      });

      reports.forEach(pdf => {
        formData.append("reports", pdf);
      });

      await assignDevelopmentToVillage(
        selectedVillage.id,
        formData
      );

      alert("Development Assigned Successfully");

      await refreshDevelopment();

      setProgress("");
      setRemarks("");
      setImages([]);
      setReports([]);
      setVideoUrl("");
      setSelectedProject(null);

    } catch (err) {

      console.error(err);
      alert("Assign development failed");

    }

  };

  return (

    <div>

      <h4>Add Development</h4>

      <select
        value={phase}
        onChange={(e) => handlePhaseChange(e.target.value)}
      >

        <option value="">Select Phase</option>

        {phases.map(p => (
          <option key={p} value={p}>
            Phase {p}
          </option>
        ))}

      </select>

      {projects.map(p => (

        <div key={p.id}>

          <input
            type="radio"
            name="project"
            checked={selectedProject?.id === p.id}
            onChange={() => setSelectedProject(p)}
          />

          {p.master?.title}

        </div>

      ))}

      <input
        type="number"
        placeholder="Progress %"
        value={progress}
        onChange={(e) => setProgress(e.target.value)}
      />

      <input
        placeholder="Remarks"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) =>
          setImages(Array.from(e.target.files))
        }
      />

      <input
        placeholder="YouTube Video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={(e) =>
          setReports(Array.from(e.target.files))
        }
      />

      <button onClick={handleAssign}>
        Assign Development
      </button>

    </div>

  );

}