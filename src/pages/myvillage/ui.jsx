import { useEffect } from "react";

export function Toggle({ checked, onChange }) {
  return (
    <label className="sg-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="sg-slider" />
    </label>
  );
}

export function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return <div className="sg-toast">{message}</div>;
}
