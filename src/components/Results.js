import React from "react";
import Meaning from "./Meaning";
import Phonetic from "./Phonetic";
import "../styles/Results.css";

export default function Results(props) {
  if (!props.results) {
    return null;
  }

  const { word, phonetics, meanings } = props.results;

  return (
    <div className="Results">
      <section>
        <h2>{word}</h2>
        {phonetics.map((phonetic, index) => (
          <div key={index}>
            <Phonetic phonetics={phonetic} />
          </div>
        ))}
      </section>
      {meanings.map((meaning, index) => (
        <div key={index}>
          <Meaning meanings={meaning} />
        </div>
      ))}
    </div>
  );
}
