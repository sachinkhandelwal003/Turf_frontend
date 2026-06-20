"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Calendar, MapPin, Mail, Phone, ChevronRight } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    id: "who-we-are",
    number: "01",
    title: "Who We Are",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 leading-relaxed text-lg">
          This Privacy Policy is published by <strong className="text-gray-900">GameOn Sports Services Private Limited</strong>{" "}
          (&quot;GameOn&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a company incorporated under the Companies Act, 2013.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
          {[
            ["CIN", "U93290UW2026PTC252581"],
            ["Date of Incorporation", "4 May 2026"],
            ["Registered Office", "KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001, India"],
            ["Email", "support@gameon-india.com"],
            ["Phone", "+91 88961 72818"],
          ].map(([label, value]) => (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100" key={label}>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</span>
              <span className="block text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-600 leading-relaxed">
          GameOn operates a Platform that allows users in India to discover, book, and pay for
          sports venues (turfs, courts, grounds, academies, and related facilities), to find and
          host matches with other players, and to engage with sports communities.
        </p>
        <p className="text-gray-600 leading-relaxed">
          We are the <strong className="text-gray-900">data fiduciary</strong> under the Digital Personal Data Protection
          Act, 2023 (&quot;DPDP Act&quot;) and the body corporate under the Information Technology Act, 2000
          and the IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or
          Information) Rules, 2011 (&quot;SPDI Rules&quot;).
        </p>
        <p className="text-gray-600 font-medium mt-6">This Privacy Policy is published in compliance with:</p>
        <ul className="list-none space-y-3">
          {[
            "The Information Technology Act, 2000 and rules made thereunder, including the SPDI Rules and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021",
            "The Digital Personal Data Protection Act, 2023 (as and when fully notified, including its operative rules)",
            "The Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-600">
              <ChevronRight className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-r-2xl mt-8 text-emerald-900 font-medium text-sm italic">
          This document does not require any digital or physical signature and is a legally binding
          electronic record under the Information Technology Act, 2000.
        </div>
      </div>
    ),
  },
  {
    id: "scope",
    number: "02",
    title: "Scope and Acceptance",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          By visiting the website, installing or using the GameOn app, or otherwise availing of
          the Platform, you confirm that you have read, understood, and agreed to this Privacy
          Policy and our Terms of Service. If you do not agree to any part of this Policy, please
          do not use the Platform.
        </p>
        <p className="font-medium text-gray-900 pt-4">This Policy applies to:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
          <li>Users who register and book venues, host or join matches, or interact with content</li>
          <li>Venue Partners who list facilities on GameOn</li>
          <li>Visitors to the website who do not create an account</li>
          <li>Any other person who provides personal data to us in connection with the Platform</li>
        </ul>
        <p className="font-medium text-gray-900 pt-4">This Policy <strong className="text-red-500">does not apply</strong> to:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-red-400">
          <li>Third-party websites, apps, or services to which we may link</li>
          <li>Data you provide directly to a Venue Partner outside the Platform</li>
          <li>Information that has been irreversibly anonymised or aggregated and cannot reasonably be linked to you</li>
        </ul>
      </div>
    ),
  },
  {
    id: "data-collected",
    number: "03",
    title: "Personal Data We Collect",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed">
        <p className="text-lg">
          We collect only the data that is necessary to operate the Platform, to process your
          bookings, and to comply with applicable law.
        </p>

        <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <h4 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs">3.1</span> 
            Data you give us directly
          </h4>
          <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
            <li><strong className="text-gray-900">Identity data:</strong> Full name, date of birth (to confirm you are 18+ or to obtain parental consent if between 13 and 18), gender (optional), profile photo (optional).</li>
            <li><strong className="text-gray-900">Contact data:</strong> Mobile phone number (verified by OTP), email address, postal address (only if you ask us to ship or deliver something to you).</li>
            <li><strong className="text-gray-900">Account credentials:</strong> Encrypted password or social-login token (Google / Apple sign-in); we never store your social provider password.</li>
            <li><strong className="text-gray-900">Sports & profile data:</strong> Sports you play, skill level, preferred timings, preferred venues, teams or groups you create, match history, ratings and reviews.</li>
            <li><strong className="text-gray-900">Booking and transaction data:</strong> Venues booked, sport, date, time slot, party size, amount, mode of payment, invoice details, refunds, and cancellation reasons.</li>
            <li><strong className="text-gray-900">Communications data:</strong> Messages sent through our in-app chat, support tickets, emails, WhatsApp messages, and survey or feedback responses.</li>
            <li><strong className="text-gray-900">Venue Partner data:</strong> Business name, owner / authorised representative name, PAN, GSTIN (where applicable), bank account details for settlement, photos of the venue, pricing, slot inventory, cancellation rules, and KYC documents we are legally required to verify.</li>
          </ul>
        </div>

        <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <h4 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs">3.2</span> 
            Data we collect automatically
          </h4>
          <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
            <li><strong className="text-gray-900">Device data:</strong> Device model, OS and version, unique device identifiers (Android Advertising ID, IDFA on iOS, or equivalents), mobile network operator, screen resolution, app version, time-zone, and language.</li>
            <li><strong className="text-gray-900">Log data:</strong> IP address, login timestamps, session duration, screens viewed, taps and clicks, search queries, crash logs, and diagnostic information.</li>
            <li><strong className="text-gray-900">Approximate and precise location data:</strong> With your prior in-app permission, we collect your precise GPS location to show you nearby venues, sort venue results by distance, and improve &quot;venues near me&quot; discovery. You can deny or revoke this permission at any time from device settings.</li>
            <li><strong className="text-gray-900">Cookies and similar technologies (website only):</strong> First-party cookies and local storage to keep you signed in, remember your city, and measure aggregate usage. See Section 12.</li>
          </ul>
        </div>

        <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <h4 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs">3.3</span> 
            Data from phone contacts (optional, with permission)
          </h4>
          <p>
            If — and only if — you choose to invite friends to GameOn through our in-app &quot;Invite
            friends&quot; feature, we request your permission to read your phone&apos;s contact list. We use
            contacts data solely to:
          </p>
          <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
            <li>Display your contacts inside the invite screen so you can select whom to invite</li>
            <li>Send invitations (SMS / WhatsApp message) to the specific contacts you choose</li>
            <li>Match your contacts (using phone numbers) with existing GameOn users for &quot;people you may know&quot; suggestions</li>
          </ul>
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl mt-4 text-emerald-900 font-medium text-sm">
            We do <strong className="text-emerald-950 font-black">not</strong> upload your full contact list to our servers as a continuous sync, sell contact data, share contact data with advertisers, or use contact data for any purpose other than the invite and &quot;people you may know&quot; features.
          </div>
        </div>

        <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <h4 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs">3.4</span> 
            Data we receive from third parties
          </h4>
          <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
            <li><strong className="text-gray-900">Payment gateway (Razorpay):</strong> Payment status, masked card or UPI identifier (last 4 digits / VPA prefix), gateway transaction ID, refund status. We never see or store your full card number, CVV, UPI PIN, OTP, or netbanking password.</li>
            <li><strong className="text-gray-900">Identity / social sign-in (Google, Apple):</strong> Your name, email address, profile picture, and a unique provider ID. We do not receive your password.</li>
            <li><strong className="text-gray-900">Venue Partners:</strong> Booking-related data the Venue Partner records on their end (check-in confirmation, no-show flag, walk-in fees).</li>
            <li><strong className="text-gray-900">Public sources:</strong> Where required for Venue Partner KYC, publicly available registries (MCA, GST portal, PAN verification utilities).</li>
          </ul>
        </div>

        <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <h4 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs">3.5</span> 
            Sensitive personal data (SPDI)
          </h4>
          <p>
            Under the SPDI Rules, the following categories are &quot;sensitive personal data or
            information&quot; and we collect them only with your explicit consent and only where necessary:
          </p>
          <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
            <li>Passwords (stored only as a salted hash)</li>
            <li>Financial information such as bank account, card, or UPI details (handled by the payment gateway; we receive only masked tokens)</li>
            <li>Physical, physiological, or mental-health information — <em className="text-gray-400">we do not collect this</em></li>
            <li>Sexual orientation — <em className="text-gray-400">we do not collect this</em></li>
            <li>Biometric information — <em className="text-gray-400">we do not collect this</em></li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    number: "04",
    title: "How We Use Your Data",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <p>
          We will not use your personal data for any new purpose materially different from those
          listed below without first notifying you and, where required, obtaining your fresh consent.
        </p>
        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Purpose</th>
                <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Examples</th>
                <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Legal Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
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
              ].map(([purpose, examples, basis], i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{purpose}</td>
                  <td className="px-6 py-4">{examples}</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/50">{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: "notifications",
    number: "05",
    title: "Push Notifications, SMS, and WhatsApp Messages",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          By creating an account, you consent to receive transactional communications necessary
          to operate the service:
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
          <li>Booking confirmations, reminders, cancellation, and refund notifications</li>
          <li>One-time passwords (OTPs) for login and payment verification</li>
          <li>Match invites and chat messages from other users you have interacted with</li>
          <li>Account-security alerts</li>
        </ul>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-700 font-medium">
          Transactional communications are part of the service and <strong className="text-gray-900">cannot be turned off</strong> entirely without deactivating your account.
        </div>
        <p className="pt-4">
          Promotional communications are sent only if you opt in during onboarding or in app
          settings. You can withdraw this consent at any time by:
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
          <li>Toggling off &quot;Promotional notifications&quot; in Settings → Notifications</li>
          <li>Replying STOP to a promotional SMS</li>
          <li>Clicking &quot;Unsubscribe&quot; in any marketing email</li>
          <li>Sending DND requests through the in-app channel selector for WhatsApp</li>
        </ul>
        <p className="text-sm italic text-gray-400 mt-4">We comply with the TRAI Telecom Commercial Communications Customer Preference Regulations, 2018 (TCCCPR).</p>
      </div>
    ),
  },
  {
    id: "refunds",
    number: "06",
    title: "Cash-at-Venue, Booking Cancellation, and Refund Data",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          Where you choose <strong className="text-gray-900">Cash at Venue</strong> as a payment mode, we collect your
          booking commitment details (name, mobile, venue, slot) but do not process the payment
          through GameOn — the transaction settles directly with the Venue Partner.
        </p>
        <p>
          For prepaid bookings, refund timelines and policies are governed by our Terms of Service
          and the Venue Partner&apos;s published cancellation policy. Refund-related data is retained
          for the statutory period required under the Income Tax Act, 1961 and the GST Act, 2017
          — typically <strong className="text-gray-900">8 years</strong> from the end of the financial year.
        </p>
      </div>
    ),
  },
  {
    id: "sharing",
    number: "07",
    title: "Sharing of Personal Data",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg shadow-emerald-200 font-bold text-lg text-center">
          We do not sell your personal data to anyone, ever.
        </div>
        <ul className="space-y-4">
          {[
            { title: "With Venue Partners", desc: "Your name, mobile number, sport, party size, and slot details for confirmed bookings. Venue Partners are contractually bound to use this data solely for the booking." },
            { title: "With payment gateways", desc: "Razorpay processes payments and shares transaction outcomes with us." },
            { title: "With service providers (processors)", desc: "Cloud hosting (Amazon Web Services or equivalent India-region servers), analytics and crash reporting (Google Firebase), customer support tooling, transactional SMS and WhatsApp providers, and email delivery providers. All processors are bound by written contracts requiring confidentiality, purpose-limitation, and security controls." },
            { title: "With law-enforcement and regulators", desc: "Where required by order of a court, tribunal, or competent government authority under applicable law." },
            { title: "In a corporate transaction", desc: "In a merger, acquisition, financing, restructuring, or sale of assets, your data may be transferred to the successor entity subject to the same protections of this Policy. You will be notified of any such change." },
            { title: "With your explicit consent", desc: "Any sharing not listed above will be undertaken only after we obtain your specific consent." }
          ].map((item, i) => (
            <li key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-8 h-8 shrink-0 bg-white rounded-full flex items-center justify-center font-bold text-emerald-600 shadow-sm">{i+1}</div>
              <div>
                <strong className="text-gray-900 block mb-1">{item.title}</strong>
                <span className="text-sm">{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm bg-gray-100 p-4 rounded-xl text-gray-500 italic">
          We do not share your personal data with advertising networks for cross-site behavioural advertising. We do not run third-party ad SDKs (e.g., Meta Audience Network, Google AdMob) inside the GameOn app at this time.
        </p>
      </div>
    ),
  },
  {
    id: "storage",
    number: "08",
    title: "Where Your Data Is Stored, and Cross-Border Transfers",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          We store and process your personal data on cloud infrastructure located in{" "}
          <strong className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">India (AWS Mumbai / Hyderabad regions or equivalent India-region providers)</strong>.
        </p>
        <p>
          Some service providers (e.g., Google Firebase for crash reporting, our
          customer-support and email tooling) may process limited operational data on servers
          outside India. Where such transfer occurs, we ensure that:
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
          <li>It is necessary for the contract or for legitimate business operations</li>
          <li>The receiving party is bound by a written agreement that provides at least the same level of data protection as required under Indian law</li>
          <li>The receiving country is not restricted under Section 16 of the DPDP Act</li>
        </ul>
      </div>
    ),
  },
  {
    id: "retention",
    number: "09",
    title: "Data Retention",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Category of Data</th>
                <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Retention Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {[
                ["Active account data (profile, bookings, communications)", "Throughout the life of your account"],
                ["Inactive accounts (no login for 24 consecutive months)", "Reminder sent; if no login within 30 days, deactivated. Data retained only for legally required durations."],
                ["Transaction and tax records (invoices, refunds, GST data)", "8 years from end of financial year (Section 36, CGST Act)"],
                ["KYC documents of Venue Partners", "8 years from end of business relationship (PMLA)"],
                ["Marketing-consent records and consent withdrawals", "3 years after withdrawal"],
                ["Server logs and crash diagnostics", "90 days, rolling"],
                ["Customer-support tickets", "3 years after closure"],
              ].map(([cat, period], i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{cat}</td>
                  <td className="px-6 py-4 text-gray-600">{period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="bg-gray-50 p-4 rounded-xl text-sm italic">
          After the applicable retention period, we delete or irreversibly anonymise your personal
          data, except where retention is required under a legal hold, an ongoing dispute, or a
          request from a regulator.
        </p>
      </div>
    ),
  },
  {
    id: "your-rights",
    number: "10",
    title: "Your Rights",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          As a Data Principal under the DPDP Act and the SPDI Rules, you have the following rights,
          exercisable free of charge by writing to{" "}
          <a href="mailto:support@gameon-india.com" className="text-blue-600 font-bold hover:underline">support@gameon-india.com</a>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {[
            { title: "Right to access", desc: "Obtain a summary of the personal data we hold about you and how we process it." },
            { title: "Right to correction", desc: "Have inaccurate or incomplete personal data corrected." },
            { title: "Right to erasure", desc: "Request deletion of your personal data where no longer necessary, subject to our retention obligations." },
            { title: "Right to withdraw consent", desc: "Withdraw any consent at any time. Does not affect lawful processing carried out before withdrawal." },
            { title: "Right to nominate", desc: "Nominate another individual to exercise these rights on your behalf in the event of death or incapacity." },
            { title: "Right to grievance redressal", desc: "Lodge a complaint with our Grievance Officer and subsequently with the Data Protection Board." }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
              <strong className="block text-gray-900 mb-2">{item.title}</strong>
              <span className="text-sm text-gray-500">{item.desc}</span>
            </div>
          ))}
        </div>
        <p className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm text-emerald-800 mt-4">
          We respond to requests within <strong className="font-bold">30 days</strong> of receipt (or sooner if required by law). To protect your data, we may need to verify your identity (typically by OTP) before acting on certain requests.
        </p>
      </div>
    ),
  },
  {
    id: "account-deletion",
    number: "11",
    title: "Account Deletion",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed">
        <p>
          You have the right to delete your GameOn account at any time. This section describes — in compliance with the Google Play Store and Apple App Store policies on account deletion — exactly how to request deletion, what data we delete, what data we are legally required to retain, and on what timeline.
        </p>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.1 How to request account deletion</h4>
          <p className="mb-3">You may request account deletion through any of the following channels:</p>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm mb-3">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs w-1/4">Channel</th>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">How</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">In-app</td>
                  <td className="px-6 py-4">Open the GameOn app → Profile → Settings → Account → Delete Account → confirm.</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">Web</td>
                  <td className="px-6 py-4">Visit <a href="http://www.gameon-india.com/delete-account" className="text-blue-600 hover:underline">www.gameon-india.com/delete-account</a> — submit the form using your registered mobile number → confirm the OTP.</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">Email</td>
                  <td className="px-6 py-4">Email support@gameon-india.com from your registered email address with the subject line &quot;Delete my account&quot;. We will respond with an OTP-based verification step.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm italic text-gray-500">The web URL above is publicly accessible without logging in, in compliance with the Google Play Store Account Deletion requirements.</p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.2 Verification</h4>
          <p>Before processing any deletion request, we will verify that you are the legitimate account owner — typically by sending a one-time password (OTP) to your registered mobile number or email address. This protects your account against unauthorised deletion by another person who may have temporary access to your device. Verification is normally completed within 24 hours of your request.</p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.3 What we delete</h4>
          <p className="mb-3">Upon verification, we permanently delete the following categories of your personal data, from active production systems within 7 days, and from all rolling backups within 30 days:</p>
          <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
            <li><strong className="text-gray-900">Profile data</strong> — your name, date of birth, gender, profile photograph, sports of interest, skill level, preferred timings, preferred venues, captain badges, and any saved-favourites lists.</li>
            <li><strong className="text-gray-900">Contact data</strong> — your mobile number, email address, postal address (if any), and saved emergency-contact details.</li>
            <li><strong className="text-gray-900">Account credentials</strong> — your password (stored only as a salted hash), Google / Apple social-login tokens, and authentication session tokens.</li>
            <li><strong className="text-gray-900">Communications data</strong> — your in-app chat messages, customer-support tickets, in-app feedback, and survey responses, except where a ticket is the subject of a legal hold or an ongoing dispute.</li>
            <li><strong className="text-gray-900">Device data</strong> — push-notification tokens, device identifiers, IDFA / Android Advertising ID associated with your account.</li>
            <li><strong className="text-gray-900">Behavioural data</strong> — in-app search history, browse history, recommendation signals, A/B-test bucketing.</li>
            <li><strong className="text-gray-900">Phone contacts data</strong> (if previously granted) — any matched contacts cached against your account.</li>
            <li><strong className="text-gray-900">Location data</strong> — precise GPS coordinates and city/locality stored against your account.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.4 What we anonymise (rather than delete)</h4>
          <p className="mb-3">The following are anonymised — your personally identifying information is removed, but the underlying record is preserved with no link to you:</p>
          <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
            <li><strong className="text-gray-900">Reviews and ratings</strong> you have posted about venues. The review content stays attached to the venue (so future players continue to benefit from the feedback) but with the author identifier removed and replaced with &quot;Former GameOn user.&quot; This is standard practice across rating platforms and is consistent with venue owners&apos; contractual right to keep aggregated feedback on their listings.</li>
            <li><strong className="text-gray-900">Aggregated and de-identified analytics</strong> that have already been irreversibly aggregated before your deletion request (for example, &quot;300 bookings in Saket on Saturday evening&quot;) — these cannot be reversed and remain in our reporting.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.5 What we are legally required to retain</h4>
          <p className="mb-3">Indian tax and regulatory law requires us to retain certain transaction-related records even after you delete your account. We retain only the minimum necessary records, with personally identifying fields redacted where possible:</p>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm mb-3">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Category of retained data</th>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Retention period</th>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Legal basis</th>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">Booking & transaction records (invoices, refunds, GST data, payment-gateway IDs)</td>
                  <td className="px-6 py-4">8 years from the end of the financial year in which the transaction occurred</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/50">Section 36, Central Goods and Services Tax Act, 2017; Income Tax Act, 1961</td>
                  <td className="px-6 py-4">Required for tax audit and GST reconciliation.</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">KYC documents (only if you are a Venue Partner)</td>
                  <td className="px-6 py-4">8 years from the end of the partner relationship</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/50">Prevention of Money Laundering Act, 2002</td>
                  <td className="px-6 py-4">Required AML/KYC retention.</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">Records subject to a legal hold, court order, or law-enforcement request</td>
                  <td className="px-6 py-4">Until the legal matter is resolved</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/50">Mandatory compliance with lawful authority. Code of Criminal Procedure / IT Act, 2000 / court order</td>
                  <td className="px-6 py-4">Mandatory compliance with lawful authority.</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">Records of marketing-consent grants and withdrawals</td>
                  <td className="px-6 py-4">3 years from withdrawal</td>
                  <td className="px-6 py-4 text-emerald-700 bg-emerald-50/50">Demonstrating consent under DPDP Act, 2023</td>
                  <td className="px-6 py-4">To prove we honoured opt-out requests.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500">Within the retained records, your name, contact details and identifiers are redacted to the minimum extent permitted by law — typically your bookings become linked to a system identifier rather than your name and mobile.</p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.6 What you cannot delete or recover after the request</h4>
          <ul className="list-disc pl-5 space-y-2 marker:text-red-400">
            <li><strong className="text-gray-900">Past bookings</strong> - once you initiate account deletion, you cannot retrieve booking history, refund status, or invoice copies through your account. We recommend you download your data via Settings → Privacy → Download my data before initiating deletion, if you may need these records in the future.</li>
            <li><strong className="text-gray-900">Active bookings</strong> - please cancel any upcoming bookings before requesting deletion. Pending bookings will be cancelled automatically (refunds will be processed per our standard cancellation policy), but you will not be able to attend bookings you had paid for.</li>
            <li><strong className="text-gray-900">Pending refunds, credits or wallet balances</strong> - these are forfeited on account deletion unless you request them to be paid out to your registered bank account before deletion. We will not initiate refunds to a closed account.</li>
            <li><strong className="text-gray-900">Reviews you posted</strong> - anonymised, not deleted (see §11.4).</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.7 Deactivation vs deletion</h4>
          <p className="mb-3">There is an important distinction:</p>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm mb-3">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Feature</th>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Deactivation</th>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Deletion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">What it does</td>
                  <td className="px-6 py-4">Hides your profile and bookings from the public. You can log back in any time within 30 days and resume your account.</td>
                  <td className="px-6 py-4">Permanently removes your personal data per §11.3. Cannot be reversed.</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">Reversible?</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">Yes, within 30 days.</td>
                  <td className="px-6 py-4 text-red-600 font-medium">No.</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">Default choice in the app?</td>
                  <td className="px-6 py-4">Yes — when you tap &quot;Delete Account&quot; the first prompt offers Deactivation. You must explicitly tap &quot;Permanently delete&quot; to proceed to deletion.</td>
                  <td className="px-6 py-4">No confirmation required.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600">If you want a short break from GameOn, deactivation is the right choice. If you are sure you no longer want a GameOn account, choose deletion.</p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.8 Timeline summary</h4>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm mb-3">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Step</th>
                  <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-wider text-xs">Time from request</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 font-bold text-gray-900">Acknowledgement email</td><td className="px-6 py-4">Within 24 hours</td></tr>
                <tr className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 font-bold text-gray-900">Identity verification (OTP)</td><td className="px-6 py-4">Within 24 hours</td></tr>
                <tr className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 font-bold text-gray-900">Active-data deletion from production</td><td className="px-6 py-4">Within 7 days of verified request</td></tr>
                <tr className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 font-bold text-gray-900">Deletion from rolling backups</td><td className="px-6 py-4">Within 30 days</td></tr>
                <tr className="hover:bg-gray-50 transition-colors"><td className="px-6 py-4 font-bold text-gray-900">Final confirmation email</td><td className="px-6 py-4">On completion (within 30 days)</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm italic text-gray-500">Total maximum elapsed time, from request to full deletion: 30 days, in line with Section 12 of the DPDP Act, 2023.</p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.9 Special situations</h4>
          <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
            <li><strong className="text-gray-900">Venue Partners.</strong> If you are a Venue Partner, your venue listing, booking history attached to the venue, and tax records remain (linked to your business entity rather than you personally). Your partner-personal data — name, contact, authorised-representative photo — is deleted on the same timeline. Detailed Partner-side terms are in the Partner Terms &amp; Conditions.</li>
            <li><strong className="text-gray-900">Users under 18.</strong> Deletion requests for accounts of users under 18 must be initiated by a parent or legal guardian. Contact support@gameon-india.com with proof of guardianship.</li>
            <li><strong className="text-gray-900">Users with an active dispute, chargeback, or complaint.</strong> Deletion is deferred until the matter is resolved, and only the minimum data needed to resolve the dispute is retained for that period.</li>
            <li><strong className="text-gray-900">Users with a legal hold.</strong> If a court, tribunal or law-enforcement agency has issued a hold on your records, we will inform you (unless legally prohibited) and defer deletion until the hold is lifted.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.10 Re-registering after deletion</h4>
          <p>You may create a fresh GameOn account at any time using a different (or the same) mobile number. A new account starts with no history — you will not see your previously-completed bookings, captain badges, reviews you authored, or accumulated GameOn credits. The old account cannot be recovered or merged into the new one.</p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-3">11.11 Questions</h4>
          <p>Any question about account deletion can be addressed to <a href="mailto:support@gameon-india.com" className="text-blue-600 hover:underline">support@gameon-india.com</a> or to our Grievance Officer (see Section 15). We do not charge a fee for account deletion under any circumstances.</p>
        </div>
      </div>
    ),
  },
  {
    id: "cookies",
    number: "12",
    title: "Cookies and Similar Technologies (Website)",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>Our website uses:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
          <li><strong className="text-gray-900">Strictly necessary cookies:</strong> to keep you signed in, maintain booking state, and remember your city. These cannot be turned off.</li>
          <li><strong className="text-gray-900">Analytics cookies:</strong> Google Analytics to count visits and measure traffic (aggregated, non-identifying).</li>
          <li><strong className="text-gray-900">Preference cookies:</strong> to remember language, time-zone, and consent choices.</li>
        </ul>
        <p className="text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
          We do not use third-party advertising cookies, retargeting pixels, or cross-site tracking cookies on the website at this time. You can clear cookies from your browser settings at any time; some site features may not work as expected if you do.
        </p>
      </div>
    ),
  },
  {
    id: "children",
    number: "13",
    title: "Children's Privacy",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          The Platform is intended for users <strong className="text-gray-900">aged 18 and above</strong>. We do not knowingly
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
          <a href="mailto:support@gameon-india.com" className="text-blue-600 font-bold hover:underline">support@gameon-india.com</a> and we will delete
          such data promptly.
        </p>
      </div>
    ),
  },
  {
    id: "security",
    number: "14",
    title: "Security",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>We follow industry-accepted security practices, including:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
          {[
            "HTTPS / TLS 1.2+ encryption of all data in transit",
            "Encryption at rest of sensitive fields (passwords, financial tokens)",
            "Role-based access controls and the principle of least privilege",
            "Annual security reviews and periodic vulnerability scans",
            "Logging and monitoring of access to production systems",
            "Reasonable Security Practices and Procedures as required under Section 8 of the SPDI Rules"
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm font-medium text-gray-700">{item}</span>
            </div>
          ))}
        </div>
        <p>
          In the event of a personal data breach likely to result in significant harm, we will notify
          the Data Protection Board (when constituted) and affected Data Principals as required
          under Section 8(6) of the DPDP Act, within the prescribed timelines.
        </p>
        <p className="text-sm italic text-gray-400">
          No method of transmission or electronic storage is 100% secure. We commit to commercially reasonable measures.
        </p>
      </div>
    ),
  },
  {
    id: "grievance",
    number: "15",
    title: "Grievance Officer",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <p>
          In accordance with the Information Technology Act, 2000, the SPDI Rules, the Intermediary
          Guidelines, 2021, and the Consumer Protection (E-Commerce) Rules, 2020:
        </p>
        <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["Name", "Shivam Tiwari"],
              ["Designation", "Founder & Chief Executive Officer, Grievance Officer"],
              ["Address", "KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001"],
              ["Email", "support@gameon-india.com"],
              ["Phone", "+91 88961 72818"],
              ["Hours", "Monday to Friday, 10:00 AM – 6:00 PM IST (excluding public holidays)"],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</span>
                <span className="block text-sm font-medium text-gray-100">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="bg-blue-50 text-blue-900 p-4 rounded-xl text-sm border border-blue-100">
          The Grievance Officer will <strong className="font-bold">acknowledge your complaint within 48 hours</strong> of
          receipt and resolve it within <strong className="font-bold">15 days</strong> (or 1 month for sensitive personal
          data grievances, per the SPDI Rules).
        </p>
      </div>
    ),
  },
  {
    id: "changes",
    number: "16",
    title: "Changes to This Privacy Policy",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          The &quot;Last Updated&quot; date at the top of this page always shows when this Policy was last
          revised. For material changes (new categories of data collected, new purposes, new third
          parties), we notify you via:
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500 font-medium text-gray-700">
          <li>An in-app notification on your next sign-in</li>
          <li>An email to your registered email address</li>
          <li>A prominent notice on the website homepage for at least 14 days</li>
        </ul>
        <p>
          Your continued use of the Platform after such notice constitutes acceptance of the revised Policy.
        </p>
      </div>
    ),
  },
  {
    id: "governing-law",
    number: "17",
    title: "Governing Law and Jurisdiction",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p>
          This Privacy Policy is governed by the <strong className="text-gray-900">laws of India</strong>. Any dispute
          arising out of or in connection with this Policy is subject to the exclusive jurisdiction
          of the competent courts at <strong className="text-gray-900">Ghaziabad, Uttar Pradesh, India</strong>, without
          prejudice to any rights you may have under applicable consumer-protection laws.
        </p>
      </div>
    ),
  },
  {
    id: "contact-us",
    number: "18",
    title: "Contact Us",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
             <Mail className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
             <div>
               <strong className="block text-gray-900 mb-1">Email</strong>
               <a href="mailto:support@gameon-india.com" className="text-emerald-600 hover:underline">support@gameon-india.com</a>
             </div>
           </div>
           <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
             <Phone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
             <div>
               <strong className="block text-gray-900 mb-1">Phone</strong>
               <span>+91 88961 72818</span>
             </div>
           </div>
           <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3 sm:col-span-2">
             <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
             <div>
               <strong className="block text-gray-900 mb-1">Postal Address</strong>
               <span>GameOn Sports Services Private Limited, KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001</span>
             </div>
           </div>
        </div>
        <p className="mt-4">
           <strong>Website:</strong> <a href="https://www.gameon-india.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.gameon-india.com</a>
        </p>
      </div>
    )
  }
];

