import React from "react";
import "../styles/Antonyms.css";

const Antonyms = ({ antonyms }) => {
  if (antonyms && antonyms.length > 0) {
    const antonymsText = antonyms.join(", ");
    return (
      <div>
        <span>Antonyms:</span> {antonymsText}
      </div>
    );
  } else {
    return null;
  }
};

export default Antonyms;
