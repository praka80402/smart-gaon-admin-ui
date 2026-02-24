// // const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin";
// const BASE_URL = "http://localhost:9090/api/admin";
// /* ================= GET ================= */

// export const getClasses = async () => {
//   const res = await fetch(`${BASE_URL}/classes`);
//   if (!res.ok) throw new Error("Failed to load classes");
//   return res.json();
// };

// export const getSubjects = async (id) => {
//   const res = await fetch(`${BASE_URL}/subjects/${id}`);
//   if (!res.ok) throw new Error("Failed to load subjects");
//   return res.json();
// };

// export const getChapters = async (id) => {
//   const res = await fetch(`${BASE_URL}/chapters/${id}`);
//   if (!res.ok) throw new Error("Failed to load chapters");
//   return res.json();
// };


// /* ================= SUBJECT ================= */

// export const addSubject = async (classId, name) => {

//   const res = await fetch(`${BASE_URL}/subject/${classId}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ name })
//   });

//   if (!res.ok) throw new Error("Failed to add subject");

//   return res.json();
// };


// /* ================= CHAPTER ================= */

// export const addChapter = async (subjectId, name) => {

//   const res = await fetch(`${BASE_URL}/chapter/${subjectId}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ name })
//   });

//   if (!res.ok) throw new Error("Failed to add chapter");

//   return res.json();
// };


// /* ================= PDF ================= */

// export const addPdfUrl = async (data) => {

//   const res = await fetch(`${BASE_URL}/pdf/add`, {
//     method: "POST",
//     body: data
//   });

//   if (!res.ok) throw new Error("Failed to save PDF");

//   return res.text();
// };


// export const getPdfs = async (chapterId, page = 0, size = 5) => {

//   const res = await fetch(
//     `${BASE_URL}/pdf/${chapterId}?page=${page}&size=${size}`
//   );

//   if (!res.ok) throw new Error("Failed to load PDFs");

//   return res.json();
// };


// export const updatePdf = async (id, url) => {

//   const res = await fetch(`${BASE_URL}/pdf/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded"
//     },
//     body: new URLSearchParams({ pdfUrl: url })
//   });

//   if (!res.ok) throw new Error("Failed to update PDF");

//   return res.json();
// };


// export const deletePdf = async (id) => {

//   const res = await fetch(`${BASE_URL}/pdf/${id}`, {
//     method: "DELETE"
//   });

//   if (!res.ok) throw new Error("Failed to delete PDF");
// };



// /* ================= VIDEO ================= */

// export const addVideoUrl = async (data) => {

//   const res = await fetch(`${BASE_URL}/video/add`, {
//     method: "POST",
//     body: data
//   });

//   if (!res.ok) throw new Error("Failed to save video");

//   return res.text();
// };


// export const getVideos = async (chapterId, page = 0, size = 5) => {

//   const res = await fetch(
//     `${BASE_URL}/video/${chapterId}?page=${page}&size=${size}`
//   );

//   if (!res.ok) throw new Error("Failed to load videos");

//   return res.json();
// };


// export const updateVideo = async (id, url) => {

//   const res = await fetch(`${BASE_URL}/video/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded"
//     },
//     body: new URLSearchParams({ videoUrl: url })
//   });

//   if (!res.ok) throw new Error("Failed to update video");

//   return res.json();
// };


// export const deleteVideo = async (id) => {

//   const res = await fetch(`${BASE_URL}/video/${id}`, {
//     method: "DELETE"
//   });

//   if (!res.ok) throw new Error("Failed to delete video");
// };



// /* ================= SEARCH (PDF + VIDEO) ================= */

// export const searchContent = async (
//   classId,
//   subjectId,
//   chapterId,
//   page = 0,
//   size = 5
// ) => {

//   const res = await fetch(
//     `${BASE_URL}/search/content?classId=${classId}&subjectId=${subjectId}&chapterId=${chapterId}&page=${page}&size=${size}`
//   );

//   if (!res.ok) throw new Error("Search failed");

//   return res.json();
// };

// /* ================= SUBJECT / CHAPTER ================= */

// export const deleteSubject = async (id) => {

//   const res = await fetch(`${BASE_URL}/subject/${id}`, {
//     method: "DELETE"
//   });

//   if (!res.ok) throw new Error("Failed to delete subject");
// };


// export const deleteChapter = async (id) => {

//   const res = await fetch(`${BASE_URL}/chapter/${id}`, {
//     method: "DELETE"
//   });

//   const text = await res.text();

//   if (!res.ok) {
//     throw new Error(text);
//   }

//   return text;
// };



// export const updateSubject = async (id, name) => {

//   const res = await fetch(`${BASE_URL}/subject/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ name })
//   });