const appendices = [
  {
    id: "appendix-a",
    title: "Appendix A — Play Store Data Safety Disclosure",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed">
        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-800 text-white border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Data Type</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Collected?</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Shared with Third Parties?</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Purpose</th>
                <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">Optional / Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
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
              ].map(([type, collected, shared, purpose, optional], i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900">{type}</td>
                  <td className="px-4 py-3">{collected}</td>
                  <td className="px-4 py-3 text-xs">{shared}</td>
                  <td className="px-4 py-3 text-xs">{purpose}</td>
                  <td className="px-4 py-3 text-xs font-medium text-emerald-700 bg-emerald-50/50">{optional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
          <p className="font-bold text-gray-900 mb-2">Security practices declared for Play Store:</p>
          <ul className="list-disc pl-5 space-y-1 marker:text-gray-400 text-sm">
            <li>Data is encrypted in transit (HTTPS / TLS 1.2+).</li>
            <li>You can request that data be deleted (in-app + via support@gameon-india.com).</li>
            <li>Data collection and security practices follow Google Play&apos;s Families Policy where applicable.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "appendix-b",
    title: "Appendix B — Apple App Store Privacy Nutrition Label",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
        <ul className="space-y-4">
          <li className="flex flex-col sm:flex-row gap-2 sm:gap-6">
            <strong className="text-gray-900 shrink-0 w-48">Data Used to Track You:</strong> 
            <span className="text-gray-600">None. GameOn does not track users across other companies&apos; apps and websites.</span>
          </li>
          <li className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-4 border-t border-gray-100">
            <strong className="text-gray-900 shrink-0 w-48">Data Linked to You:</strong> 
            <span className="text-gray-600">Name, Email, Phone Number, User ID, Address (optional), Precise Location (optional), Coarse Location, Contacts (with permission, invite flow only), Photos (profile, optional), Purchase History, Payment Info (masked tokens only), App Interactions, Search History, Customer Support communications, Crash Data, Performance Data, Diagnostics.</span>
          </li>
          <li className="flex flex-col sm:flex-row gap-2 sm:gap-6 pt-4 border-t border-gray-100">
            <strong className="text-gray-900 shrink-0 w-48">Data Not Linked to You:</strong> 
            <span className="text-gray-600">None at launch.</span>
          </li>
        </ul>
      </div>
    ),
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string>("who-we-are");

  // Smooth scroll logic for TOC sidebar
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100; // 100px offset for fixed headers
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── HERO SECTION ── */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-2">
              <ShieldCheck className="w-4 h-4" /> Legal Document
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Privacy <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Policy</span>
            </h1>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-8 pt-4 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Effective: 4 May 2026</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Updated: 6 June 2026</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> India</div>
            </div>
          </motion.div>
        </div>
        {/* Abstract background blur */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-3xl opacity-50" />
      </section>

      {/* ── MAIN CONTENT LAYOUT ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
        
        {/* Left: Sticky Table of Contents Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-28">
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 lg:p-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Table of Contents</h3>
            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                    activeSection === s.id 
                      ? "bg-white shadow-sm text-emerald-600 border border-gray-100" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <span className={`text-[10px] uppercase tracking-wider ${activeSection === s.id ? "text-emerald-400" : "text-gray-400"}`}>{s.number}</span>
                  {s.title}
                </button>
              ))}
              
              <div className="pt-6 pb-2">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Appendices</h3>
              </div>
              
              {appendices.map((a, idx) => (
                <button
                  key={a.id}
                  onClick={() => scrollToSection(a.id)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                    activeSection === a.id 
                      ? "bg-white shadow-sm text-emerald-600 border border-gray-100" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <span className={`text-[10px] uppercase tracking-wider ${activeSection === a.id ? "text-emerald-400" : "text-gray-400"}`}>App {String.fromCharCode(65+idx)}</span>
                  <span className="truncate">{a.title.split('—')[0].trim()}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right: Content Sections */}
        <div className="w-full flex-1 space-y-24 pb-32">
          {sections.map((s) => (
            <div key={s.id} id={s.id} className="scroll-mt-32">
              <div className="flex items-center gap-4 mb-8">
                <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-lg">
                  {s.number}
                </span>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  {s.title}
                </h2>
              </div>
              <div className="prose prose-emerald max-w-none prose-p:text-gray-600 prose-headings:text-gray-900 prose-strong:text-gray-900">
                {s.content}
              </div>
            </div>
          ))}

          {/* Appendices Container */}
          <div className="pt-12 border-t border-gray-100 space-y-24">
            <h2 className="text-4xl font-black text-gray-900 mb-12">Appendices</h2>
            {appendices.map((a) => (
              <div key={a.id} id={a.id} className="scroll-mt-32">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                    {a.title}
                  </h3>
                </div>
                <div className="prose prose-emerald max-w-none">
                  {a.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER BAR ── */}
      <footer className="border-t border-gray-100 bg-[#FAFAFA] pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 items-start">
            
            {/* 1. Brand Section */}
            <div className="flex flex-col items-start">
              <img 
                src="/gameon-logo.png" 
                alt="GameOn Logo" 
                className="h-10 w-auto object-contain mb-3" 
              />
              <p className="text-gray-500 text-[14px] leading-relaxed">
                The Kinetic Editorial of Sport.<br />
                Transforming how the world plays together.
              </p>
            </div>

            {/* 2. Company Links */}
            <div>
              <h4 className="font-extrabold text-gray-900 text-[13px] uppercase tracking-[0.1em] mb-4">Company</h4>
              <ul className="space-y-3 text-[14px] text-gray-500 font-medium">
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* 3. Support Links */}
            <div>
              <h4 className="font-extrabold text-gray-900 text-[13px] uppercase tracking-[0.1em] mb-4">Support</h4>
              <ul className="space-y-3 text-[14px] text-gray-500 font-medium">
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Contact Support</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">FAQs</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Owner Help</Link></li>
                <li><Link href="#" className="hover:text-emerald-600 transition-colors">Safety Center</Link></li>
              </ul>
            </div>

            {/* 4. Newsletter Card */}
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
              <h4 className="font-extrabold text-gray-900 text-[13px] uppercase tracking-[0.1em] mb-3">Newsletter</h4>
              <p className="text-gray-500 text-[13px] mb-4 leading-relaxed">
                Get the latest match alerts and venue openings.
              </p>
              <form className="flex flex-col space-y-3">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-400"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-[#1db954] hover:bg-[#1aa34a] text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
            © 2026 GameOn. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}