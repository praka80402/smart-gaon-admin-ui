import React,{
  useEffect,
  useMemo,
  useState
} from "react";

import "./AssignDevelopment.css";

const AssignDevelopment = ({
  selectedVillage,
  developments = [],
  assigned = [],
  onAssign,
  onUpdate,
  onDelete,
  loading
})=>{

  const [phaseCards,setPhaseCards] = useState([1]);

  const [phaseProjects,setPhaseProjects] = useState({});

  const [selectedPhase,setSelectedPhase] =
    useState(1);

  const [selectedDevelopment,setSelectedDevelopment] =
    useState(null);

  const [progress,setProgress] = useState(0);

  const [remarks,setRemarks] = useState("");

  const [gallery,setGallery] = useState([]);

  const [reports,setReports] = useState([]);

  const [videoUrl,setVideoUrl] = useState("");

  const [editingId,setEditingId] = useState(null);

  useEffect(()=>{

    if(
      assigned &&
      assigned.length
    ){

      const existingPhases = [
        ...new Set(
          assigned.map(item=>
            Number(item.phase || 1)
          )
        )
      ].sort((a,b)=>a-b);

      if(existingPhases.length){

        setPhaseCards(existingPhases);

      }

      const grouped = {};

      assigned.forEach(item=>{

        const phaseNo =
          Number(item.phase || 1);

        grouped[phaseNo] = {

          selectedProject:{
            id:item.developmentId,
            title:item.title
          }

        };

      });

      setPhaseProjects(grouped);

    }

  },[assigned]);

  const handleAddPhase = ()=>{

    setPhaseCards(prev=>{

      const lastPhase = prev.length
        ? Math.max(...prev)
        : 0;

      return [...prev,lastPhase + 1];

    });

  };

  const handleSelectPhase = phaseNo=>{

    setSelectedPhase(phaseNo);

  };

  const handleProjectSelect = (
    phaseNo,
    project
  )=>{

    setSelectedDevelopment(project);

    setSelectedPhase(phaseNo);

    setPhaseProjects(prev=>({

      ...prev,

      [phaseNo]:{
        ...prev[phaseNo],
        selectedProject:project
      }

    }));

  };

  const handleImageUpload = e=>{

    const files =
      Array.from(e.target.files);

    setGallery(files);

  };

  const handleReportUpload = e=>{

    const files =
      Array.from(e.target.files);

    setReports(files);

  };

  const resetForm = ()=>{

    setProgress(0);

    setRemarks("");

    setGallery([]);

    setReports([]);

    setVideoUrl("");

    setEditingId(null);

  };

  const handleSubmit = ()=>{

    if(
      !selectedDevelopment
    ){
      alert(
        "Select development first"
      );
      return;
    }

    const payload = {

      villageId:selectedVillage?.id,

      developmentId:
        selectedDevelopment?.id,

      phase:selectedPhase,

      progressPercent:progress,

      remarks,

      gallery,

      reports,

      videoUrl

    };

    if(editingId){

      onUpdate &&
      onUpdate(
        editingId,
        payload
      );

    }else{

      onAssign &&
      onAssign(payload);

    }

    resetForm();

  };

  const handleEdit = item=>{

    setEditingId(item.id);

    setSelectedPhase(
      Number(item.phase || 1)
    );

    setProgress(
      item.progressPercent || 0
    );

    setRemarks(
      item.remarks || ""
    );

    setVideoUrl(
      item.videoUrl || ""
    );

    setSelectedDevelopment({
      id:item.developmentId,
      title:item.title
    });

  };

  const groupedAssigned = useMemo(()=>{

    const map = {};

    assigned.forEach(item=>{

      const phaseNo =
        Number(item.phase || 1);

      if(!map[phaseNo]){

        map[phaseNo] = [];

      }

      map[phaseNo].push(item);

    });

    return map;

  },[assigned]);

  return(

    <div className="assign-development-container">

      <div className="assign-development-header">

        <div>

          <h2>
            Edit Village
          </h2>

          <p>
            Update village details below
          </p>

        </div>

        <button
          type="button"
          className="add-phase-btn"
          onClick={handleAddPhase}
        >
          + Add Phase
        </button>

      </div>

      <div className="phase-tabs">

        {phaseCards.map(phaseNo=>(

          <button
            key={phaseNo}
            type="button"
            className={`phase-tab ${
              selectedPhase === phaseNo
                ? "active"
                : ""
            }`}
            onClick={()=>
              handleSelectPhase(
                phaseNo
              )
            }
          >
            Phase {phaseNo}
          </button>

        ))}

      </div>

      <div className="development-section">

        <h4>
          Select Development
        </h4>

        <div className="development-list">

          {developments.map(dev=>(

            <div
              key={dev.id}
              className={`development-item ${
                phaseProjects[selectedPhase]
                  ?.selectedProject?.id === dev.id
                  ? "active"
                  : ""
              }`}
              onClick={()=>handleProjectSelect(
                selectedPhase,
                dev
              )}
            >

              {dev.title}

            </div>

          ))}

        </div>

      </div>

      <div className="progress-section">

        <h4>
          Add Progress
        </h4>

        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={e=>
            setProgress(
              Number(e.target.value)
            )
          }
        />

        <div className="progress-value">

          {progress}%

        </div>

      </div>

      <div className="remarks-section">

        <textarea
          placeholder="Add remarks"
          value={remarks}
          onChange={e=>
            setRemarks(
              e.target.value
            )
          }
        />

      </div>

      <div className="media-section">

        <div className="upload-box">

          <label>
            Add Images
          </label>

          <input
            type="file"
            multiple
            onChange={
              handleImageUpload
            }
          />

        </div>

        <div className="upload-box">

          <label>
            Add Reports
          </label>

          <input
            type="file"
            multiple
            onChange={
              handleReportUpload
            }
          />

        </div>

        <div className="video-input">

          <input
            type="text"
            placeholder="Video URL"
            value={videoUrl}
            onChange={e=>
              setVideoUrl(
                e.target.value
              )
            }
          />

        </div>

      </div>

      <div className="submit-section">

        <button
          type="button"
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >

          {editingId
            ? "Update Development"
            : "Assign Development"}

        </button>

      </div>

      <div className="assigned-development-section">

        {phaseCards.map(phaseNo=>(

          <div
            className="phase-card"
            key={phaseNo}
          >

            <h3>
              Phase {phaseNo}
            </h3>

            <div className="assigned-list">

              {groupedAssigned[phaseNo]
                ?.length ? (

                groupedAssigned[phaseNo]
                .map(item=>(

                  <div
                    className="assigned-card"
                    key={item.id}
                  >

                    <div className="assigned-title">

                      {item.title}

                    </div>

                    <div className="assigned-progress">

                      Progress:
                      {" "}
                      {
                        item.progressPercent
                      }%

                    </div>

                    <div className="assigned-remarks">

                      {item.remarks}

                    </div>

                    <div className="dev-action-btns">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={()=>handleEdit(
                          item
                        )}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={()=>onDelete &&
                          onDelete(item.id)
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))

              ) : (

                <div className="empty-phase">

                  No development assigned

                </div>

              )}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default AssignDevelopment;