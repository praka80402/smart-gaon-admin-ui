import { useState } from "react";
import { createDevelopment } from "../service/developmentservice";
import "./development.css";

export default function CreateDevelopment() {

  const [form, setForm] = useState({
    phaseNumber: "",
    title: "",
    description: "",
    status: "UPCOMING",
    startDate: "",
    endDate: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      const actualPhase =
  form.phaseNumber === "custom"
    ? form.customPhase
    : form.phaseNumber;

      formData.append("phaseNumber", actualPhase);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("status", form.status);
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);

      await createDevelopment(formData);

      alert("Development Project Created Successfully ✅");

      setForm({
        phaseNumber: "",
         customPhase: "",
        title: "",
        description: "",
        status: "UPCOMING",
        startDate: "",
        endDate: ""
      });

    } catch (error) {
      console.error("Create Development Error:", error);
      alert("Failed to create development ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dev-card">

      <h2>Create Development Project</h2>

      <form onSubmit={handleSubmit} className="dev-form">

        {/* <select
          name="phaseNumber"
          value={form.phaseNumber}
          onChange={handleChange}
          required
        >
          <option value="">Select Phase</option>
          <option value="1">Phase 1</option>
          <option value="2">Phase 2</option>
          <option value="3">Phase 3</option>
        </select> */}

       <select
  name="phaseNumber"
  value={form.phaseNumber}
  onChange={handleChange}
  required
>
  <option value="">Select Phase</option>
  <option value="1">Phase 1</option>
  <option value="2">Phase 2</option>
  <option value="3">Phase 3</option>
  <option value="custom">Custom Phase</option>
</select>

{form.phaseNumber === "custom" && (
  <input
    type="number"
    name="customPhase"
    placeholder="Enter Custom Phase Number"
    value={form.customPhase || ""}
    onChange={(e) =>
      setForm({ ...form, customPhase: e.target.value })
    }
    required
  />
)}

        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Project Description"
          value={form.description}
          onChange={handleChange}
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETE">Complete</option>
        </select>

        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
        />

        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </button>

      </form>

    </div>
  );
}