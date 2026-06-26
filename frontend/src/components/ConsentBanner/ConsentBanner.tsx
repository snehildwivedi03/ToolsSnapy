import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import s from "./ConsentBanner.module.css";

const CONSENT_KEY = "ts_consent_v1";

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay so the banner doesn't compete with page load animation
    const t = setTimeout(() => {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const dismiss = () => {
    // Temporary dismiss — will reappear next session
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={s.overlay} role="dialog" aria-modal="false" aria-label="Privacy & cookie notice">
      <div className={s.banner}>
        <div className={s.content}>
          <div className={s.iconWrap} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className={s.text}>
            <p className={s.heading}>Your privacy, our priority</p>
            <p className={s.body}>
              Most ToolSnapy tools run <strong style={{ color: "#c4b5fd" }}>entirely in your browser</strong> — your files never leave your device.
              Files shared via <strong style={{ color: "#c4b5fd" }}>Instant Share</strong> are temporarily stored on our servers and{" "}
              <strong style={{ color: "#c4b5fd" }}>auto-deleted after 15 minutes</strong>.
              We use minimal cookies to keep the site running.{" "}
              Read our{" "}
              <Link to="/privacy-policy" onClick={accept}>Privacy Policy</Link>
              {" "}and{" "}
              <Link to="/terms" onClick={accept}>Terms of Service</Link>.
            </p>
          </div>
        </div>

        <div className={s.actions}>
          <button className={s.btnAccept} onClick={accept}>
            Accept &amp; Continue
          </button>
          <button className={s.btnDecline} onClick={dismiss}>
            Dismiss
          </button>
          <div className={s.links}>
            <Link to="/privacy-policy" className={s.link} onClick={accept}>Privacy Policy</Link>
            <Link to="/terms" className={s.link} onClick={accept}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
