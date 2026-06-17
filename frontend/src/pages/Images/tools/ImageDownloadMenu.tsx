import { useEffect, useRef, useState } from "react";
import s from "../../../styles/calc.module.css";
import ls from "./imageTools.module.css";
import { convertImageBlob, downloadBlob } from "./imageUtils";

export interface DownloadFormat {
  type: "image/png" | "image/jpeg" | "image/webp";
  ext: "png" | "jpg" | "webp";
  label: string;
}

interface Props {
  /** The result blob to download. */
  blob: Blob;
  /** Filename without extension. */
  baseFilename: string;
  /** The format `blob` is already encoded in (downloaded as-is, no re-encode). */
  nativeType: DownloadFormat["type"];
  /** Formats offered in the menu. The first entry is the primary download. */
  formats: DownloadFormat[];
  /** Background colour used when flattening to JPEG. Defaults to white. */
  background?: string;
}

/** Split download button: primary format + a menu of alternative formats. */
const ImageDownloadMenu = ({ blob, baseFilename, nativeType, formats, background }: Props) => {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const download = async (fmt: DownloadFormat) => {
    setOpen(false);
    const filename = `${baseFilename}.${fmt.ext}`;
    if (fmt.type === nativeType) {
      downloadBlob(blob, filename);
      return;
    }
    try {
      setWorking(true);
      const converted = await convertImageBlob(blob, fmt.type, { background });
      downloadBlob(converted, filename);
    } finally {
      setWorking(false);
    }
  };

  const primary = formats[0];

  return (
    <div className={ls.dlMenu} ref={wrapRef}>
      <div className={ls.dlSplit}>
        <button
          type="button"
          className={`${s.calcBtn} ${ls.dlMain}`}
          onClick={() => primary && void download(primary)}
          disabled={working || !primary}
        >
          {working ? "Preparing…" : `Download ${primary?.ext.toUpperCase() ?? ""}`}
        </button>
        <button
          type="button"
          className={`${s.calcBtn} ${ls.dlCaret}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="More download formats"
          disabled={working}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && (
        <div className={ls.dlList} role="menu">
          {formats.map((fmt) => (
            <button
              key={fmt.ext}
              type="button"
              role="menuitem"
              className={ls.dlItem}
              onClick={() => void download(fmt)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {fmt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageDownloadMenu;
