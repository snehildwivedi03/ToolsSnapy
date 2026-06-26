import { Link } from "react-router-dom";
import s from "./LegalPage.module.css";

const PrivacyPolicy = () => (
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
      <h1 className={s.title}>Privacy Policy</h1>
      <p className={s.meta}>Effective date: June 26, 2026 &nbsp;·&nbsp; Last updated: June 26, 2026</p>
    </div>

    {/* ── Introduction ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Who we are</h2>
      <div className={s.body}>
        <p>
          ToolSnapy ("<strong>we</strong>", "<strong>our</strong>", "<strong>us</strong>") operates the website
          at <strong>toolsnapy.com</strong> (the "Service"). We provide free browser-based tools for text
          processing, image editing, PDF manipulation, calculations, and instant file sharing. Your privacy
          matters to us — this policy explains what data we handle, why, and how we protect it.
        </p>
      </div>
    </div>

    <hr className={s.divider} />

    {/* ── What we collect ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>What data we collect</h2>
      <div className={s.body}>
        <p>We collect the absolute minimum necessary to operate the Service:</p>
        <ul>
          <li><strong>Usage logs</strong> — standard web-server logs (IP address, browser type, pages visited, timestamp). These are used only for security monitoring and aggregate analytics. They are not tied to any personal profile.</li>
          <li><strong>Files you upload via the Instant Share feature</strong> — images, PDFs, and other files shared through ToolSnapy are temporarily stored on our servers to generate a share code for the recipient. See the section below for full details.</li>
          <li><strong>Consent preference</strong> — a cookie or local-storage flag that records whether you have acknowledged this policy. No personal information is stored in it.</li>
        </ul>
        <p>
          We do <strong>not</strong> collect your name, email address, phone number, payment details, or any
          other personally identifiable information unless you voluntarily contact us.
        </p>
      </div>
    </div>

    {/* ── Browser-only tools ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Browser-only processing</h2>
      <div className={s.calloutGreen}>
        <p>
          ✓ &nbsp;The vast majority of ToolSnapy tools — text tools, calculators, image resizing, PDF
          merge/split, background removal, converters, and more — run <strong>entirely inside your
          browser</strong>. Your files and data never leave your device for these tools.
        </p>
      </div>
      <div className={s.body}>
        <p>
          These tools use JavaScript and WebAssembly running locally on your machine. No file content,
          no input text, and no results are sent to our servers when you use these local tools.
        </p>
      </div>
    </div>

    {/* ── Instant Share / temporary storage ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Instant Share — temporary file storage</h2>
      <div className={s.highlight}>
        <p>
          <strong>⏱ 15-minute auto-deletion:</strong> Files and text shared through the Instant Share feature
          are stored on our servers only for the time needed to transfer them to the recipient —
          <strong> a maximum of 15 minutes</strong>. After that window, the files are automatically and
          permanently deleted from our servers. No backup copies are kept.
        </p>
      </div>
      <div className={s.body}>
        <p>
          When you use the Instant Share feature (Share Images, Share PDFs, Share Files, Share Text):
        </p>
        <ul>
          <li>Your file(s) or text are uploaded to our server and assigned a unique 6-character share code.</li>
          <li>The recipient uses that code to download the content within the 15-minute window.</li>
          <li>Files are stored in an isolated temporary directory and are inaccessible without the exact share code.</li>
          <li>After 15 minutes, an automated cleanup process permanently deletes the files and the share record.</li>
          <li>We do not read, process, analyse, or retain the contents of shared files beyond what is technically required for the transfer.</li>
        </ul>
        <p>
          <strong>Please do not share highly sensitive documents</strong> (e.g. legal contracts,
          medical records, passwords) through the Instant Share feature. While transfers are temporary and
          access is code-gated, use end-to-end encrypted services for documents requiring the highest
          confidentiality.
        </p>
      </div>
    </div>

    <hr className={s.divider} />

    {/* ── Cookies ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Cookies &amp; local storage</h2>
      <div className={s.body}>
        <p>
          ToolSnapy uses a small number of cookies and browser local-storage entries:
        </p>
        <ul>
          <li><strong>Consent flag</strong> (<code>ts_consent_v1</code>) — stored in <code>localStorage</code> to remember that you have acknowledged this policy. Expires when you clear your browser data. Contains no personal information.</li>
          <li><strong>Analytics cookies</strong> — if we use a privacy-respecting analytics service (such as one that does not track individuals or use cross-site cookies), we will list it here. Currently, no third-party analytics cookies are set.</li>
          <li><strong>Ad serving cookies</strong> — ToolSnapy displays ads to fund free access. Ad providers may set their own cookies subject to their own privacy policies. You can opt out via your browser's cookie settings or the IAB opt-out tools.</li>
        </ul>
        <p>We do not use tracking pixels, cross-site trackers, or fingerprinting technologies ourselves.</p>
      </div>
    </div>

    {/* ── Third parties ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Third-party services</h2>
      <div className={s.body}>
        <ul>
          <li><strong>Hosting &amp; CDN</strong> — our servers are hosted on a reputable cloud provider. Server logs are retained for a maximum of 30 days for security purposes.</li>
          <li><strong>Advertising</strong> — we may serve ads through networks such as Google AdSense. These providers operate under their own privacy policies and may personalise ads based on your browsing history. You can manage ad personalisation at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.</li>
          <li><strong>No social login, no user accounts</strong> — ToolSnapy does not offer sign-in and has no relationship with social media platforms on your behalf.</li>
        </ul>
      </div>
    </div>

    {/* ── Your rights ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Your rights</h2>
      <div className={s.body}>
        <p>
          Depending on where you are located, you may have rights under data-protection law (e.g. GDPR, CCPA)
          including the right to access, correct, or delete data we hold about you.
        </p>
        <p>
          Because we do not create user accounts or link log data to identities, most of these rights are
          satisfied by the fact that we hold very little data about you. If you have specific questions or
          requests, contact us at the address below.
        </p>
      </div>
    </div>

    {/* ── Children ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Children's privacy</h2>
      <div className={s.body}>
        <p>
          ToolSnapy is not directed at children under the age of 13 (or 16 in the EU). We do not knowingly
          collect personal information from children. If you believe a child has provided personal data
          through the Service, please contact us and we will delete it promptly.
        </p>
      </div>
    </div>

    {/* ── Security ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Security</h2>
      <div className={s.body}>
        <p>
          All data in transit between your browser and our servers is encrypted via HTTPS (TLS 1.2+).
          Uploaded files are stored in isolated directories accessible only via the unique share code.
          We apply reasonable security measures, but no internet transmission is 100% secure.
        </p>
      </div>
    </div>

    {/* ── Changes ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Changes to this policy</h2>
      <div className={s.body}>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be announced via a
          notice on the website. Continued use of ToolSnapy after an update constitutes acceptance of
          the revised policy.
        </p>
      </div>
    </div>

    {/* ── Contact ── */}
    <div className={s.section}>
      <h2 className={s.sectionTitle}>Contact us</h2>
      <div className={s.body}>
        <p>
          Questions or concerns about this Privacy Policy? Reach out at:<br />
          <strong>legal@toolsnapy.com</strong>
        </p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
