"use client";

import { motion } from 'framer-motion';
import { Shield, Scale, Gavel, AlertCircle, FileText, Info } from 'lucide-react';

export default function TermsOfServicePage() {
  const sections = [
    {
      id: "1",
      title: "1. About GameOn",
      content: (
        <div className="space-y-4">
          <ul className="list-none space-y-2 text-gray-600">
            <li><span className="font-bold text-gray-900">• Legal Entity:</span> GameOn Sports Services Private Limited</li>
            <li><span className="font-bold text-gray-900">• CIN:</span> U93290UW2026PTC252581</li>
            <li><span className="font-bold text-gray-900">• Date of Incorporation:</span> 4 May 2026</li>
            <li><span className="font-bold text-gray-900">• Registered Office:</span> KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh —201001, India</li>
            <li><span className="font-bold text-gray-900">• Contact email:</span> support@gameon-india.com</li>
            <li><span className="font-bold text-gray-900">• Phone:</span> +91 88961 72818</li>
            <li><span className="font-bold text-gray-900">• Website:</span> www.gameon-india.com</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            GameOn operates a Platform that allows users in India to discover, book, and pay for sports venues (turfs, courts, grounds, academies, and similar facilities), to find and host matches with other players, and to engage with sports content and community features. We act as an intermediary under Section 2(1)(w) of the Information Technology Act, 2000 between Users and Venue Partners.
          </p>
        </div>
      )
    },
    {
      id: "2",
      title: "2. Definitions",
      content: (
        <ul className="list-none space-y-4 text-gray-600">
          <li><span className="font-bold text-gray-900">• “User”</span> means any person who accesses or uses the Platform as a player, including registered users and visitors.</li>
          <li><span className="font-bold text-gray-900">• “Venue Partner”</span> means any owner or authorised operator of a sports facility that lists its venue, slots, or services on the Platform.</li>
          <li><span className="font-bold text-gray-900">• “Booking”</span> means a confirmed reservation of a venue slot made by a User through the Platform.</li>
          <li><span className="font-bold text-gray-900">• “Content”</span> means all information, text, images, photos, videos, ratings, reviews, and other material made available through the Platform.</li>
          <li><span className="font-bold text-gray-900">• “Services”</span> means the booking facilitation, payments, match-hosting, communication, discovery, and related features made available on the Platform.</li>
        </ul>
      )
    },
    {
      id: "3",
      title: "3. Eligibility",
      content: (
        <div className="space-y-4 text-gray-600">
          <p>To use the Platform you must:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Be at least 18 years of age and competent to contract under the Indian Contract Act, 1872. If you are between 13 and 18, you may use the Platform only with the consent and supervision of a parent or legal guardian.</li>
            <li>Provide accurate, current, and complete information at registration and keep it updated.</li>
            <li>Not have been previously suspended or removed from the Platform.</li>
            <li>Not be barred from availing of the Services under applicable Indian law.</li>
          </ol>
        </div>
      )
    },
    {
      id: "4",
      title: "4. Account Registration and Security",
      content: (
        <div className="space-y-4 text-gray-600">
          <p>You may register on the Platform using a mobile number (verified by OTP), email address, or social sign-in (Google or Apple). You agree:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide accurate information and to keep it current;</li>
            <li>To safeguard your account credentials and OTPs and not to share them with anyone;</li>
            <li>To notify us immediately if you suspect unauthorised access;</li>
            <li>That you are solely responsible for all activity carried out under your account.</li>
          </ul>
        </div>
      )
    },
    {
      id: "5",
      title: "5. The Platform — Our Role as an Intermediary",
      content: (
        <p className="text-gray-600 leading-relaxed">
          GameOn provides a technology platform that connects Users with Venue Partners. We facilitate Bookings, payments, and communications. We are not the operator of any sports venue. Each venue is owned and operated by the respective Venue Partner. GameOn qualifies as an “intermediary” under the Information Technology Act, 2000 and is entitled to the safe-harbour protections of Section 79.
        </p>
      )
    },
    {
      id: "7",
      title: "7. Booking, Payments, and Confirmation",
      content: (
        <div className="space-y-4 text-gray-600">
          <h4 className="font-bold text-gray-900">7.1 Booking flow</h4>
          <p>A Booking is confirmed only when payment has been successfully received and a confirmation has been displayed on the Platform.</p>
          <h4 className="font-bold text-gray-900">7.2 Payment methods</h4>
          <p>Payments are processed by Razorpay, which is regulated by the RBI. GameOn does not collect or store sensitive payment credentials like CVV or PINs.</p>
          <h4 className="font-bold text-gray-900">7.3 Convenience fee</h4>
          <p>GameOn may charge a convenience fee of up to 2% on the base booking value, which is non-refundable in case of user-initiated cancellation.</p>
        </div>
      )
    },
    {
      id: "8",
      title: "8. Cancellation, Refunds, and Rescheduling",
      content: (
        <div className="space-y-4 text-gray-600 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 p-3 text-left">Time of Cancellation</th>
                <th className="border border-gray-200 p-3 text-left">Refund of Venue Fee</th>
                <th className="border border-gray-200 p-3 text-left">Refund of Conv. Fee</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 p-3">24 hours or more</td>
                <td className="border border-gray-200 p-3">100%</td>
                <td className="border border-gray-200 p-3">0%</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-3">12 to 24 hours</td>
                <td className="border border-gray-200 p-3">50%</td>
                <td className="border border-gray-200 p-3">0%</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-3">Less than 12 hours</td>
                <td className="border border-gray-200 p-3">0%</td>
                <td className="border border-gray-200 p-3">0%</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs italic">* Approved refunds take 5–7 business days to reflect in your account.</p>
        </div>
      )
    },
    {
      id: "18",
      title: "18. Grievance Officer",
      content: (
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <p className="font-bold text-emerald-900 mb-2">Grievance Officer: Shivam Tiwari</p>
          <p className="text-emerald-800 text-sm">Founder & Chief Executive Officer</p>
          <p className="text-emerald-800 text-sm">Email: support@gameon-india.com</p>
          <p className="text-emerald-800 text-sm mt-2">Address: KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <section className="bg-white border-b border-gray-100 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Legal
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900">Terms of Service</h1>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
              <p>Effective: 4 May 2026</p>
              <p>Last Updated: 20 May 2026</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-12">
            
            <p className="text-gray-600 leading-relaxed italic border-b pb-8">
              These Terms of Service (“Terms”) are a legally binding agreement between you and GameOn Sports Services Private Limited, governing your access to and use of the Platform. By using GameOn, you agree to these Terms.
            </p>

            <div className="space-y-16">
              {sections.map((section) => (
                <motion.div 
                  key={section.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    {section.title}
                  </h2>
                  <div className="text-gray-600 text-lg">
                    {section.content}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="pt-12 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4">Questions about our terms?</p>
              <a 
                href="mailto:support@gameon-india.com" 
                className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
              >
                Contact Support <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 text-center text-gray-400 text-sm">
        <p>Thank you for using GameOn. Now go play.</p>
      </section>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
