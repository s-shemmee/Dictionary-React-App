import React from "react";
import Synonyms from "./Synonyms";
import "../styles/Meaning.css";
import Antonyms from "./Antonyms";

export default function Meaning(props) {
  const { partOfSpeech, definitions } = props.meanings;

  return (
    <div className="Meaning">
      <section>
        <h3>{partOfSpeech}</h3>
        <hr />
        {definitions.map(({ definition, example, synonyms, antonyms }, index) => (
          <div key={index}>
            <div className="definition"><span>Def: </span>{definition}</div>
            {example && <div className="example"><em>{example}</em></div>}
            {synonyms && <div className="synonyms"><Synonyms synonyms={synonyms} /></div>}
            {antonyms && <div className="antonyms"><Antonyms antonyms={antonyms}/></div>}
          </div>
        ))}
      </section>
    </div>
  );
}
