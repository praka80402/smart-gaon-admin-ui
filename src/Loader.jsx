// Loader.jsx
import { useEffect, useState } from "react";
import { loaderStore } from "./loaderStore";

export default function Loader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loaderStore.subscribe(setLoading);
  }, []);

  if (!loading) return null;

  return (
    <div style={backdrop}>
      <div style={spinner}></div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const spinner = {
  width: 50,
  height: 50,
  border: "5px solid #ccc",
  borderTop: "5px solid #1976d2",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
