/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useEffect, useRef, useState } from "react";
import { zip, unzip, type Zippable, type UnzipFileInfo } from "fflate";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import ls from "./DevTool.module.css";
import z from "./ZipTool.module.css";

/* ── Security limits ───────────────────────────────────────
   These bound memory use and stop decompression ("zip bomb")
   attacks, including archives that were compressed many times.
   Everything runs in the browser — files never leave the device. */
const MiB = 1024 * 1024;

/* Zipping (folder/files → .zip) */
const MAX_ZIP_FILES = 500;            // max entries you can add
const MAX_ZIP_TOTAL = 300 * MiB;      // max combined input size

/* Unzipping (.zip → files) */
const MAX_ZIP_INPUT = 100 * MiB;      // max .zip you can open
const MAX_TOTAL_UNCOMPRESSED = 512 * MiB;
const MAX_COMPRESSION_RATIO = 120;    // uncompressed / compressed
const RATIO_MIN_COMPRESSED = 4096;    // ignore ratio for tiny entries
const MAX_ENTRIES = 5000;             // max files inside a .zip

type Mode = "zip" | "unzip";

interface ZipItem {
  name: string; // relative path inside the archive
  file: File;
}

interface OutFile {
  name: string;
  size: number;
  url: string;
}

const fmt = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MiB) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * MiB) return `${(bytes / MiB).toFixed(2)} MB`;
  return `${(bytes / (1024 * MiB)).toFixed(2)} GB`;
};

/* Reject absolute paths and directory traversal ("zip slip") */
const isUnsafePath = (name: string): boolean =>
  /^([a-zA-Z]:[\\/]|[\\/])/.test(name) ||
  name.split(/[\\/]/).some((seg) => seg === "..");

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8v13H3V8" />
    <path d="M1 3h22v5H1z" />
    <path d="M10 12h4" />
  </svg>
);

