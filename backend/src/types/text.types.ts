// All shared types for the Text Tools module

export const CASE_TYPES = [
  "uppercase",
  "lowercase",
  "sentencecase",
  "titlecase",
  "togglecase",
  "camelcase",
  "pascalcase",
  "snakecase",
  "screamingsnakecase",
  "kebabcase",
  "traincase",
  "dotcase",
] as const;

export type CaseType = (typeof CASE_TYPES)[number];

export interface WordCountResult {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readingTime: number; // seconds, based on 200 wpm
}

export interface CharCountResult {
  characters: number;
  charactersNoSpaces: number;
  letters: number;
  digits: number;
  whitespace: number;
}

export interface CaseConverterResult {
  result: string;
}

export interface JsonFormatterResult {
  formattedJson: string;
}

export interface JsonValidatorResult {
  valid: boolean;
  error?: string;
  line?: number;
}

export interface RandomParagraphResult {
  paragraphs: string[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}
