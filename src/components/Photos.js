import React from "react";
import '../styles/Photos.css';

export default function Photos(props) {
  if (!props.photos) {
    return null;
  }

  return (
    <section className="Photos">
      <div className="row g-3">
        {props.photos.map((photo, index) => (
          <div className="col-4" key={index}>
            <a href={photo.src.original} target="_blank" rel="noreferrer">
              <img src={photo.src.landscape} className="img-fluid" alt="/" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
