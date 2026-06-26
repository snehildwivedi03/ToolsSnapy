import { Link } from "react-router-dom";
import s from "./LegalPage.module.css";

const TermsOfService = () => (
  <div className={s.page}>
    <Link to="/" className={s.backLink}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back to ToolSnapy
    </Link>

    <div className={s.hero}>
      <span className={s.badge}>Legal</span>
      <h1 className={s.title}>Terms of Service</h1>
      <p className={s.meta}>Effective date: June 26, 2026 &nbsp;·&nbsp; Last updated: June 26, 2026</p>
    </div>

    {/* ── Agreement ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Agreement to these terms</h2>
      <div className={s.body}>
        <p>
          By accessing or using ToolSnapy ("<strong>Service</strong>", "<strong>we</strong>",
          "<strong>us</strong>") at <strong>toolsnapy.com</strong>, you agree to be bound by these Terms of
          Service. If you do not agree, please do not use the Service.
        </p>
        <p>
          These terms apply to all visitors, users, and other persons who access or use the Service.
        </p>
      </div>
    </div>

    <hr className={s.divider} />

    {/* ── Description ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Description of the Service</h2>
      <div className={s.body}>
        <p>
          ToolSnapy provides free, browser-based utility tools including text processing, image editing,
          PDF tools, calculators, developer utilities, and an Instant Share feature. Most tools operate
          entirely within your browser and do not transmit data to our servers. The Instant Share feature
          uses temporary server-side storage — see our <Link to="/privacy-policy">Privacy Policy</Link> for details.
        </p>
        <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice.</p>
      </div>
    </div>

    {/* ── Acceptable Use ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Acceptable use</h2>
      <div className={s.body}>
        <p>You agree to use ToolSnapy only for lawful purposes. You must <strong>not</strong>:</p>
        <ul>
          <li>Upload, share, or process content that is illegal, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable.</li>
          <li>Upload content that infringes any third party's intellectual property rights, privacy rights, or other legal rights.</li>
          <li>Attempt to circumvent, disable, or interfere with security features of the Service.</li>
          <li>Use automated scripts, bots, or crawlers to make excessive requests that place undue load on our infrastructure.</li>
          <li>Use the Instant Share feature to distribute malware, phishing links, or any other malicious content.</li>
          <li>Misrepresent your identity or affiliation with any person or organisation.</li>
          <li>Use the Service in any way that violates applicable local, national, or international law or regulation.</li>
        </ul>
      </div>
    </div>

    {/* ── File uploads / Instant Share ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>File uploads &amp; Instant Share</h2>
      <div className={s.highlight}>
        <p>
          <strong>⏱ Files shared via Instant Share are automatically deleted after 15 minutes.</strong> By uploading a file, you confirm you have the right to share it and that it complies with these Terms.
        </p>
      </div>
      <div className={s.body}>
        <ul>
          <li>You retain full ownership of any content you upload. By uploading, you grant ToolSnapy a limited, temporary licence to store and transmit the content solely for the purpose of the share transfer.</li>
          <li>We do not claim ownership of, or any ongoing rights to, files you process or share through the Service.</li>
          <li>Files are subject to size and type limits enforced by the Service. Attempting to bypass these limits is not permitted.</li>
          <li>We reserve the right to remove any content at any time if we believe it violates these Terms or applicable law.</li>
        </ul>
      </div>
    </div>

    <hr className={s.divider} />

    {/* ── Intellectual Property ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Intellectual property</h2>
      <div className={s.body}>
        <p>
          The ToolSnapy name, logo, website design, and original software are the intellectual property
          of ToolSnapy and its licensors. You may not copy, reproduce, or redistribute any part of the
          Service without prior written permission, except as expressly permitted by these Terms or
          applicable law.
        </p>
        <p>
          Open-source libraries used by ToolSnapy are subject to their respective licences.
        </p>
      </div>
    </div>

    {/* ── Disclaimers ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Disclaimers &amp; no warranty</h2>
      <div className={s.body}>
        <p>
          The Service is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis,
          without warranties of any kind, either express or implied, including but not limited to warranties
          of merchantability, fitness for a particular purpose, accuracy, or non-infringement.
        </p>
        <p>
          We do not warrant that (a) the Service will be uninterrupted, error-free, or secure; (b) the
          results obtained from using the Service will be accurate or reliable; or (c) any errors in the
          Service will be corrected.
        </p>
        <p>
          Tool outputs (e.g. calculations, conversions, AI-generated background removal) are provided for
          convenience. Do not rely on them for medical, legal, financial, or other professional decisions
          without independent verification.
        </p>
      </div>
    </div>

    {/* ── Limitation of Liability ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Limitation of liability</h2>
      <div className={s.body}>
        <p>
          To the fullest extent permitted by applicable law, ToolSnapy and its operators shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages — including
          loss of data, loss of profits, or loss of goodwill — arising from or in connection with your
          use of, or inability to use, the Service, even if we have been advised of the possibility of
          such damages.
        </p>
        <p>
          Our total aggregate liability for any claim arising from or related to these Terms or the
          Service shall not exceed USD $10.
        </p>
      </div>
    </div>

    {/* ── Indemnification ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Indemnification</h2>
      <div className={s.body}>
        <p>
          You agree to indemnify and hold harmless ToolSnapy and its operators from and against any
          claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising
          out of your use of the Service, your violation of these Terms, or your violation of any rights
          of a third party.
        </p>
      </div>
    </div>

    {/* ── Privacy ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Privacy</h2>
      <div className={s.body}>
        <p>
          Your use of the Service is also governed by our <Link to="/privacy-policy">Privacy Policy</Link>,
          which is incorporated into these Terms by reference. Please review the Privacy Policy for
          details on how we handle your data, including the 15-minute automatic deletion of shared files.
        </p>
      </div>
    </div>

    {/* ── Governing Law ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Governing law</h2>
      <div className={s.body}>
        <p>
          These Terms shall be governed by and construed in accordance with applicable law. Any disputes
          arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts
          of the jurisdiction in which ToolSnapy operates.
        </p>
      </div>
    </div>

    {/* ── Changes ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Changes to these terms</h2>
      <div className={s.body}>
        <p>
          We reserve the right to modify these Terms at any time. We will post the updated Terms on this
          page with a new effective date. Continued use of the Service after changes are posted constitutes
          your acceptance of the updated Terms.
        </p>
      </div>
    </div>

    {/* ── Contact ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Contact</h2>
      <div className={s.body}>
        <p>
          Questions about these Terms? Contact us at:<br />
          <strong>legal@toolsnapy.com</strong>
        </p>
      </div>
    </div>
  </div>
);

export default TermsOfService;
