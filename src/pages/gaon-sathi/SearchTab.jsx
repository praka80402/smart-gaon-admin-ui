// import React, { useState } from "react";
// import { searchQA } from "./QAApi";

// function SearchTab() {

//   const [question, setQuestion] = useState("");
//   const [results, setResults] = useState([]);

//   const search = async () => {

//     if (!question) return;

//     try {
//       const data = await searchQA(question);
//       setResults(data);
//     } catch (err) {
//       alert("Search failed");
//     }
//   };

//   return (
//     <div style={{ marginTop: "20px" }}>

//       <h4 style={{ marginBottom: "10px" }}>Search Question</h4>

//       <input
//         type="text"
//         placeholder="Type question..."
//         value={question}
//         onChange={(e) => setQuestion(e.target.value)}
//         style={{
//           padding: "8px",
//           width: "300px",
//           marginRight: "10px",
//           border: "1px solid #ccc",
//           borderRadius: "4px"
//         }}
//       />

//       <button
//         onClick={search}
//         style={{
//           padding: "8px 15px",
//           background: "#2e7d32",
//           color: "white",
//           border: "none",
//           cursor: "pointer",
//           borderRadius: "4px"
//         }}
//       >
//         Search
//       </button>

//       <div style={{ marginTop: "20px" }}>
//         {results.map((item, index) => (
//           <div
//             key={index}
//             style={{
//               background: "#f5f5f5",
//               padding: "10px",
//               marginBottom: "10px",
//               borderRadius: "5px"
//             }}
//           >
//             <p><b>Q:</b> {item.question}</p>
//             <p><b>A:</b> {item.answer}</p>
//           </div>
//         ))}
//       </div>

//     </div>
//   );
// }

// export default SearchTab;

import React, { useState, useEffect } from "react";
import { searchQA, getAllQA } from "./QAApi";

function SearchTab() {

  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);
  const [allQA, setAllQA] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const data = await getAllQA();
        setAllQA(data);
      } catch (err) {
        alert("Failed to load questions");
      }
      setLoading(false);
    };
    loadAll();
  }, []);

  const search = async () => {
    if (!question) return;

    setLoading(true);
    try {
      const data = await searchQA(question);
      setResults(data);
    } catch (err) {
      alert("Search failed");
    }
    setLoading(false);
  };

  // pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = allQA.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(allQA.length / itemsPerPage);

  return (
    <div style={{ marginTop: "20px" }}>

      <h4>Search Question</h4>

      <input
        type="text"
        placeholder="Type question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{
          padding: "8px",
          width: "300px",
          marginRight: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}
      />

      <button
        onClick={search}
        style={{
          padding: "8px 15px",
          background: "#2e7d32",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "4px"
        }}
      >
        Search
      </button>

      {/* ✅ LOADER */}
      {loading && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <span style={{ fontWeight: "bold", color: "#1976d2" }}>
            Loading...
          </span>
        </div>
      )}

      {/* SEARCH RESULT */}
      {!loading && results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Search Result</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {results.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {item.question}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {item.answer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ALL Q&A */}
      {!loading && (
        <div style={{ marginTop: "30px" }}>
          <h4>All Questions & Answers</h4>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {item.question}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {item.answer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "15px"
            }}
          >
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <span>Page {currentPage} of {totalPages}</span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default SearchTab;