import React, { useState, useEffect } from "react";
import axios from "axios";
import Results from "./Results";
import Photos from "./Photos";
import PropTypes from "prop-types";
import "../styles/Dictionary.css";

const stripHtml = (html = "") => {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

const getWiktionaryAudioUrl = (audioItem) => {
  if (!audioItem || !audioItem.title) {
    return "";
  }

  const fileName = audioItem.title.replace(/^File:/i, "").trim();
  if (!fileName) {
    return "";
  }

  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;
};

const pickFirstAudioUrl = (mediaItems = []) => {
  const audioItem = (mediaItems || []).find(
    (item) => item && item.type === "audio" && item.title,
  );

  return audioItem ? getWiktionaryAudioUrl(audioItem) : "";
};

const normalizeDefinitionEntry = (definitionItem) => {
  if (!definitionItem) {
    return null;
  }

  const rawDefinition =
    typeof definitionItem === "string" ? definitionItem : definitionItem?.definition || "";
  const cleanedDefinition = stripHtml(rawDefinition);
  if (!cleanedDefinition) {
    return null;
  }

  const exampleSource =
    typeof definitionItem === "string"
      ? ""
      : definitionItem?.parsedExamples?.[0]?.example || definitionItem?.examples?.[0] || "";

  return {
    definition: cleanedDefinition,
    example: stripHtml(exampleSource),
    synonyms: [],
    antonyms: [],
  };
};

export const extractPronunciationText = (rawWiktionaryText = "") => {
  if (!rawWiktionaryText) {
    return "";
  }

  const pronunciationSectionMatch = rawWiktionaryText.match(
    /===+\s*Pronunciation\s*===+([\s\S]*?)(?:\n===+\s*|$)/i,
  );

  const sectionText = pronunciationSectionMatch ? pronunciationSectionMatch[1] : rawWiktionaryText;

  const ipaMatches = [
    ...sectionText.matchAll(/\{\{\s*IPA\s*\|[^}|]+\|([^}|]+)\}/gi),
    ...sectionText.matchAll(/\{\{\s*IPAc-en\s*\|([^}|]+)\}/gi),
    ...sectionText.matchAll(/\{\{\s*audio\s*\|[^|]+\|([^}|]+)\}\}/gi),
    ...sectionText.matchAll(/\{\{\s*rfp\s*\|[^}|]+\|([^}|]+)\}\}/gi),
  ];

  for (const match of ipaMatches) {
    const value = stripHtml(match[1] || "").trim();
    if (value) {
      return value;
    }
  }

  const slashMatches = [...sectionText.matchAll(/\/[^/\n]+\//g)];
  if (slashMatches.length > 0) {
    const value = stripHtml(slashMatches[0][0]).trim();
    if (value) {
      return value;
    }
  }

  const genericPronunciationMatch = sectionText.match(/\b(?:[A-Za-z0-9\-\s]*\/[A-Za-z0-9\-\s'.,:]+\/)/);
  if (genericPronunciationMatch) {
    return stripHtml(genericPronunciationMatch[0]).trim();
  }

  return "";
};

export const normalizeWiktionaryResponse = (
  word,
  definitionData,
  mediaItems = [],
  pronunciationText = "",
) => {
  if (!definitionData || typeof definitionData !== "object") {
    return null;
  }

  const englishEntries = Array.isArray(definitionData.en)
    ? definitionData.en
    : Object.values(definitionData).flat();

  const meaningfulEntries = englishEntries.filter(
    (entry) => entry && typeof entry === "object" && Array.isArray(entry.definitions),
  );

  if (meaningfulEntries.length === 0) {
    return null;
  }

  const meanings = meaningfulEntries.map((entry) => ({
    partOfSpeech: entry.partOfSpeech || "Word",
    definitions: (entry.definitions || [])
      .map(normalizeDefinitionEntry)
      .filter(Boolean),
    synonyms: [],
    antonyms: [],
  }));

  const audioUrl = pickFirstAudioUrl(mediaItems);
  const computedPronunciation = pronunciationText || "";

  return {
    word,
    phonetics: [
      {
        text: computedPronunciation,
        audio: audioUrl,
      },
    ].filter((phonetic) => phonetic.text || phonetic.audio),
    meanings,
  };
};

export const normalizeFreeDictionaryResponse = (word, payload = [], mediaItems = []) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const entryList = Array.isArray(payload.entries)
    ? payload.entries
    : Array.isArray(payload)
      ? payload
      : [payload];

  if (entryList.length === 0) {
    return null;
  }

  const firstEntryPronunciations = (() => {
    const firstEntry = entryList[0] || {};
    const phonetics = Array.isArray(firstEntry?.pronunciations)
      ? firstEntry.pronunciations
      : Array.isArray(firstEntry?.phonetics)
        ? firstEntry.phonetics
        : [];

    return phonetics.filter((item) => item && (item.text || item.audio || item.url || item.ogg));
  })();

  const primaryPronunciation = (() => {
    const nextItem = firstEntryPronunciations.find((item) => item?.text || item?.audio || item?.url || item?.ogg) || null;
    if (!nextItem) {
      return null;
    }

    const fallbackAudio = pickFirstAudioUrl(mediaItems);

    return {
      text: stripHtml(nextItem.text || nextItem.phonetic || ""),
      audio: nextItem.audio || nextItem.url || nextItem.ogg || fallbackAudio || "",
    };
  })();

  const partOfSpeechOrder = {
    noun: 0,
    verb: 1,
    adjective: 2,
    adverb: 3,
    pronoun: 4,
    interjection: 5,
    preposition: 6,
    conjunction: 7,
    determiner: 8,
    numeral: 9,
    article: 10,
  };

  const groupedMeaningMap = new Map();

  entryList.forEach((entry) => {
    const partOfSpeech = (entry?.partOfSpeech || entry?.part_of_speech || "Word").trim();
    const key = partOfSpeech || "Word";

    if (!groupedMeaningMap.has(key)) {
      groupedMeaningMap.set(key, {
        partOfSpeech: key,
        definitions: [],
        synonyms: new Set(),
        antonyms: new Set(),
      });
    }

    const bucket = groupedMeaningMap.get(key);
    const rawSenses = Array.isArray(entry?.senses)
      ? entry.senses
      : Array.isArray(entry?.meanings)
        ? entry.meanings
        : [];

    rawSenses.forEach((sense) => {
      const definition = stripHtml(sense?.definition || sense?.shortdef || "");
      const example = stripHtml(sense?.examples?.[0] || sense?.example || "");

      if (definition) {
        const existing = bucket.definitions.some((item) => item.definition === definition);
        if (!existing) {
          bucket.definitions.push({
            definition,
            example,
            synonyms: [...new Set((Array.isArray(sense?.synonyms) ? sense.synonyms : []).map((item) => stripHtml(item)))],
            antonyms: [...new Set((Array.isArray(sense?.antonyms) ? sense.antonyms : []).map((item) => stripHtml(item)))],
          });
        }
      }

      (Array.isArray(sense?.synonyms) ? sense.synonyms : []).forEach((item) => {
        if (item) bucket.synonyms.add(stripHtml(item));
      });
      (Array.isArray(sense?.antonyms) ? sense.antonyms : []).forEach((item) => {
        if (item) bucket.antonyms.add(stripHtml(item));
      });
    });

    (Array.isArray(entry?.synonyms) ? entry.synonyms : []).forEach((item) => {
      if (item) bucket.synonyms.add(stripHtml(item));
    });
    (Array.isArray(entry?.antonyms) ? entry.antonyms : []).forEach((item) => {
      if (item) bucket.antonyms.add(stripHtml(item));
    });
  });

  const meanings = [...groupedMeaningMap.values()]
    .map((meaning) => ({
      ...meaning,
      definitions: meaning.definitions.filter(Boolean),
      synonyms: [...meaning.synonyms],
      antonyms: [...meaning.antonyms],
    }))
    .sort((a, b) => {
      const aOrder = partOfSpeechOrder[a.partOfSpeech?.toLowerCase()] ?? 999;
      const bOrder = partOfSpeechOrder[b.partOfSpeech?.toLowerCase()] ?? 999;
      return aOrder - bOrder;
    });

  return {
    word: word || payload?.word || (entryList[0] && entryList[0].word) || "",
    phonetics: primaryPronunciation && (primaryPronunciation.text || primaryPronunciation.audio)
      ? [primaryPronunciation]
      : [],
    meanings: meanings.length > 0 ? meanings : [{
      partOfSpeech: "Word",
      definitions: [{
        definition: "No definition available.",
        example: "",
        synonyms: [],
        antonyms: [],
      }],
      synonyms: [],
      antonyms: [],
    }],
  };
};

const fetchWithRetry = async (url, config, retries = 1, delayMs = 1200) => {
  try {
    return await axios.get(url, config);
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fetchWithRetry(url, config, retries - 1, delayMs);
    }
    throw error;
  }
};

const fetchDatamuseRelatedWords = async (keyword, relation) => {
  try {
    const response = await axios.get(
      `https://api.datamuse.com/words?rel_${relation}=${encodeURIComponent(keyword)}&max=10`,
    );
    return (response.data || []).map((item) => item.word).filter(Boolean);
  } catch (error) {
    console.error(`Error fetching ${relation} data:`, error);
    return [];
  }
};

const fetchFreeDictionaryData = async (keyword) => {
  const urls = [
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(keyword)}`,
    `https://freedictionaryapi.com/api/v1/entries/en/${encodeURIComponent(keyword)}`,
  ];

  const requests = urls.map(async (url) => {
    const response = await fetchWithRetry(url);
    if (response?.data) {
      return response.data;
    }
    return null;
  });

  const settled = await Promise.any(requests).catch((error) => {
    console.warn("Dictionary API unavailable:", error);
    throw new Error("Unable to fetch dictionary data");
  });

  return settled;
};

const fetchWiktionaryMediaData = async (keyword) => {
  try {
    const response = await fetchWithRetry(
      `https://en.wiktionary.org/api/rest_v1/page/media-list/${encodeURIComponent(keyword)}`,
    );
    return response?.data?.items || [];
  } catch (error) {
    console.warn("Wiktionary media fallback unavailable:", error);
    return [];
  }
};

const Dictionary = ({ defaultKeyword }) => {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [results, setResults] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const search = async () => {
      setStatus("loading");
      setResults(null);

      const encodedKeyword = encodeURIComponent(keyword.trim());
      if (!encodedKeyword) {
        setStatus("not-found");
        return;
      }

      try {
        const [dictionaryData, mediaItems, synonyms, antonyms] = await Promise.all([
          fetchFreeDictionaryData(keyword),
          fetchWiktionaryMediaData(keyword),
          fetchDatamuseRelatedWords(keyword, "syn"),
          fetchDatamuseRelatedWords(keyword, "ant"),
        ]);

        const normalized = normalizeFreeDictionaryResponse(keyword, dictionaryData, mediaItems);

        if (!normalized) {
          setStatus("not-found");
          setPhotos(null);
          return;
        }

        normalized.meanings = normalized.meanings.map((meaning) => ({
          ...meaning,
          synonyms: [...new Set([...(meaning.synonyms || []), ...synonyms.slice(0, 6)])],
          antonyms: [...new Set([...(meaning.antonyms || []), ...antonyms.slice(0, 6)])],
        }));

        setResults(normalized);
        setStatus("idle");
      } catch (error) {
        console.error("Error fetching dictionary data:", error);
        setStatus("error");
      }

      try {
        const pexelsApiKey = process.env.REACT_APP_PEXELS_API_KEY;
        if (!pexelsApiKey) {
          setPhotos(null);
          return;
        }

        const pexelsApiUrl = `https://api.pexels.com/v1/search?query=${keyword}&per_page=9`;
        const photosResponse = await axios.get(pexelsApiUrl, {
          headers: { Authorization: pexelsApiKey },
        });
        setPhotos(photosResponse.data.photos);
      } catch (error) {
        console.error("Error fetching photos:", error);
        setPhotos(null);
      }
    };

    if (!loaded) {
      search();
      setLoaded(true);
    }
  }, [keyword, loaded]);

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoaded(false);
  };

  const isLoading = status === "loading";

  return (
    <div className="Dictionary">
      <section aria-labelledby="dictionary-title">
        <div className="subheading" id="dictionary-title">What word piques your interest?</div>
        <form onSubmit={handleSubmit} role="search" aria-label="Dictionary search form">
          <label className="sr-only" htmlFor="dictionary-search">
            Search for a word
          </label>
          <input
            id="dictionary-search"
            className="search"
            type="search"
            name="keyword"
            onChange={handleKeywordChange}
            placeholder={defaultKeyword}
            aria-label="Search for a word"
            aria-describedby="search-suggestions"
            aria-invalid={status === "error" || status === "not-found" ? "true" : "false"}
          />
          <input
            type="submit"
            value={isLoading ? "Searching..." : "Search"}
            className="search-button"
            disabled={isLoading}
            aria-label={isLoading ? "Searching for a word" : "Search for a word"}
          />
        </form>
        <div className="suggestions" id="search-suggestions">
          Suggested concepts: cat, tree, code, sun...
        </div>
      </section>

      {status === "loading" && (
        <p className="status-message status-message--loading" role="status" aria-live="polite" aria-atomic="true">
          Looking that up...
        </p>
      )}
      {status === "not-found" && (
        <p className="status-message status-message--warning" role="alert" aria-live="assertive" aria-atomic="true">
          Couldn't find "{keyword}" — check the spelling and try again.
        </p>
      )}
      {status === "error" && (
        <p className="status-message status-message--error" role="alert" aria-live="assertive" aria-atomic="true">
          The dictionary service isn't responding right now. Please try again in a moment.
        </p>
      )}

      {results && <Results results={results} />}
      {photos && <Photos photos={photos} />}
    </div>
  );
};

Dictionary.propTypes = {
  defaultKeyword: PropTypes.string.isRequired,
};

export default Dictionary;