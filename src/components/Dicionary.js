import React, { useState, useEffect } from "react";
import axios from "axios";
import Results from "./Results";
import Photos from "./Photos";
import "../styles/Dictionary.css";

export default function Dictionary(props) {
  const [keyword, setKeyword] = useState(props.defaultKeyword);
  const [results, setResults] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    search();
  }, []);

  function handlePexelsResponse(response) {
    setPhotos(response.data.photos);
  }

  function handleDictionaryResponse(response) {
    setResults(response.data[0]);
  }

  function handleKeywordChange(event) {
    setKeyword(event.target.value);
  }

  function search() {
    const dictionaryApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;
    const pexelsApiKey = "GoBQqPHxl4GB3PQJ8lbBFmL30GMsnWjIuY5AyCq7EbiqtF0zsyL8Pxru";
    const pexelsApiUrl = `https://api.pexels.com/v1/search?query=${keyword}&per_page=9`;
    const pexelsApiHeaders = { Authorization: pexelsApiKey };

    axios.get(dictionaryApiUrl).then(handleDictionaryResponse);
    axios.get(pexelsApiUrl, { headers: pexelsApiHeaders }).then(handlePexelsResponse);
  }

  function handleSubmit(event) {
    event.preventDefault();
    search();
  }

  useEffect(() => {
    if (loaded) {
      search();
    }
  }, [loaded]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="Dictionary">
      {loaded ? (
        <section>
          <div className="subheading">What word piques your interest?</div>
          <form onSubmit={handleSubmit}>
            <input
              className="search"
              type="search"
              onChange={handleKeywordChange}
              placeholder={props.defaultKeyword}
            />
            <input
              type="submit"
              value="Search"
              className="search-button"
              onClick={handleSubmit}
            />
          </form>
          <div className="suggestions">
            Suggested concepts: biodiversity, quantum mechanics, sustainability...
          </div>
        </section>
      ) : (
        "Searching..."
      )}
      {results && <Results results={results} />}
      {photos && <Photos photos={photos} />}
    </div>
  );
}
