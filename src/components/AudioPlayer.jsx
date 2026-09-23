import React from "react";
import "../styles/Audio.css";

export default function AudioPlayer(props) {
  function handleClick() {
    if (props.audioUrl) {
      const audioElement = new window.Audio(props.audioUrl);
      audioElement.play();
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new window.SpeechSynthesisUtterance(props.word || "");
      utterance.lang = "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="button">
      <button
        data-playing="false"
        role="switch"
        aria-checked="false"
        onClick={handleClick}
      >
        <i className="icon fas fa-volume-up"></i>
      </button>
    </div>
  );
}
