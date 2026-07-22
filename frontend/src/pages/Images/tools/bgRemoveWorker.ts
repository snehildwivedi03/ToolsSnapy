/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
/// <reference lib="webworker" />
import { removeBackground, type Config } from "@imgly/background-removal";

/** Message sent from the UI thread to kick off background removal. */
export interface BgRemoveRequest {
  file: File;
  config: Config;
}

/** Messages posted back to the UI thread. */
export type BgRemoveResponse =
  | { type: "progress"; key: string; current: number; total: number }
  | { type: "done"; blob: Blob }
  | { type: "error"; message: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener("message", (e: MessageEvent<BgRemoveRequest>) => {
  const { file, config } = e.data;

  // Run the heavy ONNX inference here, off the main thread, so the page UI
  // (animations, progress bar) stays perfectly smooth while it works.
  void removeBackground(file, {
    ...config,
    progress: (key, current, total) => {
      ctx.postMessage({ type: "progress", key, current, total } satisfies BgRemoveResponse);
    },
  })
    .then((blob) => {
      ctx.postMessage({ type: "done", blob } satisfies BgRemoveResponse);
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Background removal failed.";
      ctx.postMessage({ type: "error", message } satisfies BgRemoveResponse);
    });
});