//   if (!res.ok) throw new Error("Failed to update subject");

//   return res.json();
// };


// export const updateChapter = async (id, name) => {

//   const res = await fetch(`${BASE_URL}/chapter/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ name })
//   });

//   if (!res.ok) throw new Error("Failed to update chapter");

//   return res.json();
// };



 const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin";
// const BASE_URL = "http://localhost:9090/api/admin";

const authHeader = () => ({
  Authorization: "Bearer " + localStorage.getItem("adminToken"),
});

/* ================= GET ================= */

export const getClasses = async () => {
  const res = await fetch(`${BASE_URL}/classes`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load classes");
  return res.json();
};

export const getSubjects = async (id) => {
  const res = await fetch(`${BASE_URL}/subjects/${id}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load subjects");
  return res.json();
};

export const getChapters = async (id) => {
  const res = await fetch(`${BASE_URL}/chapters/${id}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to load chapters");
  return res.json();
};

/* ================= SUBJECT ================= */

export const addSubject = async (classId, name) => {
  const res = await fetch(`${BASE_URL}/subject/${classId}`, {
    method: "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to add subject");
  return res.json();
};

/* ================= CHAPTER ================= */

export const addChapter = async (subjectId, name) => {
  const res = await fetch(`${BASE_URL}/chapter/${subjectId}`, {
    method: "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to add chapter");
  return res.json();
};

/* ================= PDF ================= */

export const addPdfUrl = async (data) => {
  const res = await fetch(`${BASE_URL}/pdf/add`, {
    method: "POST",
    headers: authHeader(),
    body: data,
  });

  if (!res.ok) throw new Error("Failed to save PDF");
  return res.text();
};

export const getPdfs = async (chapterId, page = 0, size = 5) => {
  const res = await fetch(
    `${BASE_URL}/pdf/${chapterId}?page=${page}&size=${size}`,
    { headers: authHeader() }
  );

  if (!res.ok) throw new Error("Failed to load PDFs");
  return res.json();
};

export const updatePdf = async (id, url) => {
  const res = await fetch(`${BASE_URL}/pdf/${id}`, {
    method: "PUT",
    headers: {
      ...authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ pdfUrl: url }),
  });

  if (!res.ok) throw new Error("Failed to update PDF");
  return res.json();
};

export const deletePdf = async (id) => {
  const res = await fetch(`${BASE_URL}/pdf/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!res.ok) throw new Error("Failed to delete PDF");
};

/* ================= VIDEO ================= */

export const addVideoUrl = async (data) => {
  const res = await fetch(`${BASE_URL}/video/add`, {
    method: "POST",
    headers: authHeader(),
    body: data,
  });

  if (!res.ok) throw new Error("Failed to save video");
  return res.text();
};

export const getVideos = async (chapterId, page = 0, size = 5) => {
  const res = await fetch(
    `${BASE_URL}/video/${chapterId}?page=${page}&size=${size}`,
    { headers: authHeader() }
  );

  if (!res.ok) throw new Error("Failed to load videos");
  return res.json();
};

export const updateVideo = async (id, url) => {
  const res = await fetch(`${BASE_URL}/video/${id}`, {
    method: "PUT",
    headers: {
      ...authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ videoUrl: url }),
  });

  if (!res.ok) throw new Error("Failed to update video");
  return res.json();
};

export const deleteVideo = async (id) => {
  const res = await fetch(`${BASE_URL}/video/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!res.ok) throw new Error("Failed to delete video");
};

/* ================= SEARCH (PDF + VIDEO) ================= */

export const searchContent = async (
  classId,
  subjectId,
  chapterId,
  page = 0,
  size = 5
) => {
  const res = await fetch(
    `${BASE_URL}/search/content?classId=${classId}&subjectId=${subjectId}&chapterId=${chapterId}&page=${page}&size=${size}`,
    { headers: authHeader() }
  );

  if (!res.ok) throw new Error("Search failed");
  return res.json();
};

/* ================= SUBJECT / CHAPTER ================= */

export const deleteSubject = async (id) => {
  const res = await fetch(`${BASE_URL}/subject/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!res.ok) throw new Error("Failed to delete subject");
};

export const deleteChapter = async (id) => {
  const res = await fetch(`${BASE_URL}/chapter/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text);
  }

  return text;
};

export const updateSubject = async (id, name) => {
  const res = await fetch(`${BASE_URL}/subject/${id}`, {
    method: "PUT",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to update subject");
  return res.json();
};

export const updateChapter = async (id, name) => {
  const res = await fetch(`${BASE_URL}/chapter/${id}`, {
    method: "PUT",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to update chapter");
  return res.json();
};