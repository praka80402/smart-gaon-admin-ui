import React, { useState, useEffect } from "react";

function AsyncVideoPlayer({ videoUrl, halfScreen }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (videoUrl && videoUrl.startsWith("data:video")) {
      setLoading(true);
      fetch(videoUrl)
        .then((res) => res.blob())
        .then((blob) => {
          if (active) {
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Async video fetch error:", err);
          if (active) setLoading(false);
        });
    } else {
      setBlobUrl(videoUrl);
    }
    return () => {
      active = false;
      if (blobUrl && blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <div style={{ backgroundColor: "#f1f5f9", padding: "12px", borderRadius: 8, textAlign: "center", fontSize: "12px", color: "#64748b" }}>
        No Media File Attached
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: "#0f172a", padding: 20, borderRadius: 8, color: "#38bdf8", textAlign: "center", fontSize: "13px" }}>
        ⏳ Decoding Video Stream...
      </div>
    );
  }

  const rawUrl = blobUrl || videoUrl;

  // 1. YouTube Video Embed
  const isYoutube = rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be");
  if (isYoutube) {
    let embedUrl = rawUrl;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = rawUrl.match(regExp);
    if (match && match[2].length === 11) {
      embedUrl = `https://www.youtube.com/embed/${match[2]}`;
    }
    return (
      <div style={{ borderRadius: 8, overflow: "hidden", backgroundColor: "#0f172a", height: halfScreen ? "50vh" : "180px" }}>
        {embedUrl.includes("/embed/") ? (
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube Video Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          ></iframe>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#fff" }}>
            <p>Direct preview is restricted for this link.</p>
            <a href={rawUrl} target="_blank" rel="noreferrer" style={{ color: "#f43f5e", textDecoration: "underline" }}>
              Click here to view on YouTube
            </a>
          </div>
        )}
      </div>
    );
  }

  // 2. Google Drive / External Embed
  const isDrive = rawUrl.includes("drive.google.com");
  if (isDrive) {
    let fileId = null;
    if (rawUrl.includes("/file/d/")) {
      const match = rawUrl.match(/\/file\/d\/([^/]+)/);
      if (match && match[1]) fileId = match[1];
    } else if (rawUrl.includes("id=")) {
      try {
        const urlParams = new URLSearchParams(rawUrl.split("?")[1]);
        fileId = urlParams.get("id");
      } catch (e) {}
    }

    if (fileId) {
      const directStreamUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      return (
        <div style={{ backgroundColor: "#0f172a", padding: 4, borderRadius: 8, textAlign: "center", height: halfScreen ? "50vh" : "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <video
            key={directStreamUrl}
            src={directStreamUrl}
            controls
            playsInline
            style={{ width: "100%", height: "100%", maxHeight: halfScreen ? "50vh" : "220px", borderRadius: 6, objectFit: "contain", backgroundColor: "#000" }}
          />
          <div style={{ marginTop: 8, fontSize: "12px" }}>
            <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: "#38bdf8", textDecoration: "underline" }}>
              🔗 If direct playback fails, click to view on Google Drive
            </a>
          </div>
        </div>
      );
    }

    return (
      <div style={{ borderRadius: 8, overflow: "hidden", backgroundColor: "#0f172a", padding: "20px", textAlign: "center", color: "#fff" }}>
        <p>Direct preview is restricted for this link.</p>
        <a href={rawUrl} target="_blank" rel="noreferrer" style={{ color: "#38bdf8", textDecoration: "underline" }}>
          Click here to view on Google Drive
        </a>
      </div>
    );
  }

  // 3. All Image formats (.jpg, .jpeg, .png, .gif, .webp, .bmp, .heic, .heif, .svg, .tiff, etc.)
  const isImage = rawUrl.startsWith("data:image") || rawUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp|heic|heif|svg|tiff|tif)(\?|$)/i);
  if (isImage) {
    return (
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0", background: "#0f172a", textAlign: "center" }}>
        <a href={rawUrl} target="_blank" rel="noreferrer" title="Click to view full image">
          <img
            src={rawUrl}
            alt="Winner Entry"
            style={{ width: "100%", maxHeight: halfScreen ? "50vh" : "200px", objectFit: "contain", display: "block", margin: "0 auto" }}
          />
        </a>
      </div>
    );
  }

  // 4. PDF Document
  const isPdf = rawUrl.startsWith("data:application/pdf") || rawUrl.match(/\.pdf(\?|$)/i);
  if (isPdf) {
    return (
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1.5px solid #ef4444", background: "#fef2f2", padding: "16px 14px", textAlign: "center" }}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>📄</div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#991b1b", marginBottom: "8px" }}>
          PDF Document Submission
        </div>
        <a
          href={rawUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#dc2626",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            textDecoration: "none"
          }}
        >
          👁️ View / Open PDF
        </a>
      </div>
    );
  }

  // 5. Word Document / Text File / Code
  const isDocOrText = rawUrl.startsWith("data:application/msword") ||
    rawUrl.startsWith("data:text") ||
    rawUrl.startsWith("data:application/vnd.openxmlformats") ||
    rawUrl.match(/\.(doc|docx|dot|dotx|rtf|txt|text|csv|json)(\?|$)/i);
  if (isDocOrText) {
    const isWord = rawUrl.match(/\.(doc|docx|dot|dotx|rtf)(\?|$)/i) || rawUrl.startsWith("data:application/msword") || rawUrl.startsWith("data:application/vnd.openxmlformats");
    return (
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1.5px solid #3b82f6", background: "#eff6ff", padding: "16px 14px", textAlign: "center" }}>
        <div style={{ fontSize: "36px", marginBottom: "6px" }}>{isWord ? "📘" : "📝"}</div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af", marginBottom: "8px" }}>
          {isWord ? "Word Document Submission (.doc / .docx)" : "Text / Code File Submission (.txt)"}
        </div>
        <a
          href={rawUrl}
          target="_blank"
          rel="noreferrer"
          download
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#2563eb",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            textDecoration: "none"
          }}
        >
          📥 Download / Open File
        </a>
      </div>
    );
  }

  // 6. Direct Video Stream (MP4/WebM/S3 Direct File)
  return (
    <div style={{ backgroundColor: "#0f172a", padding: 4, borderRadius: 8, textAlign: "center", height: halfScreen ? "50vh" : "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <video
        key={rawUrl}
        src={rawUrl}
        controls
        playsInline
        style={{ width: "100%", height: "100%", maxHeight: halfScreen ? "50vh" : "220px", borderRadius: 6, objectFit: "contain", backgroundColor: "#000" }}
      />
    </div>
  );
}

export default AsyncVideoPlayer;
