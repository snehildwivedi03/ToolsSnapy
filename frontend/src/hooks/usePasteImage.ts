import { useEffect, useRef } from "react";

/**
 * Global "paste an image" support.
 *
 * Listens for clipboard paste (Ctrl/Cmd + V) anywhere on the page and, when the
 * clipboard holds one or more images, hands the resulting File(s) to `onImages`.
 *
 * - Pasting is ignored while a text input, textarea or contenteditable element is
 *   focused, so it never hijacks normal text pasting.
 * - Clipboard images are usually unnamed ("image.png"); they get a timestamped
 *   name so downloads/shares don't all collide.
 *
 * @param onImages  Called with the pasted image File(s).
 * @param enabled   When false the listener is not attached (default true).
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

    const handler = (e: ClipboardEvent) => {
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.kind === "file" && item.type.startsWith("image/")) {
          const raw = item.getAsFile();
          if (raw) {
            const named =
              raw.name && raw.name !== "image.png"
                ? raw
                : new File(
                    [raw],
                    `pasted-${Date.now()}.${(raw.type.split("/")[1] || "png").replace("+xml", "")}`,
                    { type: raw.type },
                  );
            files.push(named);
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        cb.current(files);
      }
    };

    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [enabled]);
}