const ZipTool = () => {
  const [mode, setMode] = useState<Mode>("zip");

  /* zip state */
  const [items, setItems] = useState<ZipItem[]>([]);
  const [zipName, setZipName] = useState("archive");
  const [busy, setBusy] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  /* unzip state */
  const [outFiles, setOutFiles] = useState<OutFile[]>([]);
  const [unzipError, setUnzipError] = useState<string | null>(null);
  const [unzipInfo, setUnzipInfo] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  /* enable folder selection (non-standard attributes) */
  useEffect(() => {
    const el = folderRef.current;
    if (el) {
      el.setAttribute("webkitdirectory", "");
      el.setAttribute("directory", "");
    }
  }, []);

  /* free object URLs on unmount / refresh */
  useEffect(() => () => outFiles.forEach((f) => URL.revokeObjectURL(f.url)), [outFiles]);

  const totalSize = items.reduce((sum, i) => sum + i.file.size, 0);

  /* ── Add files/folder to the zip queue ── */
  const addFiles = (fileList: FileList | null, useRelativePath: boolean) => {
    if (!fileList || fileList.length === 0) return;
    setZipError(null);

    const incoming: ZipItem[] = Array.from(fileList).map((file) => ({
      name:
        (useRelativePath && (file as File & { webkitRelativePath?: string }).webkitRelativePath) ||
        file.name,
      file,
    }));

    // merge with existing, de-duplicating by path
    const map = new Map<string, ZipItem>();
    [...items, ...incoming].forEach((it) => map.set(it.name, it));
    const merged = Array.from(map.values());

    if (merged.length > MAX_ZIP_FILES) {
      setZipError(`Too many files. The limit is ${MAX_ZIP_FILES} entries per archive.`);
      return;
    }
    const size = merged.reduce((sum, i) => sum + i.file.size, 0);
    if (size > MAX_ZIP_TOTAL) {
      setZipError(`Total size ${fmt(size)} exceeds the ${fmt(MAX_ZIP_TOTAL)} limit.`);
      return;
    }

    setItems(merged);
  };

  const removeItem = (name: string) =>
    setItems((prev) => prev.filter((i) => i.name !== name));

  const clearItems = () => {
    setItems([]);
    setZipError(null);
  };

  /* ── Build the .zip ── */
  const buildZip = async () => {
    if (items.length === 0 || busy) return;
    setBusy(true);
    setZipError(null);
    try {
      const data: Zippable = {};
      for (const { name, file } of items) {
        data[name] = new Uint8Array(await file.arrayBuffer());
      }
      zip(data, { level: 6 }, (err, out) => {
        setBusy(false);
        if (err) {
          setZipError("Could not create the ZIP. Please try again.");
          return;
        }
        const safeName = (zipName.trim() || "archive").replace(/[^\w.-]+/g, "_");
        triggerDownload(new Blob([out as BlobPart], { type: "application/zip" }), `${safeName}.zip`);
      });
    } catch {
      setBusy(false);
      setZipError("Could not read one of the files. Please try again.");
    }
  };

  /* ── Open + safely extract a .zip ── */
  const openZip = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    // reset previous results
    outFiles.forEach((f) => URL.revokeObjectURL(f.url));
    setOutFiles([]);
    setUnzipInfo(null);
    setUnzipError(null);

    if (file.size > MAX_ZIP_INPUT) {
      setUnzipError(`This ZIP is ${fmt(file.size)}. The maximum allowed is ${fmt(MAX_ZIP_INPUT)}.`);
      return;
    }

    setBusy(true);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());

      let entryCount = 0;
      let totalUncompressed = 0;
      let rejection: string | null = null;

      /* The filter runs for every entry BEFORE it is decompressed.
         originalSize comes from the archive's central directory, so we
         can enforce limits without ever expanding a malicious payload. */
      const filter = (f: UnzipFileInfo): boolean => {
        if (rejection) return false;

        entryCount += 1;
        if (entryCount > MAX_ENTRIES) {
          rejection = `Archive has more than ${MAX_ENTRIES} entries and was blocked.`;
          return false;
        }
        if (isUnsafePath(f.name)) {
          rejection = `Blocked unsafe path in archive: "${f.name}".`;
          return false;
        }

        const orig = f.originalSize || 0;
        const comp = f.size || 0;

        totalUncompressed += orig;
        if (totalUncompressed > MAX_TOTAL_UNCOMPRESSED) {
          rejection = `Archive expands to over ${fmt(MAX_TOTAL_UNCOMPRESSED)} and was blocked as a possible zip bomb.`;
          return false;
        }
        if (comp >= RATIO_MIN_COMPRESSED && orig / comp > MAX_COMPRESSION_RATIO) {
          rejection = `Entry "${f.name}" has an abnormal compression ratio (${Math.round(orig / comp)}×) and was blocked as a possible zip bomb.`;
          return false;
        }
        return true;
      };

      unzip(buf, { filter }, (err, unzipped) => {
        setBusy(false);
        if (rejection) {
          setUnzipError(rejection);
          return;
        }
        if (err) {
          setUnzipError("This file could not be read as a valid ZIP archive.");
          return;
        }

        const results: OutFile[] = [];
        for (const [name, bytes] of Object.entries(unzipped)) {
          if (name.endsWith("/")) continue; // skip directory entries
          const blob = new Blob([bytes as BlobPart]);
          results.push({ name, size: bytes.length, url: URL.createObjectURL(blob) });
        }

        if (results.length === 0) {
          setUnzipInfo("The archive contained no extractable files.");
        }
        setOutFiles(results);
      });
    } catch {
      setBusy(false);
      setUnzipError("This file could not be read as a valid ZIP archive.");
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setZipError(null);
    setUnzipError(null);
  };

  return (
    <ToolPageShell
      backTo="/utilities"
      backLabel="Developer Tools"
      icon={<Icon />}
      iconColor="#6f4e37"
      iconBg="#faf6f1"
      title="Zip / Unzip Files"
      description="Compress files and folders into a ZIP, or safely extract one. Protected against oversized inputs and decompression ('zip bomb') attacks. Everything runs in your browser — nothing is uploaded."
    >
      {/* Mode switch */}
      <div className={s.card}>
        <span className={s.cardTitle}>Mode</span>
        <div className={s.chipGroup}>
          <button type="button" className={`${s.chip} ${mode === "zip" ? s.chipActive : ""}`}
            onClick={() => switchMode("zip")}>Create ZIP</button>
          <button type="button" className={`${s.chip} ${mode === "unzip" ? s.chipActive : ""}`}
            onClick={() => switchMode("unzip")}>Extract ZIP</button>
        </div>
      </div>

      {mode === "zip" ? (
        <div className={s.card}>
          <span className={s.cardTitle}>Add files or a folder</span>

          <div className={z.actionsRow}>
            <label className={z.selectBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              Choose files
              <input ref={fileRef} type="file" multiple className={z.hiddenInput}
                onChange={(e) => { addFiles(e.target.files, false); e.target.value = ""; }} />
            </label>

            <label className={z.selectBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Choose folder
              <input ref={folderRef} type="file" multiple className={z.hiddenInput}
                onChange={(e) => { addFiles(e.target.files, true); e.target.value = ""; }} />
            </label>
          </div>

          <p className={z.limits}>
            Limits: up to <b>{MAX_ZIP_FILES}</b> files and <b>{fmt(MAX_ZIP_TOTAL)}</b> total.
          </p>

          {zipError && <p className={ls.error}>{zipError}</p>}

          {items.length > 0 ? (
            <>
              <ul className={z.list}>
                {items.map((it) => (
                  <li key={it.name} className={z.item}>
                    <div className={z.itemMain}>
                      <span className={z.name}>{it.name}</span>
                      <span className={z.size}>{fmt(it.file.size)}</span>
                    </div>
                    <button type="button" className={`${z.iconBtn} ${z.dangerBtn}`}
                      onClick={() => removeItem(it.name)} aria-label={`Remove ${it.name}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>

              <div className={z.summary}>
                <span>{items.length} file{items.length !== 1 ? "s" : ""} · {fmt(totalSize)}</span>
                <button type="button" className={ls.copyBtn} onClick={clearItems}>Clear all</button>
              </div>

              <div className={s.inputGroup} style={{ marginTop: "0.85rem" }}>
                <label className={s.label} htmlFor="zip-name">Archive name</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input id="zip-name" className={s.input} value={zipName}
                    onChange={(e) => setZipName(e.target.value)} placeholder="archive"
                    spellCheck={false} style={{ flex: 1 }} />
                  <span className={z.size}>.zip</span>
                </div>
              </div>

              <button type="button" className={s.calcBtn} onClick={buildZip}
                disabled={busy} style={{ marginTop: "0.85rem" }}>
                {busy ? "Compressing…" : "Create & Download ZIP"}
              </button>
            </>
          ) : (
            <p className={z.empty}>No files added yet. Choose files or a folder to begin.</p>
          )}
        </div>
      ) : (
        <div className={s.card}>
          <span className={s.cardTitle}>Select a .zip to extract</span>

          <div className={z.actionsRow}>
            <label className={z.selectBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Choose ZIP file
              <input type="file" accept=".zip,application/zip,application/x-zip-compressed"
                className={z.hiddenInput}
                onChange={(e) => { openZip(e.target.files); e.target.value = ""; }} />
            </label>
          </div>

          <p className={z.limits}>
            Protection: max ZIP <b>{fmt(MAX_ZIP_INPUT)}</b>, expands to at most{" "}
            <b>{fmt(MAX_TOTAL_UNCOMPRESSED)}</b>, ratio ≤ <b>{MAX_COMPRESSION_RATIO}×</b>, up to{" "}
            <b>{MAX_ENTRIES}</b> entries.
          </p>

          {busy && <p className={z.limits}>Inspecting archive…</p>}
          {unzipError && <p className={ls.error}>{unzipError}</p>}
          {unzipInfo && !unzipError && <p className={z.limits}>{unzipInfo}</p>}

          {outFiles.length > 0 && (
            <>
              <ul className={z.list}>
                {outFiles.map((f) => (
                  <li key={f.name} className={z.item}>
                    <div className={z.itemMain}>
                      <span className={z.name}>{f.name}</span>
                      <span className={z.size}>{fmt(f.size)}</span>
                    </div>
                    <a className={z.iconBtn} href={f.url} download={f.name.split(/[\\/]/).pop()}
                      aria-label={`Download ${f.name}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
              <div className={z.summary}>
                <span>
                  {outFiles.length} file{outFiles.length !== 1 ? "s" : ""} ·{" "}
                  {fmt(outFiles.reduce((sum, f) => sum + f.size, 0))}
                </span>
              </div>
            </>
          )}

          <div className={z.notice}>
            <svg className={z.noticeIcon} width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              Nested archives are never auto-extracted, so multi-layer "zip bomb" tricks can't chain.
              Files are inspected from the archive index before any decompression.
            </span>
          </div>
        </div>
      )}
    </ToolPageShell>
  );
};

export default ZipTool;
