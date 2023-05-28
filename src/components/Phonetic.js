import React from "react";
import Audio from "./Audio";
import "../styles/Phonetic.css";

export default function Phonetic(props) {
  const { audio, text } = props.phonetics;

  if (audio && text) {
    return (
      <div className="Phonetic">
        <div className="audio">
          <Audio audioUrl={audio} />
        </div>
        <div className="text">{text}</div>
      </div>
    );
  } else {
    return null;
  }
}
