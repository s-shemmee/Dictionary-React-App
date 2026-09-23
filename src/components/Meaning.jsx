import React from "react";
import Synonyms from "./Synonyms";
import "../styles/Meaning.css";
import Antonyms from "./Antonyms";

const Meaning = ({ meanings }) => {
  const { partOfSpeech, definitions, synonyms, antonyms } = meanings;

  return (
    <div className="Meaning">
      <section>
        <h3>{partOfSpeech}</h3>
        <hr />
        {definitions.map(
          ({ definition, example, synonyms, antonyms }, index) => (
            <div key={index}>
              <div className="definition">
                <span>Definition: </span>
                {definition}
              </div>
              {example && (
                <div className="example">
                  <span>E.g.</span> <em>{example}</em>
                </div>
              )}
              {synonyms && (
                <div className="synonyms">
                  <Synonyms synonyms={synonyms} />
                </div>
              )}
              {antonyms && (
                <div className="antonyms">
                  <Antonyms antonyms={antonyms} />
                </div>
              )}
            </div>
          ),
        )}
        {synonyms && synonyms.length > 0 && (
          <div className="synonyms meaning-level">
            <Synonyms synonyms={synonyms} />
          </div>
        )}
        {antonyms && antonyms.length > 0 && (
          <div className="antonyms meaning-level">
            <Antonyms antonyms={antonyms} />
          </div>
        )}
      </section>
    </div>
  );
};

export default Meaning;