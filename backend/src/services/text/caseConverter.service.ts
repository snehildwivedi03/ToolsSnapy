/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import type {
  CaseType,
  CaseConverterResult,
} from "../../types/text.types.js";

// Split text into words, handling camelCase, snake_case, and kebab-case
function extractWords(text: string): string[] {
  return text
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → words
    .split(/[\s\-_]+/)
    .filter((w) => w.length > 0);
}

function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
  );
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

function toCamelCase(text: string): string {
  const words = extractWords(text);
  return words
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");
}

function toPascalCase(text: string): string {
  return extractWords(text)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function toSnakeCase(text: string): string {
  return extractWords(text)
    .map((w) => w.toLowerCase())
    .join("_");
}

function toKebabCase(text: string): string {
  return extractWords(text)
    .map((w) => w.toLowerCase())
    .join("-");
}

function toToggleCase(text: string): string {
  return text
    .split("")
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

function toScreamingSnakeCase(text: string): string {
  return extractWords(text)
    .map((w) => w.toUpperCase())
    .join("_");
}

function toTrainCase(text: string): string {
  return extractWords(text)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("-");
}

function toDotCase(text: string): string {
  return extractWords(text)
    .map((w) => w.toLowerCase())
    .join(".");
}

export function convertCase(
  text: string,
  caseType: CaseType,
): CaseConverterResult {
  const converters: Record<CaseType, (t: string) => string> = {
    uppercase: (t) => t.toUpperCase(),
    lowercase: (t) => t.toLowerCase(),
    sentencecase: toSentenceCase,
    titlecase: toTitleCase,
    togglecase: toToggleCase,
    camelcase: toCamelCase,
    pascalcase: toPascalCase,
    snakecase: toSnakeCase,
    screamingsnakecase: toScreamingSnakeCase,
    kebabcase: toKebabCase,
    traincase: toTrainCase,
    dotcase: toDotCase,
  };

  const fn = converters[caseType];
  return { result: fn(text) };
}
