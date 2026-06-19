/**
 * counterEngine.ts
 *
 * Manages persistent copy/paste counters via VS Code's globalState (Memento).
 * All data is scoped under the "ctrlVChronicles" namespace to avoid key
 * collisions with other extensions.
 */
import * as vscode from "vscode";

const KEY_COPIES = "ctrlVChronicles.copyCount";
const KEY_PASTES = "ctrlVChronicles.pasteCount";

export interface Stats {
  copyCount: number;
  pasteCount: number;
}

export class CounterEngine {
  private copyCount: number;
  private pasteCount: number;

  constructor(private readonly state: vscode.Memento) {
    this.copyCount = state.get<number>(KEY_COPIES, 0);
    this.pasteCount = state.get<number>(KEY_PASTES, 0);
  }

  /** Increments the copy counter, persists it, and returns updated stats. */
  incrementCopies(): Stats {
    this.copyCount++;
    void this.state.update(KEY_COPIES, this.copyCount);
    return this.getStats();
  }

  /** Increments the paste counter, persists it, and returns updated stats. */
  incrementPastes(): Stats {
    this.pasteCount++;
    void this.state.update(KEY_PASTES, this.pasteCount);
    return this.getStats();
  }

  /** Resets both counters to zero and removes persisted values. */
  reset(): void {
    this.copyCount = 0;
    this.pasteCount = 0;
    void this.state.update(KEY_COPIES, 0);
    void this.state.update(KEY_PASTES, 0);
  }

  /** Returns a snapshot of the current counters. */
  getStats(): Stats {
    return {
      copyCount: this.copyCount,
      pasteCount: this.pasteCount,
    };
  }
}
