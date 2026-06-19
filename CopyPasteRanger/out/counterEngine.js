"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounterEngine = void 0;
const KEY_COPIES = "ctrlVChronicles.copyCount";
const KEY_PASTES = "ctrlVChronicles.pasteCount";
class CounterEngine {
    state;
    copyCount;
    pasteCount;
    constructor(state) {
        this.state = state;
        this.copyCount = state.get(KEY_COPIES, 0);
        this.pasteCount = state.get(KEY_PASTES, 0);
    }
    /** Increments the copy counter, persists it, and returns updated stats. */
    incrementCopies() {
        this.copyCount++;
        void this.state.update(KEY_COPIES, this.copyCount);
        return this.getStats();
    }
    /** Increments the paste counter, persists it, and returns updated stats. */
    incrementPastes() {
        this.pasteCount++;
        void this.state.update(KEY_PASTES, this.pasteCount);
        return this.getStats();
    }
    /** Resets both counters to zero and removes persisted values. */
    reset() {
        this.copyCount = 0;
        this.pasteCount = 0;
        void this.state.update(KEY_COPIES, 0);
        void this.state.update(KEY_PASTES, 0);
    }
    /** Returns a snapshot of the current counters. */
    getStats() {
        return {
            copyCount: this.copyCount,
            pasteCount: this.pasteCount,
        };
    }
}
exports.CounterEngine = CounterEngine;
//# sourceMappingURL=counterEngine.js.map