import React from "react";
import "../styles/Photos.css";

const Photos = ({ photos }) => {
  if (!photos) {
    return null;
  }

  return (
    <section className="Photos">
      <div className="row g-3">
        {photos.map((photo, index) => (
          <div className="col-4" key={index}>
            <a href={photo.src.original} target="_blank" rel="noreferrer">
              <img
                src={photo.src.landscape}
                className="img-fluid"
                alt="related"
              />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Photos;
