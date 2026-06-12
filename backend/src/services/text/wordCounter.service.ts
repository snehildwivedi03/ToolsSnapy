import type { WordCountResult } from "../../types/text.types.js";

export function countText(text: string): WordCountResult {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      words: 0,
      characters: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: 0,
    };
  }

  const words = trimmed
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const characters = text.length;

  // Count sentence-ending punctuation marks
  const sentenceMatches = trimmed.match(/[.!?]+/g);
  const sentences =
    sentenceMatches !== null ? sentenceMatches.length : 1;

  // Paragraphs are blocks separated by one or more blank lines
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;

  // Average reading speed: 200 words per minute
  const readingTime = Math.max(1, Math.ceil((words / 200) * 60));

  return { words, characters, sentences, paragraphs, readingTime };
}
