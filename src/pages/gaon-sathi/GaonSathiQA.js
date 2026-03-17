import React, { useState } from "react";
// import { api } from "../gaonconnect/services/apiConfig";
import "./gaonsathi.css";
function GaonSathiQA() {

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const submitQA = async () => {

    if (!question || !answer) {
      alert("Please enter both question and answer");
      return;
    }

    // await api.post("/admin/gaon-sathi/qa", {
    //   question,
    //   answer
    // });

    alert("Q&A uploaded successfully");

    setQuestion("");
    setAnswer("");
  };

  return (
    <div style={{ marginTop: "20px" }}>

      <h3>Upload Question & Answer</h3>

      <div className="qa-form">

        <label>Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <label>Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button onClick={submitQA}>
          Upload Q&A
        </button>

      </div>

    </div>
  );
}

export default GaonSathiQA;