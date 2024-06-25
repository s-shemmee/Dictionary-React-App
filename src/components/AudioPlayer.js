import React from "react";
import "../styles/Audio.css";

export default function AudioPlayer(props) {
  function handleClick() {
    const audioElement = new window.Audio(props.audioUrl);
    audioElement.play();
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
