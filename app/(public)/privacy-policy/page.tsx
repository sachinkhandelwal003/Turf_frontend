 "use client";

import { useState } from "react";

const sections = [
  {
    id: "who-we-are",
    number: "01",
    title: "Who We Are",
    content: (
      <>
        <p>
          This Privacy Policy is published by <strong>GameOn Sports Services Private Limited</strong>{" "}
          ("GameOn", "we", "us", "our"), a company incorporated under the Companies Act, 2013.
        </p>
        <div className="info-grid">
          {[
            ["CIN", "U93290UW2026PTC252581"],
            ["Date of Incorporation", "4 May 2026"],
            ["Registered Office", "KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001, India"],
            ["Email", "support@gameon-india.com"],
            ["Phone", "+91 88961 72818"],
          ].map(([label, value]) => (
            <div className="info-row" key={label}>
              <span className="info-label">{label}</span>
              <span className="info-value">{value}</span>
            </div>
          ))}
        </div>
        <p>
          GameOn operates a Platform that allows users in India to discover, book, and pay for
          sports venues (turfs, courts, grounds, academies, and related facilities), to find and
          host matches with other players, and to engage with sports communities.
        </p>
        <p>
          We are the <strong>data fiduciary</strong> under the Digital Personal Data Protection
          Act, 2023 ("DPDP Act") and the body corporate under the Information Technology Act, 2000
          and the IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or
          Information) Rules, 2011 ("SPDI Rules").
        </p>
        <p>This Privacy Policy is published in compliance with:</p>
        <ul>
          <li>The Information Technology Act, 2000 and rules made thereunder, including the SPDI Rules and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</li>
          <li>The Digital Personal Data Protection Act, 2023 (as and when fully notified, including its operative rules)</li>
          <li>The Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020</li>
        </ul>
        <p className="note">
          This document does not require any digital or physical signature and is a legally binding
          electronic record under the Information Technology Act, 2000.
        </p>
      </>
    ),
  },
  {
    id: "scope",
    number: "02",
    title: "Scope and Acceptance",
    content: (
      <>
        <p>
          By visiting the website, installing or using the GameOn app, or otherwise availing of
          the Platform, you confirm that you have read, understood, and agreed to this Privacy
          Policy and our Terms of Service. If you do not agree to any part of this Policy, please
          do not use the Platform.
        </p>
        <p>This Policy applies to:</p>
        <ul>
          <li>Users who register and book venues, host or join matches, or interact with content</li>
          <li>Venue Partners who list facilities on GameOn</li>
          <li>Visitors to the website who do not create an account</li>
          <li>Any other person who provides personal data to us in connection with the Platform</li>
        </ul>
        <p>This Policy <strong>does not apply</strong> to:</p>
        <ul>
          <li>Third-party websites, apps, or services to which we may link</li>
          <li>Data you provide directly to a Venue Partner outside the Platform</li>
          <li>Information that has been irreversibly anonymised or aggregated and cannot reasonably be linked to you</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-collected",
    number: "03",
    title: "Personal Data We Collect",
    content: (
      <>
        <p>
          We collect only the data that is necessary to operate the Platform, to process your
          bookings, and to comply with applicable law.
        </p>

        <h4>3.1 Data you give us directly</h4>
        <ul>
          <li><strong>Identity data:</strong> Full name, date of birth (to confirm you are 18+ or to obtain parental consent if between 13 and 18), gender (optional), profile photo (optional).</li>
          <li><strong>Contact data:</strong> Mobile phone number (verified by OTP), email address, postal address (only if you ask us to ship or deliver something to you).</li>
          <li><strong>Account credentials:</strong> Encrypted password or social-login token (Google / Apple sign-in); we never store your social provider password.</li>
          <li><strong>Sports & profile data:</strong> Sports you play, skill level, preferred timings, preferred venues, teams or groups you create, match history, ratings and reviews.</li>
          <li><strong>Booking and transaction data:</strong> Venues booked, sport, date, time slot, party size, amount, mode of payment, invoice details, refunds, and cancellation reasons.</li>
          <li><strong>Communications data:</strong> Messages sent through our in-app chat, support tickets, emails, WhatsApp messages, and survey or feedback responses.</li>
          <li><strong>Venue Partner data:</strong> Business name, owner / authorised representative name, PAN, GSTIN (where applicable), bank account details for settlement, photos of the venue, pricing, slot inventory, cancellation rules, and KYC documents we are legally required to verify.</li>
        </ul>

        <h4>3.2 Data we collect automatically</h4>
        <ul>
          <li><strong>Device data:</strong> Device model, OS and version, unique device identifiers (Android Advertising ID, IDFA on iOS, or equivalents), mobile network operator, screen resolution, app version, time-zone, and language.</li>
          <li><strong>Log data:</strong> IP address, login timestamps, session duration, screens viewed, taps and clicks, search queries, crash logs, and diagnostic information.</li>
          <li><strong>Approximate and precise location data:</strong> With your prior in-app permission, we collect your precise GPS location to show you nearby venues, sort venue results by distance, and improve "venues near me" discovery. You can deny or revoke this permission at any time from device settings.</li>
          <li><strong>Cookies and similar technologies (website only):</strong> First-party cookies and local storage to keep you signed in, remember your city, and measure aggregate usage. See Section 11.</li>
        </ul>

        <h4>3.3 Data from phone contacts (optional, with permission)</h4>
        <p>
          If — and only if — you choose to invite friends to GameOn through our in-app "Invite
          friends" feature, we request your permission to read your phone's contact list. We use
          contacts data solely to:
        </p>
        <ul>
          <li>Display your contacts inside the invite screen so you can select whom to invite</li>
          <li>Send invitations (SMS / WhatsApp message) to the specific contacts you choose</li>
          <li>Match your contacts (using phone numbers) with existing GameOn users for "people you may know" suggestions</li>
        </ul>
        <p className="highlight-box">
          We do <strong>not</strong> upload your full contact list to our servers as a continuous sync, sell contact data, share contact data with advertisers, or use contact data for any purpose other than the invite and "people you may know" features.
        </p>

        <h4>3.4 Data we receive from third parties</h4>
        <ul>
          <li><strong>Payment gateway (Razorpay):</strong> Payment status, masked card or UPI identifier (last 4 digits / VPA prefix), gateway transaction ID, refund status. We never see or store your full card number, CVV, UPI PIN, OTP, or netbanking password.</li>
          <li><strong>Identity / social sign-in (Google, Apple):</strong> Your name, email address, profile picture, and a unique provider ID. We do not receive your password.</li>
          <li><strong>Venue Partners:</strong> Booking-related data the Venue Partner records on their end (check-in confirmation, no-show flag, walk-in fees).</li>
          <li><strong>Public sources:</strong> Where required for Venue Partner KYC, publicly available registries (MCA, GST portal, PAN verification utilities).</li>
        </ul>

        <h4>3.5 Sensitive personal data (SPDI)</h4>
        <p>
          Under the SPDI Rules, the following categories are "sensitive personal data or
          information" and we collect them only with your explicit consent and only where necessary:
        </p>
        <ul>
          <li>Passwords (stored only as a salted hash)</li>
          <li>Financial information such as bank account, card, or UPI details (handled by the payment gateway; we receive only masked tokens)</li>
          <li>Physical, physiological, or mental-health information — <em>we do not collect this</em></li>
          <li>Sexual orientation — <em>we do not collect this</em></li>
          <li>Biometric information — <em>we do not collect this</em></li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    number: "04",
    title: "How We Use Your Data",
    content: (
      <>
        <p>
          We will not use your personal data for any new purpose materially different from those
          listed below without first notifying you and, where required, obtaining your fresh consent.
        </p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Purpose</th>
                <th>Examples</th>
                <th>Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Account creation & authentication", "Registering you, OTP login, password reset", "Performance of contract; consent"],
                ["Operating the Platform", "Showing venues, processing bookings, sending confirmations, in-app chat", "Performance of contract"],
                ["Payments and refunds", "Processing payments via Razorpay, refunds, invoices", "Performance of contract; tax law compliance"],
                ["Discovery & personalisation", '"Venues near you", recommended slots, matches you may want to join', "Legitimate interests; consent (precise location)"],
                ["Communications", "Booking confirmations, reminders, OTPs, customer support, transactional SMS / WhatsApp / push", "Performance of contract; consent (for promotional messages)"],
                ["Marketing", "Newsletters, promotional offers, contests, referrals", "Opt-in consent only — you can opt out any time"],
                ["Safety, fraud prevention, security", "Detecting payment fraud, spam, abusive behaviour, fake listings", "Legitimate interests; compliance with law"],
                ["Analytics & product improvement", "Crash reports, feature usage, A/B tests (pseudonymised where possible)", "Legitimate interests"],
                ["Legal & regulatory compliance", "Tax records, lawful government requests, dispute resolution", "Compliance with law"],
              ].map(([purpose, examples, basis]) => (
                <tr key={purpose}>
                  <td><strong>{purpose}</strong></td>
                  <td>{examples}</td>
                  <td>{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "notifications",
    number: "05",
    title: "Push Notifications, SMS, and WhatsApp Messages",
    content: (
      <>
        <p>
          By creating an account, you consent to receive transactional communications necessary
          to operate the service:
        </p>
        <ul>
          <li>Booking confirmations, reminders, cancellation, and refund notifications</li>
          <li>One-time passwords (OTPs) for login and payment verification</li>
          <li>Match invites and chat messages from other users you have interacted with</li>
          <li>Account-security alerts</li>
        </ul>
        <p className="note">
          Transactional communications are part of the service and <strong>cannot be turned off</strong> entirely without deactivating your account.
        </p>
        <p>
          Promotional communications are sent only if you opt in during onboarding or in app
          settings. You can withdraw this consent at any time by:
        </p>
        <ul>
          <li>Toggling off "Promotional notifications" in Settings → Notifications</li>
          <li>Replying STOP to a promotional SMS</li>
          <li>Clicking "Unsubscribe" in any marketing email</li>
          <li>Sending DND requests through the in-app channel selector for WhatsApp</li>
        </ul>
        <p>We comply with the TRAI Telecom Commercial Communications Customer Preference Regulations, 2018 (TCCCPR).</p>
      </>
    ),
  },
  {
    id: "refunds",
    number: "06",
    title: "Cash-at-Venue, Booking Cancellation, and Refund Data",
    content: (
      <>
        <p>
          Where you choose <strong>Cash at Venue</strong> as a payment mode, we collect your
          booking commitment details (name, mobile, venue, slot) but do not process the payment
          through GameOn — the transaction settles directly with the Venue Partner.
        </p>
        <p>
          For prepaid bookings, refund timelines and policies are governed by our Terms of Service
          and the Venue Partner's published cancellation policy. Refund-related data is retained
          for the statutory period required under the Income Tax Act, 1961 and the GST Act, 2017
          — typically <strong>8 years</strong> from the end of the financial year.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    number: "07",
    title: "Sharing of Personal Data",
    content: (
      <>
        <p className="highlight-box">
          <strong>We do not sell your personal data to anyone, ever.</strong>
        </p>
        <ul>
          <li><strong>With Venue Partners:</strong> Your name, mobile number, sport, party size, and slot details for confirmed bookings. Venue Partners are contractually bound to use this data solely for the booking.</li>
          <li><strong>With payment gateways:</strong> Razorpay processes payments and shares transaction outcomes with us.</li>
          <li><strong>With service providers (processors):</strong> Cloud hosting (Amazon Web Services or equivalent India-region servers), analytics and crash reporting (Google Firebase), customer support tooling, transactional SMS and WhatsApp providers, and email delivery providers. All processors are bound by written contracts requiring confidentiality, purpose-limitation, and security controls.</li>
          <li><strong>With law-enforcement and regulators:</strong> Where required by order of a court, tribunal, or competent government authority under applicable law.</li>
          <li><strong>In a corporate transaction:</strong> In a merger, acquisition, financing, restructuring, or sale of assets, your data may be transferred to the successor entity subject to the same protections of this Policy. You will be notified of any such change.</li>
          <li><strong>With your explicit consent:</strong> Any sharing not listed above will be undertaken only after we obtain your specific consent.</li>
        </ul>
        <p className="note">
          We do not share your personal data with advertising networks for cross-site behavioural advertising. We do not run third-party ad SDKs (e.g., Meta Audience Network, Google AdMob) inside the GameOn app at this time.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    number: "08",
    title: "Where Your Data Is Stored, and Cross-Border Transfers",
    content: (
      <>
        <p>
          We store and process your personal data on cloud infrastructure located in{" "}
          <strong>India (AWS Mumbai / Hyderabad regions or equivalent India-region providers)</strong>.
        </p>
        <p>
          Some service providers (e.g., Google Firebase for crash reporting, our
          customer-support and email tooling) may process limited operational data on servers
          outside India. Where such transfer occurs, we ensure that:
        </p>
        <ul>
          <li>It is necessary for the contract or for legitimate business operations</li>
          <li>The receiving party is bound by a written agreement that provides at least the same level of data protection as required under Indian law</li>
          <li>The receiving country is not restricted under Section 16 of the DPDP Act</li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    number: "09",
    title: "Data Retention",
    content: (
      <>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Category of Data</th>
                <th>Retention Period</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Active account data (profile, bookings, communications)", "Throughout the life of your account"],
                ["Inactive accounts (no login for 24 consecutive months)", "Reminder sent; if no login within 30 days, deactivated. Data retained only for legally required durations."],
                ["Transaction and tax records (invoices, refunds, GST data)", "8 years from end of financial year (Section 36, CGST Act)"],
                ["KYC documents of Venue Partners", "8 years from end of business relationship (PMLA)"],
                ["Marketing-consent records and consent withdrawals", "3 years after withdrawal"],
                ["Server logs and crash diagnostics", "90 days, rolling"],
                ["Customer-support tickets", "3 years after closure"],
              ].map(([cat, period]) => (
                <tr key={cat}>
                  <td>{cat}</td>
                  <td>{period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          After the applicable retention period, we delete or irreversibly anonymise your personal
          data, except where retention is required under a legal hold, an ongoing dispute, or a
          request from a regulator.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    number: "10",
    title: "Your Rights",
    content: (
      <>
        <p>
          As a Data Principal under the DPDP Act and the SPDI Rules, you have the following rights,
          exercisable free of charge by writing to{" "}
          <a href="mailto:support@gameon-india.com">support@gameon-india.com</a>:
        </p>
        <ul>
          <li><strong>Right to access:</strong> Obtain a summary of the personal data we hold about you and how we process it.</li>
          <li><strong>Right to correction:</strong> Have inaccurate or incomplete personal data corrected.</li>
          <li><strong>Right to erasure:</strong> Request deletion of your personal data where no longer necessary, subject to our retention obligations under law.</li>
          <li><strong>Right to withdraw consent:</strong> Withdraw any consent at any time. Withdrawal does not affect lawful processing carried out before the withdrawal.</li>
          <li><strong>Right to nominate:</strong> Nominate another individual to exercise these rights on your behalf in the event of your death or incapacity.</li>
          <li><strong>Right to grievance redressal:</strong> Lodge a complaint with our Grievance Officer (see Section 14) and, if unsatisfied, with the Data Protection Board of India once constituted under the DPDP Act.</li>
        </ul>
        <p className="note">
          We respond to requests within <strong>30 days</strong> of receipt (or sooner if required by law). To protect your data, we may need to verify your identity (typically by OTP) before acting on certain requests.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    number: "11",
    title: "Cookies and Similar Technologies (Website)",
    content: (
      <>
        <p>Our website uses:</p>
        <ul>
          <li><strong>Strictly necessary cookies:</strong> to keep you signed in, maintain booking state, and remember your city. These cannot be turned off.</li>
          <li><strong>Analytics cookies:</strong> Google Analytics to count visits and measure traffic (aggregated, non-identifying).</li>
          <li><strong>Preference cookies:</strong> to remember language, time-zone, and consent choices.</li>
        </ul>
        <p className="note">
          We do not use third-party advertising cookies, retargeting pixels, or cross-site tracking cookies on the website at this time. You can clear cookies from your browser settings at any time; some site features may not work as expected if you do.
        </p>
      </>
    ),
  },
  {
    id: "children",
    number: "12",
    title: "Children's Privacy",
    content: (
      <>
        <p>
          The Platform is intended for users <strong>aged 18 and above</strong>. We do not knowingly
          collect personal data from children under 18 without verifiable parental consent.
        </p>
        <p>
          If you are between 13 and 18, you may use the Platform only with the consent and
          supervision of a parent or legal guardian, who must register the account on your behalf
          and accept this Policy. Under the DPDP Act, we are required to obtain verifiable
          parental consent before processing data of a person under 18 and do not engage in
          behavioural tracking or targeted advertising directed at such persons.
        </p>
        <p>
          If you believe a child under 18 has provided us personal data without verifiable parental
          consent, please contact us at{" "}
          <a href="mailto:support@gameon-india.com">support@gameon-india.com</a> and we will delete
          such data promptly.
        </p>
      </>
    ),
  },
  {
    id: "security",
    number: "13",
    title: "Security",
    content: (
      <>
        <p>We follow industry-accepted security practices, including:</p>
        <ul>
          <li>HTTPS / TLS 1.2+ encryption of all data in transit</li>
          <li>Encryption at rest of sensitive fields (passwords, financial tokens)</li>
          <li>Role-based access controls and the principle of least privilege</li>
          <li>Annual security reviews and periodic vulnerability scans</li>
          <li>Logging and monitoring of access to production systems</li>
          <li>Reasonable Security Practices and Procedures as required under Section 8 of the SPDI Rules (we follow the ISO/IEC 27001 framework or an equivalent international standard)</li>
        </ul>
        <p>
          In the event of a personal data breach likely to result in significant harm, we will notify
          the Data Protection Board (when constituted) and affected Data Principals as required
          under Section 8(6) of the DPDP Act, within the prescribed timelines.
        </p>
        <p className="note">
          No method of transmission or electronic storage is 100% secure. We commit to commercially reasonable measures.
        </p>
      </>
    ),
  },
  {
    id: "grievance",
    number: "14",
    title: "Grievance Officer",
    content: (
      <>
        <p>
          In accordance with the Information Technology Act, 2000, the SPDI Rules, the Intermediary
          Guidelines, 2021, and the Consumer Protection (E-Commerce) Rules, 2020:
        </p>
        <div className="info-grid">
          {[
            ["Name", "Shivam Tiwari"],
            ["Designation", "Founder & Chief Executive Officer, Grievance Officer"],
            ["Address", "KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001"],
            ["Email", "support@gameon-india.com"],
            ["Phone", "+91 88961 72818"],
            ["Hours", "Monday to Friday, 10:00 AM – 6:00 PM IST (excluding public holidays)"],
          ].map(([label, value]) => (
            <div className="info-row" key={label}>
              <span className="info-label">{label}</span>
              <span className="info-value">{value}</span>
            </div>
          ))}
        </div>
        <p>
          The Grievance Officer will <strong>acknowledge your complaint within 48 hours</strong> of
          receipt and resolve it within <strong>15 days</strong> (or 1 month for sensitive personal
          data grievances, per the SPDI Rules).
        </p>
      </>
    ),
  },
  {
    id: "changes",
    number: "15",
    title: "Changes to This Privacy Policy",
    content: (
      <>
        <p>
          The "Last Updated" date at the top of this page always shows when this Policy was last
          revised. For material changes (new categories of data collected, new purposes, new third
          parties), we notify you via:
        </p>
        <ul>
          <li>An in-app notification on your next sign-in</li>
          <li>An email to your registered email address</li>
          <li>A prominent notice on the website homepage for at least 14 days</li>
        </ul>
        <p>
          Your continued use of the Platform after such notice constitutes acceptance of the revised Policy.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    number: "16",
    title: "Governing Law and Jurisdiction",
    content: (
      <>
        <p>
          This Privacy Policy is governed by the <strong>laws of India</strong>. Any dispute
          arising out of or in connection with this Policy is subject to the exclusive jurisdiction
          of the competent courts at <strong>Ghaziabad, Uttar Pradesh, India</strong>, without
          prejudice to any rights you may have under applicable consumer-protection laws.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    number: "17",
    title: "Contact Us",
    content: (
      <>
        <div className="info-grid">
          {[
            ["Email", "support@gameon-india.com"],
            ["Postal", "GameOn Sports Services Private Limited, KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001"],
            ["Phone", "+91 88961 72818"],
            ["Website", "www.gameon-india.com"],
          ].map(([label, value]) => (
            <div className="info-row" key={label}>
              <span className="info-label">{label}</span>
              <span className="info-value">{value}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

const appendices = [
  {
    id: "appendix-a",
    title: "Appendix A — Play Store Data Safety Disclosure",
    content: (
      <>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Collected?</th>
                <th>Shared with Third Parties?</th>
                <th>Purpose</th>
                <th>Optional / Required</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Name", "Yes", "Shared with Venue Partner for confirmed bookings", "Account management; booking fulfilment", "Required"],
                ["Email address", "Yes", "No", "Account management; communications", "Required"],
                ["Phone number", "Yes", "Shared with Venue Partner for confirmed bookings", "OTP verification; booking fulfilment", "Required"],
                ["User IDs (account ID)", "Yes", "No", "Account functionality", "Required"],
                ["Address", "Yes (optional)", "No", "Communications, where you request", "Optional"],
                ["Approximate location", "Yes", "No", "App functionality (city detection)", "Optional"],
                ["Precise location", "Yes (with permission)", "No", 'App functionality ("venues near me")', "Optional"],
                ["Phone contacts", "Yes (with permission, for invites)", "No (only contacts you choose to invite receive a message)", 'App functionality (Invite friends; "people you may know")', "Optional"],
                ["Photos (profile picture)", "Yes (optional upload)", "No", "Personalisation", "Optional"],
                ["App interactions", "Yes", "No", "Analytics; app functionality", "Required"],
                ["In-app search history", "Yes", "No", "App functionality", "Required"],
                ["Crash logs", "Yes", "Processed by Google Firebase (processor only)", "App stability", "Required"],
                ["Diagnostics", "Yes", "Processed by Google Firebase (processor only)", "App stability", "Required"],
                ["Payment info (masked tokens only)", "Yes", "Processed by Razorpay (processor only)", "Payment processing", "Required for prepaid bookings"],
                ["Purchase history", "Yes", "No", "Account management", "Required"],
                ["Other financial info (full card / CVV / UPI PIN)", "No — never collected", "—", "—", "—"],
                ["Health & fitness data", "No", "—", "—", "—"],
                ["Sensitive personal info (race, religion, political opinion, sexual orientation, biometric, genetic)", "No", "—", "—", "—"],
              ].map(([type, collected, shared, purpose, optional]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td>{collected}</td>
                  <td>{shared}</td>
                  <td>{purpose}</td>
                  <td>{optional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p><strong>Security practices declared for Play Store:</strong></p>
        <ul>
          <li>Data is encrypted in transit (HTTPS / TLS 1.2+).</li>
          <li>You can request that data be deleted (in-app + via support@gameon-india.com).</li>
          <li>Data collection and security practices follow Google Play's Families Policy where applicable.</li>
        </ul>
      </>
    ),
  },
  {
    id: "appendix-b",
    title: "Appendix B — Apple App Store Privacy Nutrition Label",
    content: (
      <>
        <ul>
          <li><strong>Data Used to Track You:</strong> None. GameOn does not track users across other companies' apps and websites.</li>
          <li><strong>Data Linked to You:</strong> Name, Email, Phone Number, User ID, Address (optional), Precise Location (optional), Coarse Location, Contacts (with permission, invite flow only), Photos (profile, optional), Purchase History, Payment Info (masked tokens only), App Interactions, Search History, Customer Support communications, Crash Data, Performance Data, Diagnostics.</li>
          <li><strong>Data Not Linked to You:</strong> None at launch.</li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const allSections = [...sections];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        :root {
          --bg: #0a0f0a;
          --surface: #111711;
          --surface2: #171f17;
          --border: #1e2b1e;
          --border-bright: #2d4a2d;
          --accent: #4cff72;
          --accent-dim: #2a8c3f;
          --accent-muted: rgba(76, 255, 114, 0.08);
          --text: #e8f0e8;
          --text-secondary: #8aab8a;
          --text-muted: #4a6b4a;
          --number: #2d4a2d;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pp-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          font-size: 15px;
          line-height: 1.7;
        }

        /* ── Header ── */
        .pp-header {
          border-bottom: 1px solid var(--border);
          padding: 48px 0 40px;
          position: relative;
          overflow: hidden;
        }
        .pp-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 100% at 50% -20%, rgba(76,255,114,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .pp-header-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
        }
        .pp-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }
        .pp-logo-icon {
          width: 36px;
          height: 36px;
          background: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .pp-logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: var(--text);
          letter-spacing: -0.02em;
        }
        .pp-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 6vw, 52px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: var(--text);
          margin-bottom: 20px;
        }
        .pp-title span {
          color: var(--accent);
        }
        .pp-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .pp-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pp-meta-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }

        /* ── Layout ── */
        .pp-body {
          max-width: 860px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        /* ── TOC ── */
        .pp-toc {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px 32px;
          margin-bottom: 48px;
        }
        .pp-toc-title {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .pp-toc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 4px;
        }
        .pp-toc-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 6px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13.5px;
          transition: all 0.15s ease;
          cursor: pointer;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
        }
        .pp-toc-link:hover {
          background: var(--accent-muted);
          color: var(--accent);
        }
        .pp-toc-num {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          min-width: 24px;
        }

        /* ── Sections ── */
        .pp-section {
          margin-bottom: 8px;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .pp-section.open {
          border-color: var(--border-bright);
        }
        .pp-section-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 22px 28px;
          cursor: pointer;
          background: var(--surface);
          transition: background 0.15s ease;
          user-select: none;
        }
        .pp-section-header:hover {
          background: var(--surface2);
        }
        .pp-section.open .pp-section-header {
          background: var(--surface2);
          border-bottom: 1px solid var(--border);
        }
        .pp-section-num {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
          min-width: 28px;
        }
        .pp-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--text);
          flex: 1;
        }
        .pp-chevron {
          color: var(--text-muted);
          transition: transform 0.25s ease, color 0.15s ease;
          font-size: 18px;
          line-height: 1;
        }
        .pp-section.open .pp-chevron {
          transform: rotate(180deg);
          color: var(--accent);
        }
        .pp-section-body {
          display: none;
          padding: 28px 28px 28px 76px;
          background: var(--bg);
        }
        .pp-section.open .pp-section-body {
          display: block;
        }

        /* ── Content styles ── */
        .pp-section-body p {
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .pp-section-body p:last-child { margin-bottom: 0; }
        .pp-section-body strong { color: var(--text); font-weight: 500; }
        .pp-section-body em { color: var(--text-muted); font-style: italic; }
        .pp-section-body a { color: var(--accent); text-decoration: none; }
        .pp-section-body a:hover { text-decoration: underline; }

        .pp-section-body h4 {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--accent-dim);
          margin: 24px 0 12px;
        }
        .pp-section-body h4:first-child { margin-top: 0; }

        .pp-section-body ul {
          list-style: none;
          padding: 0;
          margin-bottom: 14px;
        }
        .pp-section-body ul li {
          color: var(--text-secondary);
          padding: 5px 0 5px 18px;
          position: relative;
          font-size: 14.5px;
        }
        .pp-section-body ul li::before {
          content: '—';
          position: absolute;
          left: 0;
          color: var(--text-muted);
          font-size: 12px;
          top: 7px;
        }

        .info-grid {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          margin: 16px 0;
        }
        .info-row {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 16px;
          padding: 11px 16px;
          border-bottom: 1px solid var(--border);
          align-items: start;
        }
        .info-row:last-child { border-bottom: none; }
        .info-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding-top: 2px;
        }
        .info-value {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .highlight-box {
          background: rgba(76, 255, 114, 0.05);
          border-left: 3px solid var(--accent);
          padding: 14px 16px;
          border-radius: 0 6px 6px 0;
          margin: 16px 0;
          color: var(--text) !important;
        }

        .note {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 12px 16px;
          font-size: 13.5px !important;
          color: var(--text-muted) !important;
        }

        /* ── Tables ── */
        .table-wrapper {
          overflow-x: auto;
          margin: 16px 0;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
          min-width: 500px;
        }
        thead tr {
          background: var(--surface2);
        }
        th {
          padding: 11px 14px;
          text-align: left;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 11px 14px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: var(--surface); }

        /* ── Appendices ── */
        .pp-appendix {
          margin-top: 48px;
        }
        .pp-appendix-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
        }
        .pp-appendix-section {
          margin-bottom: 8px;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .pp-appendix-section.open { border-color: var(--border-bright); }
        .pp-appendix-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          cursor: pointer;
          background: var(--surface);
          user-select: none;
          transition: background 0.15s ease;
        }
        .pp-appendix-header:hover { background: var(--surface2); }
        .pp-appendix-section.open .pp-appendix-header {
          background: var(--surface2);
          border-bottom: 1px solid var(--border);
        }
        .pp-appendix-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
        }
        .pp-appendix-body {
          display: none;
          padding: 28px;
          background: var(--bg);
        }
        .pp-appendix-section.open .pp-appendix-body { display: block; }
        .pp-appendix-body p { color: var(--text-secondary); margin-bottom: 12px; }
        .pp-appendix-body ul { list-style: none; padding: 0; margin-bottom: 12px; }
        .pp-appendix-body ul li {
          color: var(--text-secondary);
          padding: 5px 0 5px 18px;
          position: relative;
          font-size: 14px;
        }
        .pp-appendix-body ul li::before {
          content: '—';
          position: absolute;
          left: 0;
          color: var(--text-muted);
          font-size: 12px;
          top: 7px;
        }
        .pp-appendix-body strong { color: var(--text); font-weight: 500; }

        /* ── Footer ── */
        .pp-footer {
          border-top: 1px solid var(--border);
          padding: 32px 0;
          text-align: center;
        }
        .pp-footer-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px;
          color: var(--text-muted);
          font-size: 13px;
        }
        .pp-footer-inner a { color: var(--accent-dim); text-decoration: none; }

        @media (max-width: 600px) {
          .pp-section-body { padding: 20px; }
          .info-row { grid-template-columns: 1fr; gap: 4px; }
          .pp-toc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="pp-root">
        {/* Header */}
        <header className="pp-header">
          <div className="pp-header-inner">
            <div className="pp-logo">
              <div className="pp-logo-icon">⚽</div>
              <span className="pp-logo-name">GameOn</span>
            </div>
            <h1 className="pp-title">Privacy <span>Policy</span></h1>
            <div className="pp-meta">
              <div className="pp-meta-item">
                <div className="pp-meta-dot" />
                Effective: 4 May 2026
              </div>
              <div className="pp-meta-item">
                <div className="pp-meta-dot" />
                Last Updated: 20 May 2026
              </div>
              <div className="pp-meta-item">
                <div className="pp-meta-dot" />
                Applies to: gameon-india.com &amp; mobile apps
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="pp-body">
          {/* TOC */}
          <nav className="pp-toc">
            <div className="pp-toc-title">Table of Contents</div>
            <div className="pp-toc-grid">
              {sections.map((s) => (
                <button
                  key={s.id}
                  className="pp-toc-link"
                  onClick={() =>
                    setActiveSection((prev) => (prev === s.id ? null : s.id))
                  }
                >
                  <span className="pp-toc-num">{s.number}</span>
                  {s.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Sections */}
          {sections.map((s) => (
            <div
              key={s.id}
              className={`pp-section${activeSection === s.id ? " open" : ""}`}
            >
              <div
                className="pp-section-header"
                onClick={() =>
                  setActiveSection((prev) => (prev === s.id ? null : s.id))
                }
                role="button"
                aria-expanded={activeSection === s.id}
              >
                <span className="pp-section-num">{s.number}</span>
                <span className="pp-section-title">{s.title}</span>
                <span className="pp-chevron">▾</span>
              </div>
              <div className="pp-section-body">{s.content}</div>
            </div>
          ))}

          {/* Appendices */}
          <div className="pp-appendix">
            <div className="pp-appendix-label">Appendices</div>
            {appendices.map((a) => (
              <div
                key={a.id}
                className={`pp-appendix-section${activeSection === a.id ? " open" : ""}`}
              >
                <div
                  className="pp-appendix-header"
                  onClick={() =>
                    setActiveSection((prev) => (prev === a.id ? null : a.id))
                  }
                  role="button"
                  aria-expanded={activeSection === a.id}
                >
                  <span className="pp-appendix-title">{a.title}</span>
                  <span className="pp-chevron">▾</span>
                </div>
                <div className="pp-appendix-body">{a.content}</div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="pp-footer">
          <div className="pp-footer-inner">
            <p>
              © 2026 GameOn Sports Services Private Limited · CIN: U93290UW2026PTC252581
              &nbsp;·&nbsp;
              <a href="mailto:support@gameon-india.com">support@gameon-india.com</a>
              &nbsp;·&nbsp;
              <a href="tel:+918896172818">+91 88961 72818</a>
            </p>
            <p style={{ marginTop: "8px" }}>
              Registered Office: KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, UP — 201001
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}