import { useState } from "react";
import { createVillage } from "./services/villageService";
import VillageForm from "./VillageForm";
import { Toast } from "./ui";
import "./admin.css";

export default function CreateVillage({ onDone }) {
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      await createVillage(payload);
      setToast("Village created.");
      setFormKey((k) => k + 1); // reset the form
      // If used inside the tabbed wrapper, jump back to the list shortly after
      if (onDone) setTimeout(onDone, 900);
    } catch (e) {
      console.error(e);
      setToast("Could not create village. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sg-page">
      <h1 className="sg-page-title">Create a village</h1>
      <p className="sg-page-sub">
        Add the village details, optionally mark popular places, and turn on
        Smart Gaon to track development phases.
      </p>

      <VillageForm
        key={formKey}
        submitLabel="Create village"
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      <Toast message={toast} onDone={() => setToast("")} />
    </div>
  );
}
