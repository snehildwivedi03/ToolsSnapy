/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useNavigate } from "react-router-dom";
import s from "./LegalPage.module.css";

const TermsOfService = () => {
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
        <h1 className={s.title}>Terms of Service</h1>
        <p className={s.meta}>Effective: June 26, 2026 &nbsp;·&nbsp; Last updated: June 26, 2026</p>
      </div>

      <div className={s.content}>

        {/* ── Agreement ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Agreement to Terms</h2>
          <div className={s.body}>
            <p>
              By accessing or using ToolSnapy ("<strong>Service</strong>"), you agree to be bound
              by these Terms of Service ("<strong>Terms</strong>"). If you do not agree to these
              Terms, do not use the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use ToolSnapy.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Description ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Description of Service</h2>
          <div className={s.body}>
            <p>
              ToolSnapy provides free browser-based tools including — but not limited to — text
              processing, image editing, PDF manipulation, file format conversion, calculations,
              and Instant Share (temporary file sharing). Tools are provided free of charge for
              personal and commercial use.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Acceptable Use ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Acceptable Use</h2>
          <div className={s.body}>
            <p>You agree <strong>not</strong> to use ToolSnapy to:</p>
            <ul>
              <li>Upload, process, or share content that is illegal, harmful, threatening, abusive, harassing, defamatory, or obscene.</li>
              <li>Violate any applicable local, national, or international law or regulation.</li>
              <li>Infringe the intellectual property rights of any third party.</li>
              <li>Distribute malware, viruses, or any other malicious code.</li>
              <li>Attempt to gain unauthorised access to our systems or infrastructure.</li>
              <li>Scrape, crawl, or otherwise extract data from ToolSnapy in an automated manner without prior written consent.</li>
              <li>Use the Service for any purpose that we reasonably determine to be harmful to us, other users, or third parties.</li>
            </ul>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── File Uploads & Instant Share ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>File Uploads &amp; Instant Share</h2>
          <div className={s.highlight}>
            <p>
              <strong>⏱ 15-minute auto-deletion:</strong> Files shared via Instant Share are
              stored on our servers for a maximum of <strong>15 minutes</strong> and then
              permanently deleted.
            </p>
          </div>
          <div className={s.body}>
            <p>
              When you upload files through Instant Share, you grant ToolSnapy a limited,
              temporary licence solely to store and transmit those files for the purpose of
              enabling the share feature. This licence expires when the file is deleted (within 15
              minutes).
            </p>
            <p>You represent and warrant that:</p>
            <ul>
              <li>You own or have the necessary rights to the files you upload.</li>
              <li>The files do not violate any third-party intellectual property rights.</li>
              <li>The files do not contain malicious code, illegal content, or content that violates these Terms.</li>
            </ul>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── DATA RESPONSIBILITY DISCLAIMER ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Data Responsibility Disclaimer</h2>
          <div className={s.calloutAmber}>
            <p>
              <strong>⚠ IMPORTANT:</strong> If you share <strong>confidential, proprietary, sensitive,
              or personally identifiable information</strong> through Instant Share or any other
              ToolSnapy feature, and that data is subsequently accessed, intercepted, copied, or
              leaked by unauthorized parties — whether due to a security breach, technical failure,
              or any other cause — <strong>ToolSnapy bears no responsibility whatsoever and shall
              not be held liable</strong> for any resulting losses, damages, or harms.
            </p>
          </div>
          <div className={s.body}>
            <p>
              You share data entirely at your own risk. ToolSnapy is not designed or intended
              for the transmission of confidential, classified, or personally sensitive information.
              Use Instant Share only for non-sensitive, non-confidential content.
            </p>
            <p>
              This disclaimer applies regardless of the cause of any data exposure, including but not
              limited to: server compromise, interception in transit, user error, or third-party
              actions.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── IP ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Intellectual Property</h2>
          <div className={s.body}>
            <p>
              The ToolSnapy name, logo, website design, and all original content (excluding
              user-uploaded files) are the intellectual property of ToolSnapy and are protected
              by applicable copyright and trademark laws.
            </p>
            <p>
              You retain all rights to content you upload or process through ToolSnapy. We claim
              no ownership over your files.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Disclaimers ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Disclaimers &amp; No Warranty</h2>
          <div className={s.body}>
            <p>
              ToolSnapy is provided on an <strong>"as is"</strong> and <strong>"as available"</strong>{" "}
              basis, without any warranty of any kind, express or implied, including but not limited to
              warranties of merchantability, fitness for a particular purpose, accuracy, or
              non-infringement.
            </p>
            <p>
              We do not warrant that:
            </p>
            <ul>
              <li>The Service will be uninterrupted, error-free, or secure.</li>
              <li>Results obtained from the tools will be accurate or reliable.</li>
              <li>Any defects in the Service will be corrected.</li>
            </ul>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Limitation of Liability ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Limitation of Liability</h2>
          <div className={s.body}>
            <p>
              To the maximum extent permitted by applicable law, ToolSnapy and its owners,
              operators, employees, and affiliates shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul>
              <li>Loss of data, profits, revenue, or business.</li>
              <li>Costs of procuring substitute services.</li>
              <li>Any damages arising from your use of or inability to use the Service.</li>
              <li>Any unauthorised access to or alteration of your files or data.</li>
            </ul>
            <p>
              Our total liability to you for any claim arising from or related to these Terms or
              the Service shall not exceed the amount paid by you to us in the twelve (12) months
              preceding the claim — which for a free service is zero (£0 / $0).
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Indemnification ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Indemnification</h2>
          <div className={s.body}>
            <p>
              You agree to indemnify, defend, and hold harmless ToolSnapy and its affiliates from
              and against any claims, liabilities, damages, losses, and expenses (including
              reasonable legal fees) arising out of or in connection with your use of the Service,
              your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Governing Law ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Governing Law</h2>
          <div className={s.body}>
            <p>
              These Terms shall be governed by and construed in accordance with applicable law.
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
              of the relevant courts.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Changes ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Changes to These Terms</h2>
          <div className={s.body}>
            <p>
              We reserve the right to update these Terms at any time. We will update the "Last
              updated" date at the top of this page. Continued use of the Service after any changes
              constitutes your acceptance of the updated Terms.
            </p>
          </div>
        </div>

        <hr className={s.divider} />

        {/* ── Contact ── */}
        <div className={s.section}>
          <h2 className={s.sectionTitle}>Contact Us</h2>
          <div className={s.body}>
            <p>
              For questions about these Terms, contact us at:{" "}
              <a href="mailto:legal@toolsnapy.com">legal@toolsnapy.com</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TermsOfService;
