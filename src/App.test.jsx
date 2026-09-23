import { render, screen } from "@testing-library/react";
import App from "./App";
import {
  normalizeWiktionaryResponse,
  normalizeFreeDictionaryResponse,
  extractPronunciationText,
} from "./components/Dictionary";

test("renders app heading", () => {
  render(<App />);
  expect(screen.getByText(/what word piques your interest/i)).toBeInTheDocument();
});

test("extracts pronunciation text from raw Wiktionary source", () => {
  const raw = `===Pronunciation===\n* {{IPA|en|/iːsˈθɛ.tɪk/|key}}\n===Adjective===`;

  expect(extractPronunciationText(raw)).toBe("/iːsˈθɛ.tɪk/");
});

test("normalizes Wikimedia Wiktionary payload into app-friendly data", () => {
  const payload = {
    en: [
      {
        partOfSpeech: "Noun",
        language: "English",
        definitions: [
          {
            definition: "<span>A fruit with seeds.</span>",
            parsedExamples: [{ example: "<i>apple</i> is sweet" }],
          },
        ],
      },
    ],
  };

  const normalized = normalizeWiktionaryResponse(
    "apple",
    payload,
    [{ title: "File:apple.wav", type: "audio" }],
    "/ˈæp.əl/",
  );

  expect(normalized).not.toBeNull();
  expect(normalized.word).toBe("apple");
  expect(normalized.meanings[0].partOfSpeech).toBe("Noun");
  expect(normalized.meanings[0].definitions[0].definition).toBe("A fruit with seeds.");
  expect(normalized.phonetics[0].text).toBe("/ˈæp.əl/");
  expect(normalized.phonetics[0].audio).toContain("apple.wav");
});

test("normalizes free dictionary payload into app-friendly data", () => {
  const payload = {
    word: "hello",
    entries: [
      {
        partOfSpeech: "interjection",
        pronunciations: [
          { text: "/həˈloʊ/", audio: "https://example.com/hello.mp3" },
          { text: "/hɛˈloʊ/", audio: "https://example.com/hello-alt.mp3" },
        ],
        senses: [
          {
            definition: "A greeting (salutation) said when meeting someone.",
            examples: ["Hello, everyone."],
            synonyms: ["hi", "hey"],
            antonyms: ["bye"],
          },
        ],
      },
    ],
  };

  const normalized = normalizeFreeDictionaryResponse("hello", payload);

  expect(normalized).not.toBeNull();
  expect(normalized.word).toBe("hello");
  expect(normalized.phonetics).toHaveLength(1);
  expect(normalized.phonetics[0].text).toBe("/həˈloʊ/");
  expect(normalized.phonetics[0].audio).toBe("https://example.com/hello.mp3");
  expect(normalized.meanings[0].definitions[0].definition).toBe(
    "A greeting (salutation) said when meeting someone.",
  );
  expect(normalized.meanings[0].definitions[0].synonyms).toEqual(["hi", "hey"]);
  expect(normalized.meanings[0].definitions[0].antonyms).toEqual(["bye"]);
});

test("deduplicates repeated part-of-speech sections", () => {
  const payload = {
    word: "cat",
    entries: [
      {
        partOfSpeech: "noun",
        pronunciations: [{ text: "/kæt/" }],
        senses: [{ definition: "A small domesticated feline." }],
      },
      {
        partOfSpeech: "noun",
        pronunciations: [{ text: "/kæt/" }],
        senses: [{ definition: "A small domesticated feline." }],
      },
      {
        partOfSpeech: "verb",
        pronunciations: [{ text: "/kæt/" }],
        senses: [{ definition: "To vomit." }],
      },
      {
        partOfSpeech: "adjective",
        pronunciations: [{ text: "/kæt/" }],
        senses: [{ definition: "Descriptive of something cunning." }],
      },
    ],
  };

  const normalized = normalizeFreeDictionaryResponse("cat", payload);

  expect(normalized.meanings.map((meaning) => meaning.partOfSpeech)).toEqual([
    "noun",
    "verb",
    "adjective",
  ]);
  expect(normalized.meanings[0].definitions).toHaveLength(1);
});
