import axios from "axios";

// All requests use the Vite proxy (/api → http://localhost:5000)
const api = axios.create({ baseURL: "/api" });

// ── Response shape types ─────────────────────────────────
export interface WordCountData {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
}

export interface CharCountData {
  characters: number;
  charactersNoSpaces: number;
  letters: number;
  digits: number;
  whitespace: number;
}

export type CaseType =
  | "uppercase"
  | "lowercase"
  | "sentencecase"
  | "titlecase"
  | "togglecase"
  | "camelcase"
  | "pascalcase"
  | "snakecase"
  | "screamingsnakecase"
  | "kebabcase"
  | "traincase"
  | "dotcase";

export interface CaseConverterData {
  result: string;
}

export interface JsonFormatterData {
  formattedJson: string;
}

export interface JsonValidatorData {
  valid: boolean;
  error?: string;
  line?: number;
}

export interface RandomParagraphData {
  paragraphs: string[];
}

interface ApiOk<T> {
  success: true;
  data: T;
}

// ── API calls ────────────────────────────────────────────

export const wordCountApi = (text: string) =>
  api.post<ApiOk<WordCountData>>("/text/word-counter", { text });

export const characterCountApi = (text: string) =>
  api.post<ApiOk<CharCountData>>("/text/character-counter", { text });

export const caseConverterApi = (
  text: string,
  caseType: CaseType,
) =>
  api.post<ApiOk<CaseConverterData>>("/text/case-converter", {
    text,
    caseType,
  });

export const jsonFormatterApi = (text: string, indent: 2 | 4) =>
  api.post<ApiOk<JsonFormatterData>>("/text/json-formatter", {
    text,
    indent,
  });

export const jsonValidatorApi = (text: string) =>
  api.post<ApiOk<JsonValidatorData>>("/text/json-validator", {
    text,
  });

export const randomParagraphApi = (count: number) =>
  api.post<ApiOk<RandomParagraphData>>("/text/random-paragraph", {
    count,
  });

// ── Shared error helper ──────────────────────────────────
export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string } | undefined)
      ?.error;
    if (msg) return msg;
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
