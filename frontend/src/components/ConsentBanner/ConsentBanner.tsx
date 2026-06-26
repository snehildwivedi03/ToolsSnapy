import { useState, useEffect } from "react";
import s from "./ConsentBanner.module.css";

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [checkedPrivacy, setCheckedPrivacy] = useState(false);
  const [checkedTerms, setCheckedTerms] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const canAccept = checkedPrivacy && checkedTerms;

  if (!visible) return null;

  return (
    <div className={s.overlay} role="dialog" aria-modal="true" aria-label="Privacy &amp; Terms Agreement">
      <div className={s.modal}>

        {/* ── Header ── */}
        <div className={s.modalHeader}>
          <div className={s.shieldWrap} aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className={s.heading}>Before You Continue</p>
          <p className={s.subheading}>Review and agree to use ToolSnapy</p>
        </div>

        {/* ── Scrollable policy content ── */}
        <div className={s.scrollArea}>

          {/* Privacy Policy */}
          <div className={s.policyBlock}>
            <p className={s.policyTitle}>
              <span className={s.policyBadgeBlue}>Privacy Policy</span>
              <span className={s.policySubtitle}>Key highlights</span>
            </p>
            <ul className={s.pointList}>
              <li className={s.point}>
                <span className={s.pointIconGreen} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span><strong>Browser-only processing</strong> — Most tools run entirely in your browser. Files you process are never uploaded to our servers and never leave your device.</span>
              </li>
              <li className={s.point}>
                <span className={s.pointIconAmber} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <span><strong>15-minute auto-delete</strong> — Files shared via Instant Share are temporarily stored on our servers and permanently deleted after 15 minutes.</span>
              </li>
              <li className={s.point}>
                <span className={s.pointIconBlue} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </span>
                <span><strong>Minimal data collection</strong> — We only collect standard web logs (IP, browser type) for security monitoring. No personal profiles are built. Your data is never sold.</span>
              </li>
              <li className={s.point}>
                <span className={s.pointIconPurple} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                <span><strong>Minimal cookies</strong> — We use cookies only to keep the site functional. Ads may be served by third-party networks (e.g. Google AdSense).</span>
              </li>
            </ul>
          </div>

          <div className={s.divider} />

          {/* Terms of Service */}
          <div className={s.policyBlock}>
            <p className={s.policyTitle}>
              <span className={s.policyBadgePurple}>Terms of Service</span>
              <span className={s.policySubtitle}>Key highlights</span>
            </p>
            <ul className={s.pointList}>
              <li className={s.point}>
                <span className={s.pointIconGreen} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span><strong>Free to use</strong> — ToolSnapy is free for personal and commercial use.</span>
              </li>
              <li className={s.point}>
                <span className={s.pointIconRed} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </span>
                <span><strong>No illegal or harmful content</strong> — Do not upload, process, or share content that is illegal, harmful, or malicious.</span>
              </li>
              <li className={s.point}>
                <span className={s.pointIconAmber} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </span>
                <span><strong>"As is" service</strong> — ToolSnapy is provided without warranties. We do not guarantee uptime, accuracy, or fitness for any particular purpose.</span>
              </li>
              <li className={s.point}>
                <span className={s.pointIconBlue} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                <span><strong>Limitation of liability</strong> — ToolSnapy is not liable for any loss of data, revenue, or damages arising from your use of the service.</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className={s.disclaimer}>
            <p className={s.disclaimerHeading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Important: Data Responsibility Disclaimer
            </p>
            <p className={s.disclaimerBody}>
              If you share <strong>confidential, proprietary, or personally identifiable information</strong> through Instant Share or any ToolSnapy feature, and that data is accessed, intercepted, or leaked by unauthorized parties,{" "}
              <strong>ToolSnapy bears no responsibility and shall not be held liable</strong>. You share data entirely at your own risk. Use Instant Share for non-sensitive content only.
            </p>
          </div>

        </div>

        {/* ── Checkboxes ── */}
        <div className={s.agreements}>
          <label className={s.checkRow}>
            <span className={`${s.checkBox} ${checkedPrivacy ? s.checkBoxChecked : ""}`} aria-hidden="true">
              {checkedPrivacy && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </span>
            <input
              type="checkbox"
              className={s.checkNative}
              checked={checkedPrivacy}
              onChange={e => setCheckedPrivacy(e.target.checked)}
              aria-label="I agree to the Privacy Policy"
            />
            <span className={s.checkText}>I have read and agree to the <strong>Privacy Policy</strong></span>
          </label>
          <label className={s.checkRow}>
            <span className={`${s.checkBox} ${checkedTerms ? s.checkBoxChecked : ""}`} aria-hidden="true">
              {checkedTerms && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
            </span>
            <input
              type="checkbox"
              className={s.checkNative}
              checked={checkedTerms}
              onChange={e => setCheckedTerms(e.target.checked)}
              aria-label="I agree to the Terms of Service"
            />
            <span className={s.checkText}>I have read and agree to the <strong>Terms of Service</strong></span>
          </label>
        </div>

        {/* ── Accept button ── */}
        <button
          className={canAccept ? s.btnAccept : s.btnAcceptDisabled}
          onClick={() => canAccept && setVisible(false)}
          disabled={!canAccept}
        >
          {canAccept ? "Accept & Continue" : "Please check both boxes above to continue"}
        </button>

      </div>
    </div>
  );
};

export default ConsentBanner;
