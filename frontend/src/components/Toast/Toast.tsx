/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useEffect, useRef } from "react";
import s from "./Toast.module.css";

export type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  /** Auto-dismiss after this many ms. Set 0 to disable. */
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, variant = "success", duration = 3000, onClose }: ToastProps) => {
  // Keep the latest onClose without making it a timer dependency, so parent
  // re-renders (e.g. a per-second countdown) don't restart the dismiss timer.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (duration <= 0) return;
    const id = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(id);
  }, [duration, message]);

  return (
    <div className={s.wrap} role="status" aria-live="polite">
      <div className={`${s.toast} ${variant === "error" ? s.error : s.success}`}>
        <span className={s.icon} aria-hidden="true">
          {variant === "success" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </span>
        <span className={s.message}>{message}</span>
        <button className={s.close} onClick={onClose} aria-label="Dismiss">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
