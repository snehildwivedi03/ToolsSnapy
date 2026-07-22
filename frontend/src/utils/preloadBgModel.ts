/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
// Best-effort, one-time prefetch of the AI background-removal model.
//
// Called once when the app loads (any page). It spins up a short-lived worker
// that downloads and caches the model assets in the background. If the user
// never opens the Background Remover, nothing else happens — the assets simply
// sit in the browser cache. If they do, removal starts instantly.

let started = false;

export function preloadBgModel(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const run = () => {
    try {
      const worker = new Worker(
        new URL("../pages/Images/tools/bgPreloadWorker.ts", import.meta.url),
        { type: "module" },
      );
      // The worker only needs to run long enough to fill the cache, then it can go.
      worker.onmessage = () => worker.terminate();
      worker.onerror = () => worker.terminate();
    } catch {
      // Prefetch is purely an optimization — never let it surface an error.
    }
  };

  // Wait for the browser to be idle so we never compete with the initial render
  // or whatever tool the user actually came for.
  const ric = (window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void;
  }).requestIdleCallback;

  if (typeof ric === "function") {
    ric(run, { timeout: 5000 });
  } else {
    setTimeout(run, 2000);
  }
}
