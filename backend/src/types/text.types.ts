/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
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

export interface JsonIssue {
  line: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
}

export interface JsonValidatorResult {
  valid: boolean;
  issues: JsonIssue[];
}

export interface JsonRepairResult {
  valid: boolean;
  repairedJson: string;
  fixes: string[];
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
