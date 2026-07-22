/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useEffect, useRef } from "react";

/**
 * Global "paste an image" support.
 *
 * On Ctrl/Cmd + V (anywhere except while typing in a field) this asks the
 * browser for clipboard access via the async Clipboard API  which shows the
 * native "wants to access the clipboard" permission prompt  and, when the
 * clipboard holds image(s), hands the resulting File(s) to `onImages`.
 *
 * Falls back to the classic `paste` event on browsers without `clipboard.read`.
 * Clipboard images are usually unnamed, so they get a timestamped filename.
 *
 * @param onImages  Called with the pasted image File(s).
 * @param enabled   When false the listeners are not attached (default true).
 */
export function usePasteImage(
  onImages: (files: File[]) => void,
  enabled = true,
): void {
  const cb = useRef(onImages);
  useEffect(() => {
    cb.current = onImages;
  }, [onImages]);

  useEffect(() => {
    if (!enabled) return;

    const isEditable = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      );
    };

    const toNamedFile = (blob: Blob): File => {
      const ext = (blob.type.split("/")[1] || "png").replace("+xml", "");
      return new File([blob], `pasted-${Date.now()}.${ext}`, { type: blob.type });
    };

    const supportsAsyncRead =
      typeof navigator !== "undefined" &&
      !!navigator.clipboard &&
      typeof navigator.clipboard.read === "function";

    let handling = false;

    // Primary path: the async Clipboard API. Reading the clipboard triggers the
    // browser's "wants to access the clipboard" permission prompt on Ctrl/Cmd+V.
    const onKeyDown = (e: KeyboardEvent) => {
      if (!supportsAsyncRead) return;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "v") return;
      if (isEditable() || handling) return;

      handling = true;
      void navigator.clipboard
        .read()
        .then(async (items) => {
          const files: File[] = [];
          for (const item of items) {
            const imageType = item.types.find((t) => t.startsWith("image/"));
            if (imageType) {
              const blob = await item.getType(imageType);
              files.push(toNamedFile(blob));
            }
          }
          if (files.length > 0) cb.current(files);
        })
        .catch(() => {
          /* permission denied or nothing usable  ignore */
        })
        .finally(() => {
          handling = false;
        });
    };

    // Fallback path: the classic paste event, for browsers that lack
    // clipboard.read (e.g. some Firefox configs). No prompt, but still works.
    const onPaste = (e: ClipboardEvent) => {
      if (supportsAsyncRead) return; // handled by the keydown path above
      if (isEditable()) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.kind === "file" && item.type.startsWith("image/")) {
          const raw = item.getAsFile();
          if (raw) {
            files.push(raw.name && raw.name !== "image.png" ? raw : toNamedFile(raw));
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        cb.current(files);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("paste", onPaste);
    };
  }, [enabled]);
}
