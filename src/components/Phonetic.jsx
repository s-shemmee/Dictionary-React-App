import React from "react";
import AudioPlayer from "./AudioPlayer";
import "../styles/Phonetic.css";

export default function Phonetic(props) {
  const { audio, text } = props.phonetics;
  const word = props.word || "";

  if (!audio && !text) {
    return null;
  }

  return (
    <div className="Phonetic">
      {audio && (
        <div className="audio">
          <AudioPlayer audioUrl={audio} word={word} />
        </div>
      )}
      {text && <div className="text">{text}</div>}
    </div>
  );
}