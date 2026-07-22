/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useEffect, useRef } from "react";
import s from "./AdSlot.module.css";

/**
 * Ad slot sizes matching standard IAB formats.
 * - banner: 728x90 (desktop) / 320x50 (mobile)
 * - rectangle: 300x250 medium rectangle
 * - skyscraper: 160x600 wide skyscraper
 */
type AdSize = "banner" | "rectangle" | "skyscraper";

interface AdSlotProps {
  /** Unique identifier for this ad placement */
  id: string;
  /** Ad size format */
  size?: AdSize;
  /** Additional CSS class */
  className?: string;
}

/**
 * Hidden ad slot component for future ad integration.
 * 
 * This component is controlled by the VITE_ENABLE_ADS environment variable.
 * When ads are ready to be displayed:
 * 1. Set VITE_ENABLE_ADS=true in .env
 * 2. Add your ad network script to index.html
 * 3. Update this component to integrate with your ad network (Google AdSense, etc.)
 * 
 * Usage:
 * ```tsx
 * <AdSlot id="home-banner" size="banner" />
 * <AdSlot id="sidebar-rectangle" size="rectangle" />
 * ```
 */
const AdSlot = ({ id, size = "banner", className = "" }: AdSlotProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if ads are enabled via environment variable
  const adsEnabled = import.meta.env.VITE_ENABLE_ADS === "true";

  useEffect(() => {
    if (!adsEnabled || !containerRef.current) return;

    // ──────────────────────────────────────────────────────────────
    // TODO: Initialize your ad network here when ready
    // 
    // Example for Google AdSense:
    // (window.adsbygoogle = window.adsbygoogle || []).push({});
    //
    // Example for custom ad network:
    // window.myAdNetwork?.renderAd({ container: containerRef.current, slotId: id });
    // ──────────────────────────────────────────────────────────────

  }, [adsEnabled, id]);

  // Don't render anything if ads are disabled
  if (!adsEnabled) {
    return null;
  }

  const sizeClass = {
    banner: s.slotBanner,
    rectangle: s.slotRectangle,
    skyscraper: s.slotSkyscraper,
  }[size];

  return (
    <aside
      ref={containerRef}
      id={`ad-${id}`}
      className={`${s.slotEnabled} ${sizeClass} ${className}`}
      aria-label="Advertisement"
      data-ad-slot={id}
      data-ad-size={size}
    >
      <span className={s.label}>Advertisement</span>
      <div className={s.placeholder}>
        {/* Ad content will be injected here by the ad network */}
        Ad loading...
      </div>
    </aside>
  );
};

export default AdSlot;
