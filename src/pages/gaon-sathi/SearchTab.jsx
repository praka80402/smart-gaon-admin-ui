import React, { useState } from "react";
import { searchQA } from "./QAApi";

function SearchTab() {

  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);

  const search = async () => {

    if (!question) return;

    try {
      const data = await searchQA(question);
      setResults(data);
    } catch (err) {
      alert("Search failed");
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>

      <h4 style={{ marginBottom: "10px" }}>Search Question</h4>

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

      <div style={{ marginTop: "20px" }}>
        {results.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#f5f5f5",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px"
            }}
          >
            <p><b>Q:</b> {item.question}</p>
            <p><b>A:</b> {item.answer}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default SearchTab;