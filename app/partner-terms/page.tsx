"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, Calendar, MapPin, Mail, Phone, ChevronRight, 
  Scale, Landmark, AlertTriangle, ShieldAlert, Sparkles, Lock,
  FileText, Clock, Users, Building2, HelpCircle, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Section {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: "definitions",
    number: "01",
    title: "Definitions",
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 leading-relaxed text-[15px]">
          In these Partner Terms, unless the context requires otherwise, the following terms shall have the meanings assigned to them:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          {[
            {
              term: "Applicable Law",
              desc: "Means all laws, rules, regulations, circulars, notifications, judicial pronouncements, and directives applicable in India, including but not limited to the Information Technology Act, 2000, the Consumer Protection Act, 2019, the Consumer Protection (E-Commerce) Rules, 2020, the Income Tax Act, 1961, the Central Goods and Services Tax Act, 2017, the Prevention of Money Laundering Act, 2002, and the Digital Personal Data Protection Act, 2023."
            },
            {
              term: "Booking",
              desc: "Means a confirmed reservation of a Slot at a Venue made by a User through the Platform."
            },
            {
              term: "Booking Value",
              desc: "Means the gross amount (in Indian Rupees) charged to the User for the Booking before any discounts, refunds, or fees, as listed by the Partner on the Platform."
            },
            {
              term: "Commercial Schedule",
              desc: "Means the schedule signed between GameOn and the Partner (forming part of the Partner Onboarding Form) which records the commercial terms applicable to the Partner, including the Partner Payout share, settlement cycle, and any other agreed commercial terms."
            },
            {
              term: "Convenience Fee",
              desc: "Means the fee, if any, charged by GameOn to the User per Booking."
            },
            {
              term: "Partner Payout",
              desc: "Means the amount payable by GameOn to the Partner in respect of completed Bookings, calculated as set out in the Commercial Schedule."
            },
            {
              term: "Partner Onboarding Form",
              desc: "Means the form (electronic or physical) signed or accepted by the Partner at the time of joining the Platform, which records the Partner’s identity, Venue details, Commercial Schedule, KYC, and bank settlement details."
            },
            {
              term: "Platform",
              desc: "Means the GameOn website at www.gameon-india.com, the GameOn mobile applications on Google Play Store and Apple App Store, the GameOn partner dashboard, and any related services operated by GameOn."
            },
            {
              term: "Services",
              desc: "Means the booking facilitation, payments, communications, partner dashboard, marketing, and related services provided by GameOn on the Platform."
            },
            {
              term: "Slot",
              desc: "Means a time-bound, sport-specific reservation block at a Venue made available by the Partner on the Platform."
            },
            {
              term: "User",
              desc: "Means an individual who registers on the Platform as a player and makes Bookings."
            },
            {
              term: "Venue",
              desc: "Means each sports ground, turf, court, field, academy, or facility listed by the Partner on the Platform."
            }
          ].map((item) => (
            <div className="bg-gray-50/80 p-5 rounded-[1.25rem] border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-colors flex flex-col" key={item.term}>
              <div>
                <span className="inline-block px-2.5 py-1 w-max rounded-lg bg-emerald-100/80 text-emerald-800 font-bold text-[10px] uppercase tracking-widest mb-3">
                  Defined Term
                </span>
                <h4 className="text-gray-900 font-bold text-[15px] mb-2">{item.term}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "intermediary-role",
    number: "02",
    title: "GameOn’s Role as an Intermediary",
    content: (
      <div className="space-y-5 text-gray-600 leading-relaxed text-[15px]">
        <p>
          GameOn is a technology platform that connects Users with Partners. We facilitate Bookings, payments, and communications between Users and Partners. We are not the operator of any Venue. Each Venue is owned and operated by the Partner.
        </p>
        <p>
          The condition of the Venue, the quality of the playing surface and equipment, the conduct of Venue staff, the accuracy of Slot availability, and the conduct of activities at the Venue are the sole responsibility of the Partner.
        </p>
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-2xl my-6 shadow-sm">
          <strong className="text-emerald-950 font-black text-base flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            IT Act Safe Harbour Protection
          </strong>
          <p className="text-emerald-900/80 text-sm leading-relaxed">
            GameOn qualifies as an &quot;intermediary&quot; under Section 2(1)(w) of the Information Technology Act, 2000 and is entitled to the safe-harbour protections of Section 79 of that Act, subject to compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
          </p>
        </div>
        <p>
          Nothing in these Partner Terms shall be construed as creating a joint venture, partnership, employment, franchise, agency, or fiduciary relationship between the parties. The Partner remains solely responsible for the legal, regulatory, and operational status of the Venue. GameOn does not own, lease, operate, manage, supervise, insure, or otherwise control any Venue.
        </p>
      </div>
    ),
  },
  {
    id: "onboarding-eligibility",
    number: "03",
    title: "Onboarding & Eligibility",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed text-[15px]">
        {/* 3.1 */}
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-emerald-300">3.1</span> Eligibility Requirements
          </h4>
          <p className="mb-4">To list a Venue on the Platform, the Partner must meet the following criteria:</p>
          <ul className="space-y-3">
            {[
              "Be an individual aged 18 or above, or a duly constituted firm, company, trust, society, school, club, or institution;",
              "Be the lawful owner, lessee, licensee, or authorised operator of the Venue, with sufficient right to receive and accept Bookings for the Venue;",
              "Hold all licences, permissions, no-objection certificates, fire safety clearances, and approvals required under Applicable Law to operate the Venue;",
              "Have a valid Permanent Account Number (PAN) issued in India;",
              "Have a valid bank account in India, held in the legal name of the Partner;",
              "Hold a GST registration where the Partner's annual turnover crosses the GST registration threshold under the Central Goods and Services Tax Act, 2017, or has otherwise opted to register; and",
              "Not be barred from contracting under any Applicable Law."
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3.2 */}
        <div className="bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-100">
          <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
            <span className="text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded text-xs">3.2</span> KYC Documentation
          </h4>
          <p className="mb-6 text-sm text-gray-500">At onboarding (and thereafter, on request), the Partner shall provide the following documents:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              "PAN of the Partner (and of the authorised representative, where applicable);",
              "Aadhaar or other government-issued identity proof of the authorised representative;",
              "GST registration certificate, if available;",
              "A cancelled cheque or bank account verification page issued by the Partner's bank;",
              "Proof of ownership, lease, licence, or authorisation to operate the Venue (e.g., title deed, lease deed, licence agreement, or no-objection certificate);",
              "Photographs of the Venue and recent photographs of the facility in use;",
              "Where the Partner is a school, society, or institution: a copy of registration, latest authority letter, and contact details of the authorised signatory; and",
              "Such additional documents as GameOn may reasonably require to comply with KYC, anti-money-laundering, or other regulatory obligations."
            ].map((doc, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50">
                <span className="w-6 h-6 bg-gray-100 text-gray-500 font-bold rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">{idx + 1}</span>
                <span className="text-gray-600 font-medium leading-snug">{doc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3.3 & 3.4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">3.3</span> Verification
            </h4>
            <p className="text-sm">
              GameOn may verify the documents provided through publicly available registries (including the MCA, the GST portal, PAN verification utilities, and UDISE+ for schools), through site visits, or through third-party verification agents. The Partner consents to such verification.
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">3.4</span> Acceptance
            </h4>
            <p className="text-sm">
              GameOn reserves the right, in its sole discretion, to accept, reject, or delay onboarding any Partner, or to require additional documents or information. Listing on the Platform is at GameOn's discretion and creates no obligation to accept further Venues from the same Partner.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "listing-availability",
    number: "04",
    title: "Listing, Content & Slot Availability",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed text-[15px]">
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-emerald-300">4.1</span> Listing Accuracy
          </h4>
          <p className="mb-4">The Partner shall provide accurate, current, and complete information about the Venue, including:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 list-disc pl-5 marker:text-emerald-400">
            <li>Venue name, address, GPS location, accurate locality and city tags;</li>
            <li>Sports supported and surface type (e.g., turf, wood, synthetic, grass, concrete);</li>
            <li>Slot timings (open and close), Slot duration (e.g., 60-min / 90-min blocks), and blocked slots;</li>
            <li>Pricing for each Slot and sport;</li>
            <li>Amenities (lighting, parking, changing rooms, washrooms, drinking water, equipment rental, food/beverage availability);</li>
            <li>Cancellation policy (if more lenient or stricter than the Platform default);</li>
            <li>Rules of conduct at the Venue (footwear, ball type, equipment, alcohol, smoking, age limits);</li>
            <li>Photographs of the Venue.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
            <span className="text-emerald-300">4.2</span> Partner Controls Pricing
          </h4>
          <p>
            Pricing of Slots at the Venue is set by the Partner. GameOn does not unilaterally set, edit, or override the Partner's listed pricing. The Partner may revise its pricing in the partner dashboard at any time, subject to such revision not affecting Bookings already confirmed at the previous price.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <h4 className="text-amber-900 font-black text-lg mb-4 flex items-center gap-2 relative z-10">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            4.3 Slot Availability Obligations
          </h4>
          <p className="text-amber-900/80 mb-4 relative z-10">
            Once a Slot is listed on the Platform as &quot;available,&quot; it constitutes a firm offer by the Partner to accept Bookings for that Slot. The Partner shall:
          </p>
          <ul className="space-y-3 text-amber-950 text-sm relative z-10">
            {[
              "Maintain accurate, real-time Slot inventory in the partner dashboard;",
              "Honour every confirmed Booking made through the Platform during the booked time, on the booked date, at the booked Venue;",
              "Not list a Slot for parallel sale through any other channel without removing it from the Platform inventory in real time (to avoid double-bookings);",
              "Inform GameOn at the earliest of any Venue closure, maintenance window, weather disruption, or other event that affects Slot availability."
            ].map((item, idx) => (
              <li key={idx} className="flex gap-3 bg-white/50 p-3 rounded-xl border border-amber-100/50">
                <span className="font-bold text-amber-600">{String.fromCharCode(97 + idx)}.</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
            <span className="text-emerald-300">4.4</span> Content Licence to GameOn
          </h4>
          <p>
            The Partner grants GameOn a non-exclusive, royalty-free, worldwide, sublicensable, perpetual licence to use the Venue name, address, photographs, videos, descriptions, ratings, and Slot information for purposes of listing the Venue on the Platform, marketing the Platform and the Venue, aggregated reporting, and other reasonable purposes connected with the operation of the Platform. The Partner represents that it has all rights necessary to grant this licence and that the content provided does not infringe any third-party rights.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "bookings-cancellations",
    number: "05",
    title: "Bookings, Cancellations, Refunds & No-Shows",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed text-[15px]">
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
            <span className="text-emerald-300">5.1</span> Booking Confirmation
          </h4>
          <p>
            A Booking is confirmed when (a) the User has successfully paid the Booking Value (and any applicable Convenience Fee) through the Platform, or (b) the User has committed to a &quot;Cash at Venue&quot; Slot through the Platform (where applicable), and (c) the Partner has not actively declined the Booking within any applicable acceptance window.
          </p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-emerald-300">5.2</span> Standard Cancellation Policy
          </h4>
          <p className="mb-4 text-sm text-gray-500">Unless the Partner has published a different cancellation policy on the Venue listing (which GameOn may approve in writing), the following standard policy applies:</p>
          <div className="overflow-hidden border border-gray-200 rounded-2xl shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 font-bold text-gray-900 uppercase tracking-wider text-[11px]">Time of Cancellation <br/><span className="text-[10px] text-gray-400 font-normal">(before Slot start)</span></th>
                  <th className="px-5 py-4 font-bold text-gray-900 uppercase tracking-wider text-[11px]">Refund of Booking Value <br/><span className="text-[10px] text-gray-400 font-normal">(to User)</span></th>
                  <th className="px-5 py-4 font-bold text-gray-900 uppercase tracking-wider text-[11px]">Refund of Convenience Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {[
                  ["24 hours or more", "100%", "0% (non-refundable)"],
                  ["12 to 24 hours", "50%", "0% (non-refundable)"],
                  ["Less than 12 hours", "0%", "0% (non-refundable)"],
                  ["No-show", "0%", "0% (non-refundable)"]
                ].map(([time, refund, fee], idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">{time}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${refund === '100%' ? 'bg-emerald-100 text-emerald-700' : refund === '50%' ? 'bg-amber-100 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                        {refund}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h4 className="text-red-900 font-black text-lg mb-4 flex items-center gap-2 relative z-10">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            5.3 Partner Payout on Cancelled Bookings — IMPORTANT
          </h4>
          <p className="text-red-900/80 text-sm mb-4 relative z-10 leading-relaxed font-medium">
            The Partner Payout is calculated and earned only on <strong className="text-red-900 font-black">completed Bookings</strong>. If a Booking is cancelled by the User (irrespective of whether the User receives a partial or full refund), or by the Partner, or by GameOn for any reason set out in these Partner Terms, no Partner Payout shall accrue or be payable for that Booking. The Partner expressly acknowledges that:
          </p>
          <ul className="space-y-3 relative z-10">
            {[
              "The Partner Payout is conditional upon a Booking being completed;",
              "Where a Booking is cancelled before completion, the Partner shall not be entitled to any share of the Booking Value paid by the User, even if the User has been charged a cancellation fee; and",
              "Any cancellation fee retained from the User (e.g., the 50% retained when the User cancels within 12-24 hours under §5.2) shall be retained by GameOn to cover the cost of processing the cancellation, payment-gateway fees, and operational handling. GameOn may, at its discretion, share such retained amounts with the Partner under a separate written agreement."
            ].map((item, i) => (
              <li key={i} className="flex gap-3 bg-white/60 p-3 rounded-xl border border-red-100 text-red-950 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">5.4</span> No-Shows
            </h4>
            <p className="text-sm">
              Where the User does not arrive for a confirmed Booking (&quot;No-Show&quot;), the Booking is treated as completed for Partner Payout purposes, only if the Partner reports the No-Show through the partner dashboard within 24 hours of the original Slot start time and provides reasonable proof (e.g., photographic, CCTV, or attendance records on request).
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">5.6</span> Rescheduling
            </h4>
            <p className="text-sm">
              A User may reschedule a confirmed Booking to a different Slot of the same Venue and same sport, up to 6 hours before the original Slot start, subject to availability and any administrative fee notified on the Platform.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl">
          <h4 className="text-gray-900 font-bold text-lg mb-3 flex items-center gap-2">
            <span className="text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded text-xs">5.5</span> Partner-Initiated Cancellation
          </h4>
          <p className="mb-4 text-sm">If the Partner cancels a confirmed Booking — for any reason including but not limited to weather, maintenance, double-booking, force majeure, or non-availability — the Partner shall:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              "Notify GameOn and the User at the earliest.",
              "Cooperate to refund the User 100% of the Booking Value.",
              "Offer a comparable alternative Slot if reasonably possible."
            ].map((step, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-sm font-medium text-gray-700 flex flex-col gap-2">
                <span className="text-gray-400 font-black text-xl leading-none">0{i+1}</span>
                {step}
              </div>
            ))}
          </div>
          <div className="bg-amber-50 text-amber-800 text-xs font-bold p-3 rounded-xl inline-flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Repeated Partner-initiated cancellations (more than 3 in any rolling 30-day period) may attract penalties.
          </div>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
            <span className="text-emerald-300">5.7</span> Cash at Venue
          </h4>
          <p>
            Where the Partner has opted to offer &quot;Cash at Venue&quot; Slots, the User pays the Partner directly at the Venue at the time of play. GameOn does not process the payment and does not earn the Partner Payout share on such Slots, unless otherwise agreed in the Commercial Schedule (e.g., a flat per-Booking handling fee). The Partner is solely responsible for collection of Cash at Venue payments, and for handling tax obligations on those payments.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "commission-taxes",
    number: "06",
    title: "Commission, Convenience Fee, Settlement & Taxes",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed text-[15px]">
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
            <span className="text-emerald-300">6.1</span> Commission and Partner Payout
          </h4>
          <p>
            The percentage of the Booking Value paid to the Partner (the &quot;Partner Payout&quot;) and any other commercial fees are recorded in the Commercial Schedule of the Partner Onboarding Form. The Commercial Schedule is binding on both parties and forms an integral part of the Agreement. Neither party shall vary the Commercial Schedule except in writing and signed (electronically or physically) by both parties.
          </p>
          <div className="mt-3 bg-gray-50 border-l-2 border-gray-300 pl-4 py-1 text-sm italic text-gray-500">
            The Partner expressly acknowledges that the commercial terms (including the Partner Payout percentage, the settlement cycle, the no-listing-fee policy, and any incentives) are agreed on a per-Partner basis and may differ between Partners.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">6.2</span> Convenience Fee
            </h4>
            <p className="text-sm">
              GameOn may charge each User a Convenience Fee in respect of each Booking, in an amount disclosed to the User on the payment screen before the User confirms the Booking. The Convenience Fee is GameOn's revenue and forms no part of the Partner Payout calculation.
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">6.3</span> Settlement Cycle
            </h4>
            <p className="text-sm">
              GameOn shall settle the Partner Payout for completed Bookings on the cycle set out in the Commercial Schedule via electronic bank transfer (NEFT/IMPS/RTGS/UPI). A detailed settlement statement will be available on the partner dashboard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4">
          <div className="bg-emerald-50/50 border border-emerald-100 p-6 sm:p-8 rounded-3xl">
            <h5 className="text-gray-900 font-black text-lg mb-4 flex items-center gap-2">
              <Landmark className="w-6 h-6 text-emerald-600 shrink-0" />
              6.4 Goods and Services Tax (GST)
            </h5>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-2"><strong className="text-emerald-700">a.</strong> <span>The Booking Value listed by the Partner shall be inclusive of all applicable GST on the supply of the venue service by the Partner.</span></li>
              <li className="flex gap-2"><strong className="text-emerald-700">b.</strong> <span>The Partner is solely responsible for collecting, remitting, and reporting GST on the venue service supplied to the User.</span></li>
              <li className="flex gap-2"><strong className="text-emerald-700">c.</strong> <span>GameOn shall raise its own tax invoice on the Partner in respect of the commission / platform fee earned by GameOn.</span></li>
              <li className="flex gap-2"><strong className="text-emerald-700">d.</strong> <span>The Partner shall provide GameOn with a copy of its GST registration certificate at onboarding.</span></li>
            </ul>
          </div>
          
          <div className="bg-blue-50/50 border border-blue-100 p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <h5 className="text-gray-900 font-black text-lg mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-blue-600 shrink-0" />
                6.5 Tax Deducted at Source (TDS)
              </h5>
              <p className="text-sm mb-4 text-gray-700">
                The Partner acknowledges that GameOn is an &quot;e-commerce operator&quot; under Section 194-O of the Income Tax Act, 1961, and must deduct TDS at the prescribed rate:
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm text-sm">
                  <span className="font-medium text-gray-700">Valid PAN Furnished</span>
                  <span className="font-black text-blue-700 text-lg">0.1%</span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm text-sm">
                  <span className="font-medium text-gray-700">No Valid PAN (Sec 206AA)</span>
                  <span className="font-black text-red-600 text-lg">5.0%</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-800/70 font-medium italic mt-2">
              GameOn shall deposit the TDS with the central government and issue Form 16A / TDS certificates to the Partner.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">6.6</span> Payment & Processing Fees
            </h4>
            <p className="text-sm">
              Payment-gateway charges, payment failures, refunds, chargebacks, and similar processing costs are borne by GameOn out of the commission fee, save where a chargeback is attributable to the Partner's conduct (e.g., Venue not available).
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">6.8</span> Currency
            </h4>
            <p className="text-sm">
              All amounts payable under these Partner Terms shall be in Indian Rupees (INR / ₹).
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
            <span className="text-emerald-300">6.7</span> Promotions and Discounts
          </h4>
          <p>
            GameOn may run promotional offers or discount campaigns where the price charged to the User is lower than the Partner's listed price. In all such cases, the Partner shall continue to receive its Partner Payout calculated on the Partner’s full listed Booking Value, and GameOn shall absorb the difference. 
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "partner-obligations",
    number: "07",
    title: "Partner Obligations (Quality, Safety & Conduct)",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
        <p>The Partner is expected to deliver a high-quality experience and must adhere to the following obligations:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Booking Fulfilment", desc: "Honour every confirmed Booking at the booked date, time, Venue, and sport." },
            { label: "Venue Quality", desc: "Maintain the Venue in a clean, hygienic, safe, and playable condition during all booked Slots." },
            { label: "Amenities", desc: "Provide reasonable amenities as listed on the Platform (lighting, drinking water, washroom access, etc.)." },
            { label: "Courteous Staff", desc: "Maintain qualified, courteous staff to receive Users and oversee Slots." },
            { label: "Legal Compliance", desc: "Comply with all laws, byelaws, fire safety norms, electrical safety norms, building codes, age-restriction rules, alcohol-licensing rules, and anti-discrimination requirements." },
            { label: "Non-Discrimination", desc: "Treat all Users with dignity and without discrimination on the basis of religion, caste, sex, sexual orientation, place of birth, language, or disability." },
            { label: "Lawful Conduct", desc: "Not engage in any unlawful conduct at the Venue, including but not limited to unauthorised betting, gambling, intoxicants, or commercial activity not disclosed on the listing." },
            { label: "Safety Precautions", desc: "Take reasonable precautions to prevent injury or harm to Users at the Venue." },
            { label: "Liability Insurance", desc: "Maintain such public liability insurance as is reasonable and customary for a venue of its size and nature, and produce evidence to GameOn on request." },
            { label: "Ownership & Authority", desc: "Not list any Venue that the Partner does not own or have valid authority to operate." },
            { label: "Notification of Changes", desc: "Promptly notify GameOn of any closure, sale, transfer, change of ownership, accident, incident, or material change at the Venue." },
            { label: "Dispute Cooperation", desc: "Cooperate fully with GameOn in any dispute, investigation, complaint, or regulatory inquiry relating to the Venue." }
          ].map((item, i) => (
            <div key={item.label} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group">
              <span className="text-gray-900 font-bold flex items-center gap-2 mb-2 text-sm">
                <span className="text-emerald-400 font-black">{String.fromCharCode(97+i)}.</span> {item.label}
              </span>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
          
          <div className="md:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Anti-Circumvention</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                The Partner shall not solicit or encourage Users to book outside the Platform once a User has been onboarded through the Platform. The Partner agrees not to use User data obtained through the Platform to offer the User booking services off-Platform during the term of the Agreement and for a period of 6 months thereafter.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "gameon-obligations",
    number: "08",
    title: "GameOn’s Obligations",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
        <p>GameOn committedly undertakes to:</p>
        <div className="grid grid-cols-1 gap-3">
          {[
            ["Platform Availability", "Make the Platform reasonably available, subject to scheduled maintenance and outages beyond GameOn's control;"],
            ["Venue Display", "Display the Venue on the Platform in accordance with the Partner’s listing, and make reasonable efforts to feature partner Venues to relevant Users;"],
            ["Booking & Payment Processing", "Process Bookings and payments through the Platform and reflect them on the partner dashboard;"],
            ["Timely Settlement", "Settle the Partner Payout in accordance with the Commercial Schedule;"],
            ["User Support", "Handle User support and dispute resolution for Bookings, in coordination with the Partner where required;"],
            ["Data Protection", "Maintain reasonable security and data-protection practices in respect of Partner data;"],
            ["Training & Support", "Provide reasonable training and onboarding support to help the Partner use the partner dashboard."]
          ].map(([title, desc], idx) => (
            <div key={idx} className="flex gap-4 items-start bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-colors">
              <span className="font-black text-emerald-300 text-lg w-6 shrink-0">{String.fromCharCode(97+idx)}.</span>
              <div>
                <strong className="text-gray-900 block text-[15px] mb-1">{title}</strong>
                <span className="text-sm text-gray-600">{desc}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm italic text-gray-400 bg-white p-4 border border-gray-100 rounded-xl text-center">
          * GameOn does not warrant any particular volume of Bookings, revenue, or User base, and the Partner shall not have any claim against GameOn on account of low Booking volumes.
        </p>
      </div>
    ),
  },
  {
    id: "marketing-promotions",
    number: "09",
    title: "Marketing, Promotions & Partner Content",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed text-[15px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">9.1</span> GameOn Marketing
            </h4>
            <p className="text-sm">
              The Partner consents to GameOn featuring the Venue, the Partner’s name, the Venue photographs, and the Partner’s authorised representative (with consent) in marketing material relating to the Platform — including but not limited to social media posts, email newsletters, press releases, paid advertisements, printed material, and the Platform itself.
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">9.2</span> Co-Marketing
            </h4>
            <p className="text-sm">
              GameOn may, from time to time, propose co-marketing activities (e.g., joint social media posts, tournament partnerships, ground-of-the-week features). The Partner is encouraged but not required to participate.
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">9.3</span> Featured Placement
            </h4>
            <p className="text-sm">
              GameOn may feature certain Venues in prominent placements on the Platform (e.g., &quot;Ground of the Week&quot;) based on Venue quality, ratings, response time, User reviews, or other criteria. Featured placement is editorial and does not give rise to any contractual entitlement.
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">9.4</span> Partner’s Own Marketing
            </h4>
            <p className="text-sm">
              The Partner is free to market itself through its own channels and may reference its presence on GameOn. The Partner shall use GameOn’s branding only in accordance with guidelines provided by GameOn, and shall not represent any official endorsement by GameOn other than the listing.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "privacy-confidentiality",
    number: "10",
    title: "Data, Privacy & Confidentiality",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed text-[15px]">
        <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-3xl">
          <h4 className="text-gray-900 font-black text-xl mb-4 flex items-center gap-3">
            <Lock className="w-6 h-6 text-emerald-600 shrink-0" />
            10.1 User Data Handling
          </h4>
          <p className="text-sm mb-5 text-gray-700">GameOn shares only the data necessary for the Partner to fulfil a confirmed Booking — typically the User’s first name, mobile number, sport, party size, and Slot details. The Partner shall:</p>
          <ul className="space-y-3">
            {[
              "Use the User data solely for the purpose of fulfilling the Booking and providing services at the Venue;",
              "Not share, sell, transfer, or disclose the User data to any third party;",
              "Not use the User data for marketing, profiling, behavioural tracking, or any purpose other than fulfilling the Booking, unless the User has provided separate consent to the Partner directly;",
              "Maintain reasonable security practices to protect the User data from unauthorised access;",
              "Comply with the Digital Personal Data Protection Act, 2023 and the Information Technology Rules, 2011, to the extent applicable."
            ].map((item, idx) => (
              <li key={idx} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-sm">
                <span className="font-bold text-emerald-500">{String.fromCharCode(97+idx)}.</span>
                <span className="font-medium text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">10.2</span> Confidentiality
            </h4>
            <p className="text-sm">
              Each party shall keep confidential all information disclosed by the other party that is identified as confidential or is reasonably understood to be confidential. The obligations of confidentiality survive termination of the Agreement and continue for 3 years thereafter.
            </p>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">10.3</span> Privacy Policy
            </h4>
            <p className="text-sm">
              GameOn’s processing of personal data (including any data of the Partner’s authorised representative) is governed by GameOn’s Privacy Policy at <br/><Link href="/privacy-policy" className="text-emerald-600 font-bold hover:underline mt-2 inline-block">www.gameon-india.com/privacy</Link>.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "intellectual-property",
    number: "11",
    title: "Intellectual Property & Non-Exclusivity",
    content: (
      <div className="space-y-8 text-gray-600 leading-relaxed text-[15px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100 pb-8">
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">11.1</span> GameOn’s IP
            </h4>
            <p className="text-sm">
              The GameOn name, logo, Platform, partner dashboard, and all related software/content remain the sole property of GameOn. The Partner gets a limited, non-transferable licence solely to use the partner dashboard and branding for operating their listing.
            </p>
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-emerald-300">11.2</span> Partner’s IP
            </h4>
            <p className="text-sm">
              The Venue name, photographs, descriptions, and other Partner-supplied content shall remain the property of the Partner, subject to the licence granted to GameOn under §4.4.
            </p>
          </div>
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
            <strong className="text-gray-900 mr-2">11.3 No Reverse Engineering:</strong> 
            The Partner shall not reverse-engineer, decompile, disassemble, or attempt to derive source code from the Platform or partner dashboard.
          </div>
        </div>

        <div>
          <h4 className="text-gray-900 font-black text-xl mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">12</span> Non-Exclusivity
          </h4>
          <p className="mb-3">
            The Partner’s listing on the Platform is non-exclusive. The Partner may list the same Venue on any other booking platform, accept walk-ins, or take direct bookings, subject to the Anti-Circumvention obligation in §7(j) and keeping Slot inventory accurate to avoid double-bookings.
          </p>
          <p>
            GameOn does not require any exclusivity from the Partner in respect of the Venue, save where the parties have separately agreed to a category-specific arrangement (e.g., tournament-specific exclusivity) in writing.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "penalties",
    number: "13",
    title: "Penalties for Service Failures",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
        <p>To preserve User trust in the Platform, the following service-failure penalties may apply at GameOn’s discretion. Penalties are deducted from the Partner Payout. GameOn shall communicate any deduction or penalty in writing to the Partner through the partner dashboard.</p>
        
        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-800 text-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Service Failure</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Indicative Consequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {[
                ["Venue closed without notice for a confirmed Booking", "Full Booking Value refund to User funded by GameOn; corresponding deduction from Partner Payout for the relevant Booking; warning."],
                ["Partner cancellation within 24 hours of Slot (no fault of User)", "Full refund to User; no Partner Payout for that Booking; warning."],
                ["More than 3 Partner-initiated cancellations in any rolling 30 days", "Temporary Suspension under §16 pending review."],
                ["Substantiated User complaint of unsafe / unhygienic Venue", "Pause of listing until remedied; refund of affected Booking."],
                ["Anti-Circumvention breach (taking User off-Platform)", "Termination under §16; recovery of Booking Values diverted."],
                ["Repeated fake or misleading listings", "Termination under §16."],
                ["Use of User data outside §10.1", "Termination under §16 + reporting to authorities where applicable."]
              ].map(([failure, consequence], idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-100 w-1/3">{failure}</td>
                  <td className="px-6 py-4 text-gray-700 bg-amber-50/10 leading-relaxed">{consequence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: "liability-indemnification",
    number: "14",
    title: "Liability & Indemnification",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2">14.1 Partner’s Liability</h4>
          <p className="mb-2">The Partner is solely responsible for all activities at and at the Venue, including the safety, supervision, conduct, and welfare of Users and other persons present. The Partner shall:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Be solely liable for any injury, loss, damage, or harm suffered by a User at the Venue, save to the extent caused by GameOn’s negligence;</li>
            <li>Be solely liable for any non-compliance with Applicable Law in respect of the Venue;</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2">14.2 GameOn’s Liability Limit</h4>
          <p className="mb-2">To the maximum extent permitted by Applicable Law:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>The Platform and Services are provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind, express or implied;</li>
            <li>GameOn shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages arising out of the Agreement;</li>
            <li>GameOn’s aggregate liability to the Partner in any twelve-month period shall not exceed the higher of (i) the total commission fees actually paid by the Partner to GameOn in that period, or (ii) ₹50,000 (Indian Rupees Fifty Thousand).</li>
          </ul>
        </div>

        <div className="bg-red-50 border border-red-100 p-6 sm:p-8 rounded-3xl text-red-950">
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            15. Indemnification Obligations
          </h4>
          <p className="text-sm leading-relaxed mb-4">
            The Partner shall defend, indemnify, and hold harmless GameOn, its affiliates, directors, employees, contractors, and agents from and against any and all claims, losses, damages, costs, and expenses (including reasonable legal fees) arising out of or in connection with:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
            {[
              "The Partner’s breach of these Partner Terms or the Agreement;",
              "Any incident, injury, claim, dispute, or loss at or in connection with the Venue;",
              "The Partner’s violation of any Applicable Law (including labour, tax, safety, fire, building, or environmental laws);",
              "Any content, photograph, or description supplied by the Partner that infringes third-party rights;",
              "Any data-protection or privacy breach attributable to the Partner."
            ].map((item, idx) => (
              <div key={idx} className="bg-white/60 p-3 rounded-xl border border-red-100 flex gap-2">
                <span className="text-red-500 shrink-0">•</span>
                <span>{item}</span>
              </div>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "term-termination",
    number: "15",
    title: "Term, Suspension & Termination",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2">16.1 Term</h4>
          <p>
            The Agreement commences on the date the Partner accepts these Partner Terms and the Partner Onboarding Form, and continues with no minimum lock-in period, until terminated in accordance with this §16.
          </p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2">16.2 Termination by Partner</h4>
          <p className="mb-2">
            The Partner may terminate the Agreement at any time by giving GameOn at least 14 days’ prior written notice (by email to support@gameon-india.com or via the partner dashboard). During the notice period:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>All Bookings already confirmed for dates after the termination date shall be honoured by the Partner;</li>
            <li>GameOn shall not accept new Bookings for the Venue for dates after the termination effective date;</li>
            <li>All settlements due to the Partner shall be paid in accordance with the Commercial Schedule on the next applicable settlement cycle;</li>
            <li>The Anti-Circumvention obligation in §7(j) shall continue for the duration specified in that clause.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2">16.3 Termination by GameOn</h4>
          <p className="mb-2">GameOn may terminate the Agreement immediately or on notice in the following circumstances:</p>
          <ul className="list-alpha pl-5 space-y-1 text-sm">
            <li><strong>a.</strong> The Partner commits a material breach that is not cured within 7 days;</li>
            <li><strong>b.</strong> The Partner commits any breach incapable of cure (e.g., serious safety incident, fraud, Anti-Circumvention);</li>
            <li><strong>c.</strong> The Partner becomes insolvent or wound up;</li>
            <li><strong>d.</strong> KYC misrepresentations;</li>
            <li><strong>e.</strong> Repeated booking cancellations or failure to honour confirmed bookings;</li>
            <li><strong>f.</strong> Unlawful use of the Platform;</li>
            <li><strong>g.</strong> Regulatory requirement;</li>
            <li><strong>h.</strong> Without cause, on 30 days’ prior written notice.</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
          <h4 className="text-gray-900 font-bold text-[15px] mb-2">16.4 Suspension</h4>
          <p className="text-sm">
            GameOn may temporarily suspend the Partner’s listing where a User complaint is under investigation, payment dispute is pending, risk of harm to Users exists, or where required by law.
          </p>
        </div>

        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2">16.5 Effects of Termination</h4>
          <p className="mb-2">Upon termination of the Agreement:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>The Partner’s Venue shall be removed from the Platform;</li>
            <li>All Bookings confirmed for dates prior to or on the termination effective date shall be honoured;</li>
            <li>Accrued payout after deductions will be settled on the next cycle;</li>
            <li>Survival: Clauses like §7(j) (Anti-Circumvention), §10 (Confidentiality), §11 (IP), §14 (Liability), §15 (Indemnification) survive.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "force-majeure",
    number: "16",
    title: "Force Majeure",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
        <p>
          Neither party shall be liable for any delay or failure to perform under the Agreement to the extent such delay or failure is caused by events beyond reasonable control, including acts of God, pandemics, epidemics, government action, war, terrorism, civil unrest, riots, floods, fires, earthquakes, cyclones, severe weather, internet or telecommunications outages, payment-gateway failures, or any other force-majeure event.
        </p>
        <p>
          The affected party shall notify the other promptly. If a force-majeure event continues for more than 30 days, either party may terminate the Agreement on notice without liability.
        </p>
      </div>
    ),
  },
  {
    id: "grievance-support",
    number: "17",
    title: "Grievance Officer & Customer Support",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
        <p>
          In accordance with the Information Technology Act, 2000, and rules made thereunder, the contact details of the Grievance Officer of GameOn are:
        </p>
        <div className="bg-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {[
              ["Grievance Officer", "Shivam Tiwari"],
              ["Designation", "Founder & Chief Executive Officer"],
              ["Registered Office Address", "KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001, India"],
              ["Email Address", "support@gameon-india.com"],
              ["Phone Number", "+91 88961 72818"],
              ["Support Hours", "Monday to Friday, 10:00 AM – 6:00 PM IST (excluding public holidays)"],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</span>
                <span className="block text-sm font-medium text-gray-100">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="bg-emerald-50 text-emerald-900 p-4 rounded-xl text-sm border border-emerald-100">
          The Grievance Officer will acknowledge a complaint within 48 hours of receipt and resolve it within 15 days (or such other period as is required by applicable rules).
        </p>
      </div>
    ),
  },
  {
    id: "notices-law",
    number: "18",
    title: "Notices & Governing Law",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
        <div>
          <h4 className="text-gray-900 font-bold text-lg mb-2">19. Notices</h4>
          <p>Any notice under the Agreement shall be in writing and shall be sent to GameOn by email to support@gameon-india.com or by post to the registered office. Notices to the Partner will be sent to their registered email or via the partner dashboard.</p>
        </div>
        
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-gray-900 font-bold text-lg mb-2">20. Governing Law & Dispute Resolution</h4>
          <p className="mb-3">This Agreement is governed by and construed in accordance with the laws of the Republic of India.</p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">•</span>
              <span><strong>Amicable Resolution:</strong> The parties shall first attempt in good faith to resolve any dispute amicably through written notice to the Grievance Officer.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-emerald-600">•</span>
              <span><strong>Arbitration / Courts:</strong> If not resolved within 30 days, either party may submit to the exclusive jurisdiction of the competent courts at Ghaziabad, Uttar Pradesh, India; or by mutual written consent, refer the dispute to arbitration before a sole arbitrator under the Arbitration and Conciliation Act, 1996 in Ghaziabad.</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "general",
    number: "19",
    title: "General Provisions",
    content: (
      <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
        {[
          ["21.1 Entire Agreement", "These Partner Terms constitute the entire agreement between the parties in respect of the Partner’s listing and operations on the Platform, and supersede all prior communications, representations, and agreements (oral or written) on the same subject."],
          ["21.2 Order of Precedence", "In the event of a conflict, the order of precedence is: (i) Commercial Schedule, (ii) Partner Onboarding Form, (iii) these Partner Terms, (iv) Privacy Policy."],
          ["21.3 Amendment", "GameOn may amend these Partner Terms from time to time. The Partner will be notified of material amendments through the dashboard or email at least 14 days before they take effect. Continued use constitutes acceptance."],
          ["21.4 Severability & Waiver", "If any provision is invalid or unenforceable, the remaining provisions continue in full force. No failure or delay in exercising any right constitutes a waiver."],
          ["21.6 Assignment", "The Partner may not assign this Agreement without GameOn's written consent. GameOn may assign it to an affiliate or successor on written notice."],
          ["21.7 No Partnership", "Nothing in this Agreement creates a partnership, joint venture, agency, franchise, or employment relationship."],
          ["21.8 Counterparts & Signatures", "This Agreement may be entered into electronically (including by ticking a box on the partner dashboard). Electronic signatures have the same legal effect as physical signatures."]
        ].map(([title, desc], idx) => (
          <div key={idx} className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
            <strong className="text-gray-900 block text-base mb-1">{title}</strong>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "contact",
    number: "20",
    title: "Contact & Acceptance",
    content: (
      <div className="space-y-6 text-gray-600 leading-relaxed text-[15px]">
        <p className="text-lg">For all queries related to these Partner Terms or your listing, please contact us through the following channels:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4">
          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shrink-0 shadow-sm">
              <Mail className="w-6 h-6" />
            </div>
            <strong className="text-gray-900 block mb-1">Email Support</strong>
            <a href="mailto:support@gameon-india.com" className="text-emerald-700 font-bold hover:underline break-all text-sm">support@gameon-india.com</a>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shrink-0 shadow-sm">
              <Phone className="w-6 h-6" />
            </div>
            <strong className="text-gray-900 block mb-1">Call Us</strong>
            <a href="tel:+918896172818" className="text-emerald-700 font-bold hover:underline text-sm">+91 88961 72818</a>
          </div>

          <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 shrink-0 shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <strong className="text-gray-900 block mb-1">Registered Office</strong>
            <span className="text-gray-600 text-xs">GameOn Sports Services Private Limited, KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-gray-900 font-black text-xl text-center mb-4">Acceptance Confirmation</h4>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center max-w-2xl mx-auto text-sm text-gray-700">
            By signing or accepting the Partner Onboarding Form, by listing a Venue or Slot on the Platform, or by accepting any Booking, the Partner confirms acceptance of these Partner Terms in their entirety and warrants that the individual accepting on behalf of the Partner has the authority to bind the Partner.
          </div>
        </div>
      </div>
    ),
  }
];

export default function PartnerTerms() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>("definitions");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* Minimal Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 py-3.5 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                window.close();
              }
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors bg-gray-50 hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-gray-200/50 shadow-sm cursor-pointer border-none outline-none"
          >
            <ArrowLeft className="w-4.5 h-4.5" /> Back
          </button>
          
          <img src="/mainlogo.png" alt="GameOn Logo" className="h-8 sm:h-9 object-contain" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-2 shadow-sm">
                <ShieldCheck className="w-4 h-4" /> Partner Agreement
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Partner Terms & <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Conditions</span>
              </h1>
              <div className="flex flex-wrap justify-center gap-4 lg:gap-8 pt-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Effective: 4 May 2026</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Last Updated: 1 June 2026</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> India</div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-3xl opacity-50" />
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col lg:flex-row gap-12 lg:gap-20 items-start flex-1">
        
        {/* Left: Sticky Table of Contents Sidebar */}
        <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-28">
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 lg:p-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Table of Contents</h3>
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl transition-all text-sm font-bold border ${
                    activeSection === s.id 
                      ? "bg-white shadow-sm text-emerald-600 border-gray-100" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-transparent"
                  }`}
                >
                  <span className={`text-[10px] uppercase tracking-wider ${activeSection === s.id ? "text-emerald-400" : "text-gray-400"}`}>{s.number}</span>
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right: Terms & Conditions content */}
        <div className="flex-1 space-y-16 max-w-3xl">
          {/* Introductory block */}
          <div className="bg-emerald-50/30 border border-emerald-100 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl" />
            <p className="text-gray-700 leading-relaxed font-medium text-sm sm:text-base">
              These Partner Terms & Conditions (these &quot;Partner Terms&quot;) are a legally binding agreement between you (the &quot;Partner&quot;, &quot;you&quot;, &quot;your&quot;) and <strong>GameOn Sports Services Private Limited</strong> (&quot;GameOn&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a company incorporated under the Companies Act, 2013, having:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 font-medium">
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>CIN:</strong> U93290UW2026PTC252581</li>
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>Date of Incorporation:</strong> 4 May 2026</li>
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>Registered Office:</strong> KH-126, Bypass Road, Shanti Shivpuri, Ghaziabad, Uttar Pradesh — 201001, India</li>
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>Email:</strong> support@gameon-india.com</li>
              <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>Phone:</strong> +91 88961 72818</li>
            </ul>
            <p className="mt-6 text-gray-700 leading-relaxed text-sm">
              By creating a Partner account on the GameOn Platform, accepting the GameOn Partner Onboarding Form, listing a venue or any slot on the Platform, accepting any booking, or otherwise availing of the Services, you confirm that you have read, understood, and agreed to be bound by these Partner Terms together with the Partner Onboarding Form (which includes the Commercial Schedule) and our Privacy Policy.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed text-sm">
              These Partner Terms, together with the Partner Onboarding Form, the Commercial Schedule, and any other written agreement signed between the Partner and GameOn, constitute the entire agreement between the parties in respect of the Partner’s listing and operations on the Platform (collectively, the &quot;Agreement&quot;).
            </p>
            <div className="bg-white/80 backdrop-blur border border-emerald-100 rounded-xl p-4 mt-6 text-xs text-emerald-800 font-bold text-center">
              These Partner Terms constitute a legally binding electronic record under the Information Technology Act, 2000 and the rules made thereunder, and do not require any digital or physical signature.
            </div>
          </div>

          {/* Section details */}
          {sections.map((section) => (
            <div 
              key={section.id} 
              id={section.id}
              className="scroll-mt-28 space-y-6 border-b border-gray-100 pb-12 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-700 text-sm shadow-sm">
                  {section.number}
                </span>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {section.title}
                </h2>
              </div>
              <div>
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 bg-gray-50/50">
        &copy; {new Date().getFullYear()} GameOn Sports Services Private Limited. All rights reserved.
      </footer>
    </div>
  );
}
