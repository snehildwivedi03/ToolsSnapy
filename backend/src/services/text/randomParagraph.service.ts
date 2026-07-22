/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import type { RandomParagraphResult } from "../../types/text.types.js";

// Classic opening paragraph   always used when startWithClassic is true
const CLASSIC =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, " +
  "sed do eiusmod tempor incididunt ut labore et dolore magna " +
  "aliqua. Ut enim ad minim veniam, quis nostrud exercitation " +
  "ullamco laboris nisi ut aliquip ex ea commodo consequat. " +
  "Duis aute irure dolor in reprehenderit in voluptate velit " +
  "esse cillum dolore eu fugiat nulla pariatur. Excepteur sint " +
  "occaecat cupidatat non proident, sunt in culpa qui officia " +
  "deserunt mollit anim id est laborum.";

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
  "adipiscing", "elit", "sed", "eiusmod", "tempor", "incididunt",
  "labore", "dolore", "magna", "aliqua", "enim", "veniam",
  "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "commodo", "consequat", "duis", "aute", "irure",
  "reprehenderit", "voluptate", "velit", "esse", "cillum",
  "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
  "cupidatat", "proident", "culpa", "officia", "deserunt",
  "mollit", "anim", "laborum", "vero", "eos", "accusamus",
  "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
  "praesentium", "voluptatum", "deleniti", "atque", "corrupti",
  "dolores", "molestias", "excepturi", "occaecati", "cupiditate",
  "similique", "mollitia", "animi", "perspiciatis", "omnis",
  "natus", "error", "voluptatem", "laudantium", "totam",
  "aperiam", "eaque", "ipsa", "inventore", "veritatis",
  "beatae", "vitae", "dicta", "explicabo", "nemo", "ipsam",
  "voluptas", "aspernatur", "fugit", "consequuntur", "magni",
  "sequi", "nesciunt", "neque", "porro", "quisquam", "dolorem",
  "adipisci", "provident", "at", "accusantium", "doloremque",
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWord(): string {
  const idx = randInt(0, WORDS.length - 1);
  return WORDS[idx] ?? "lorem";
}

function makeSentence(): string {
  const count = randInt(8, 16);
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(randomWord());
  }
  const raw = words.join(" ");
  return raw.charAt(0).toUpperCase() + raw.slice(1) + ".";
}

function makeParagraph(): string {
  const sentences: string[] = [];
  const count = randInt(3, 6);
  for (let i = 0; i < count; i++) {
    sentences.push(makeSentence());
  }
  return sentences.join(" ");
}

export function generateParagraphs(
  count: number,
): RandomParagraphResult {
  const paragraphs: string[] = [];

  for (let i = 0; i < count; i++) {
    // Always start with the classic Lorem Ipsum paragraph
    paragraphs.push(i === 0 ? CLASSIC : makeParagraph());
  }

  return { paragraphs };
}
