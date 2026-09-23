import React from "react";
import "../styles/Synonyms.css";

const Synonyms = ({ synonyms }) => {
  if (synonyms && synonyms.length > 0) {
    const synonymsText = synonyms.join(", ");
    return (
      <div>
        <span>Synonyms:</span> {synonymsText}
      </div>
    );
  } else {
    return null;
  }
};

export default Synonyms;
