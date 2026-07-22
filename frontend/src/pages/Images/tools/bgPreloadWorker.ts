/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
/// <reference lib="webworker" />
import { preload, type Config } from "@imgly/background-removal";

// Warm the background-removal model cache in the background. This downloads and
// caches the ONNX model + wasm the first time so that, when the user actually
// opens the Background Remover, inference starts instantly. It runs in a worker
// so the main thread (and every other tool) stays perfectly responsive.
const ctx = self as unknown as DedicatedWorkerGlobalScope;

// Must match the config used by bgRemoveWorker.ts so the cached assets are reused.
const config: Config = { model: "isnet", output: { format: "image/png", quality: 1 } };

preload(config)
  .then(() => ctx.postMessage({ type: "ready" }))
  .catch(() => ctx.postMessage({ type: "error" }));
