import { useNavigate } from "react-router-dom";
import s from "./LegalPage.module.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className={s.page}>
      <button className={s.backLink} onClick={() => navigate(-1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className={s.hero}>
        <span className={s.badge}>Legal</span>
        <h1 className={s.title}>Privacy Policy</h1>
        <p className={s.meta}>Effective: June 26, 2026 &nbsp;·&nbsp; Last updated: June 26, 2026</p>
      </div>

      <div className={s.content}>

        {/* ── Introduction ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Who We Are</h2>
          <div className={s.body}>
            <p>
              ToolSnapy ("<strong>we</strong>", "<strong>our</strong>", "<strong>us</strong>") operates
              the website at <strong>toolsnapy.com</strong>. We provide free browser-based tools for
              text processing, image editing, PDF manipulation, calculations, and instant file sharing.
              Your privacy is fundamental to what we do — this policy explains clearly what data we
              handle, why, and how we protect it.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Browser-only ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Browser-Only Processing</h2>
          <div className={s.calloutGreen}>
            <p>
              <strong>✓ Your files never leave your device</strong> — the vast majority of ToolSnapy
              tools (image resizing, background removal, PDF compression, text tools, calculators,
              etc.) run entirely inside your browser using JavaScript. No data is uploaded to our
              servers when you use these tools.
            </p>
          </div>
          <div className={s.body}>
            <p>
              Only features that explicitly require a server — such as <strong>Instant Share</strong> —
              involve any data transmission to our infrastructure. All other tools are completely
              client-side.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── What we collect ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>What Data We Collect</h2>
          <div className={s.body}>
            <p>We collect the absolute minimum necessary to operate the service:</p>
            <ul>
              <li>
                <strong>Standard web logs</strong> — IP address, browser type, operating system,
                pages visited, and timestamps. Used only for security monitoring and aggregate
                analytics. Never tied to a personal profile.
              </li>
              <li>
                <strong>Files uploaded via Instant Share</strong> — images, PDFs, and other files
                shared through ToolSnapy are temporarily stored on our servers to generate a share
                code. See the section below for full details.
              </li>
              <li>
                <strong>Consent preference</strong> — a local storage flag that records whether you
                have acknowledged this policy. Contains no personal information.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> collect your name, email, phone number, payment details, or
              any other personally identifiable information unless you voluntarily contact us.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Instant Share ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Instant Share &amp; 15-Minute Auto-Deletion</h2>
          <div className={s.highlight}>
            <p>
              <strong>⏱ Auto-deletion guarantee:</strong> Files shared via Instant Share are stored
              on our servers for a <strong>maximum of 15 minutes</strong>, after which they are
              permanently and irreversibly deleted from our systems.
            </p>
          </div>
          <div className={s.body}>
            <p>When you use Instant Share:</p>
            <ul>
              <li>Your file is encrypted in transit (HTTPS).</li>
              <li>A unique share code is generated and linked to your file.</li>
              <li>The file is automatically purged after 15 minutes regardless of whether it was downloaded.</li>
              <li>We do not analyze, index, or retain any content from shared files.</li>
            </ul>
            <p>
              <strong>Important:</strong> Do not share confidential, sensitive, or personally
              identifiable information via Instant Share. See our Terms of Service for the full
              data responsibility disclaimer.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Cookies ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Cookies &amp; Local Storage</h2>
          <div className={s.body}>
            <p>We use cookies and browser local storage for the following purposes only:</p>
            <ul>
              <li><strong>Functional:</strong> Remembering your consent preference so the policy notice does not reappear on every visit after you accept.</li>
              <li><strong>Analytics:</strong> Aggregate, anonymised usage statistics to understand which tools are popular.</li>
              <li><strong>Advertising:</strong> Third-party ad networks (such as Google AdSense) may set their own cookies to serve relevant ads. These are governed by the respective provider's privacy policy.</li>
            </ul>
            <p>
              You can clear cookies and local storage at any time via your browser settings. This
              will reset your consent preference.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Third-party ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Third-Party Services</h2>
          <div className={s.body}>
            <p>ToolSnapy may integrate with the following third-party services:</p>
            <ul>
              <li><strong>Google AdSense</strong> — serves display advertisements. Google's privacy policy applies to its use of cookies for ad personalization.</li>
              <li><strong>Google Analytics (if enabled)</strong> — provides anonymised traffic analytics.</li>
              <li><strong>CDN providers</strong> — fonts and static assets may be loaded from third-party CDNs (e.g. Google Fonts).</li>
            </ul>
            <p>
              We are not responsible for the privacy practices of these third-party services.
              We encourage you to review their privacy policies independently.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Your rights ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Your Rights</h2>
          <div className={s.body}>
            <p>
              Depending on your jurisdiction (including GDPR in the EU/UK and CCPA in California),
              you may have the right to:
            </p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Object to or restrict our processing of your data.</li>
              <li>Data portability (receive your data in a machine-readable format).</li>
              <li>Withdraw consent at any time, without affecting lawfulness of prior processing.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:legal@toolsnapy.com">legal@toolsnapy.com</a>. We will respond within
              30 days.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Security ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Data Security</h2>
          <div className={s.body}>
            <p>
              We implement industry-standard security measures including HTTPS encryption for all
              data in transit, secure server infrastructure, and access controls. However, no
              method of transmission or storage is 100% secure. We cannot guarantee the absolute
              security of information transmitted to or stored on our systems.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Children ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Children's Privacy</h2>
          <div className={s.body}>
            <p>
              ToolSnapy is not directed at children under 13 years of age. We do not knowingly
              collect personal information from children. If you believe a child has provided us
              with personal data, please contact us at{" "}
              <a href="mailto:legal@toolsnapy.com">legal@toolsnapy.com</a> and we will delete
              it promptly.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Changes ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Changes to This Policy</h2>
          <div className={s.body}>
            <p>
              We may update this Privacy Policy from time to time. We will indicate the date of
              the last update at the top of this page. Continued use of ToolSnapy after any changes
              constitutes your acceptance of the updated policy.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Contact ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Contact Us</h2>
          <div className={s.body}>
            <p>
              For privacy-related questions, data requests, or concerns, contact us at:{" "}
              <a href="mailto:legal@toolsnapy.com">legal@toolsnapy.com</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
