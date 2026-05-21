"use client";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-xl border border-gray-100">
        
        {/* Header Section */}
        <header className="mb-10 border-b pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy — GameOn</h1>
          <div className="text-sm text-gray-500 space-y-1">
            <p><span className="font-semibold text-gray-700">Effective Date:</span> 4 May 2026</p>
            <p><span className="font-semibold text-gray-700">Last Updated:</span> 20 May 2026</p>
            <p><span className="font-semibold text-gray-700">Applies to:</span> The GameOn website at www.gameon-india.com, the GameOn mobile applications on Google Play Store and Apple App Store, and any related services (collectively, the “Platform”).</p>
          </div>
        </header>

        <article className="space-y-8 max-w-none">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Who We Are</h2>
            <p className="mb-4 text-gray-600 leading-relaxed">This Privacy Policy is published by <strong>GameOn Sports Services Private Limited</strong> (“GameOn”, “we”, “us”, “our”), a company incorporated under the Companies Act, 2013, having:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
              <li><strong>Corporate Identification Number (CIN):</strong> U93290UW2026PTC252581</li>
              <li><strong>Date of Incorporation:</strong> 4 May 2026</li>
              <li><strong>Registered Office:</strong> KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001, India</li>
              <li><strong>Email (Privacy & Grievance):</strong> support@gameon-india.com</li>
              <li><strong>Phone:</strong> +91 88961 72818</li>
            </ul>
            <p className="mb-4 text-gray-600 leading-relaxed">
              GameOn operates a Platform that allows users in India to discover, book, and pay for sports venues (turfs, courts, grounds, academies, and related facilities), to find and host matches with other players, and to engage with sports communities. 
            </p>
            <p className="mb-4 text-gray-600 leading-relaxed">
              We are the data fiduciary under the Digital Personal Data Protection Act, 2023 (“DPDP Act”) and the body corporate under the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (“SPDI Rules”), in respect of personal data we collect from you. 
            </p>
            <p className="text-gray-600">This Privacy Policy is published in compliance with:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
              <li>The Information Technology Act, 2000 and rules made thereunder, including the SPDI Rules and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021;</li>
              <li>The Digital Personal Data Protection Act, 2023 (as and when fully notified, including its operative rules); and</li>
              <li>The Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Scope and Acceptance</h2>
            <p className="mb-4 text-gray-600 leading-relaxed">By visiting the website, installing or using the GameOn app, or otherwise availing of the Platform, you confirm that you have read, understood, and agreed to this Privacy Policy and our Terms of Service. If you do not agree to any part of this Policy, please do not use the Platform.</p>
            <p className="text-gray-600">This Policy applies to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
              <li>Users who register and book venues, host or join matches, or interact with content;</li>
              <li>Venue Partners who list facilities on GameOn;</li>
              <li>Visitors to the website who do not create an account; and</li>
              <li>Any other person who provides personal data to us in connection with the Platform.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Personal Data We Collect</h2>
            <p className="mb-4 text-gray-600 leading-relaxed">We collect only the data that is necessary to operate the Platform, to process your bookings, and to comply with applicable law.</p>
            
            <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">3.1 Data you give us directly</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
              <li><strong>Identity data:</strong> Full name, date of birth, gender (optional), profile photo (optional).</li>
              <li><strong>Contact data:</strong> Mobile phone number, email address.</li>
              <li><strong>Account credentials:</strong> Encrypted password or social-login token.</li>
              <li><strong>Sports & profile data:</strong> Sports you play, skill level, preferred timings, preferred venues.</li>
              <li><strong>Venue Partner data:</strong> Business name, owner / authorised representative name, PAN, GSTIN, bank account details.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">3.2 Data we collect automatically</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600">
              <li><strong>Device data:</strong> Device model, OS and version, unique device identifiers.</li>
              <li><strong>Log data:</strong> IP address, login timestamps, session duration.</li>
              <li><strong>Approximate and precise location data:</strong> With your prior in-app permission.</li>
            </ul>
          </section>

          {/* More sections can be added here following the same pattern */}
        </article>
      </div>
    </main>
  );
}
