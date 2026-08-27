import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Crown, CheckCircle, Star, Users, Zap, Shield, Gift, ArrowRight, Mountain
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TIERS = [
  {
    id: "regular",
    name: "Regular",
    price: 100000,
    period: "/year",
    icon: Star,
    color: "glass-card",
    iconBg: "bg-[var(--stone)]",
    iconColor: "text-[var(--gold)]",
    popular: false,
    description: "Perfect for weekend adventurers who want exclusive access and savings on every hike.",
    perks: [
      "50% discount on all Abuja tourist trips",
      "Priority booking access for all hikes",
      "Special members-only hike events",
      "Community recognition badge on profile",
      "Access to members-only chat channel",
      "Monthly newsletter & upcoming events",
      "Early access to new destinations",
      "Member discount on merchandise (10%)",
    ],
    cta: "Get Regular Membership",
  },
  {
    id: "vip",
    name: "VIP",
    price: 500000,
    period: "/year",
    icon: Crown,
    color: "membership-vip",
    iconBg: "bg-[var(--gold)]",
    iconColor: "text-[oklch(0.08_0.01_240)]",
    popular: true,
    description: "The ultimate adventure lifestyle membership. Exclusive access, free trips, and premium perks.",
    perks: [
      "Free local trip to one tourist destination",
      "Exclusive VIP-only hike events (monthly)",
      "Access to all private & premium events",
      "VIP gold badge on profile",
      "Free merchandise welcome package (₦25,000 value)",
      "Dedicated concierge support line",
      "Priority emergency assistance",
      "Bring 2 guests for free per event",
      "20% discount on all merchandise",
      "Free photography prints from events",
      "VIP lounge access at events",
      "Annual VIP gala invitation",
    ],
    cta: "Get VIP Membership",
  },
];

const COMPARISON = [
  { feature: "Hike Discounts", regular: "50% off Abuja trips", vip: "All trips included" },
  { feature: "Priority Booking", regular: true, vip: true },
  { feature: "Members-only Events", regular: true, vip: true },
  { feature: "VIP-only Events", regular: false, vip: true },
  { feature: "Free Trip Included", regular: false, vip: "1 trip/year" },
  { feature: "Guest Passes", regular: false, vip: "2 per event" },
  { feature: "Merchandise Discount", regular: "10%", vip: "20%" },
  { feature: "Welcome Package", regular: false, vip: "₦25,000 value" },
  { feature: "Concierge Support", regular: false, vip: true },
  { feature: "Emergency Priority", regular: false, vip: true },
  { feature: "Annual Gala", regular: false, vip: true },
];

const FAQS = [
  {
    q: "How do I activate my membership?",
    a: "After payment is confirmed via Paystack or Flutterwave, your membership is automatically activated within 24 hours. You'll receive a confirmation email with your member ID.",
  },
  {
    q: "Can I upgrade from Regular to VIP?",
    a: "Yes! You can upgrade at any time. We'll prorate the remaining value of your Regular membership against the VIP price.",
  },
  {
    q: "What is the free trip included in VIP?",
    a: "VIP members get one fully-sponsored trip to a partner tourist destination per year. Destinations include Obudu Mountain Resort, Yankari National Park, and more.",
  },
  {
    q: "Are membership fees refundable?",
    a: "Memberships are non-refundable after 14 days of activation. Within 14 days, you can request a full refund if no benefits have been used.",
  },
  {
    q: "Do membership discounts apply to all hikes?",
    a: "Regular membership gives 50% off Abuja tourist trips. VIP membership covers all local trips and provides significant discounts on premium trips.",
  },
];

export default function Membership() {
  const { isAuthenticated, user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatPrice = (p: number) => `₦${p.toLocaleString("en-NG")}`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-16 bg-[oklch(0.09_0.012_240)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.72_0.18_75/0.04)] to-transparent pointer-events-none" />
        <div className="container text-center relative">
          <div className="section-label justify-center mb-5">Exclusive Access</div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-5">
            Choose Your<br />
            <span className="text-gradient-gold italic">Adventure Level</span>
          </h1>
          <p className="text-[oklch(0.62_0.02_240)] max-w-xl mx-auto text-lg">
            Unlock exclusive hikes, premium discounts, and a community of passionate adventurers. The more you invest, the more you experience.
          </p>
          {isAuthenticated && user != null && user.membershipType !== "free" && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[oklch(0.72_0.18_75/0.1)] border border-[oklch(0.72_0.18_75/0.3)]">
              <Crown className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-sm font-semibold text-[var(--gold)]">
                You are a {user?.membershipType?.toUpperCase()} Member
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TIERS.map((tier) => (
              <div key={tier.id} className={`rounded-3xl p-8 relative ${tier.color}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="badge-pill badge-gold px-5 py-2 text-sm">Most Exclusive</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tier.iconBg}`}>
                    <tier.icon className={`w-6 h-6 ${tier.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-hero text-3xl tracking-widest text-white">{tier.name}</h3>
                    <p className="text-xs text-[oklch(0.55_0.02_240)] uppercase tracking-wider">Membership</p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="font-hero text-5xl text-[var(--gold)]">{formatPrice(tier.price)}</span>
                  <span className="text-[oklch(0.55_0.02_240)]">{tier.period}</span>
                </div>
                <p className="text-sm text-[oklch(0.65_0.02_240)] mb-7 leading-relaxed">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[var(--gold)] mt-0.5 shrink-0" />
                      <span className="text-sm text-[oklch(0.75_0.02_240)]">{perk}</span>
                    </li>
                  ))}
                </ul>
                {isAuthenticated ? (
                  <button className={`w-full justify-center ${tier.popular ? "btn-gold" : "btn-outline-gold"}`}>
                    {tier.cta}
                  </button>
                ) : (
                  <a href={getLoginUrl()} className={`w-full justify-center flex items-center gap-2 ${tier.popular ? "btn-gold" : "btn-outline-gold"}`}>
                    Sign In to Subscribe
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label justify-center mb-4">Side by Side</div>
            <h2 className="font-display text-3xl font-bold text-white">Feature Comparison</h2>
          </div>
          <div className="max-w-3xl mx-auto glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[var(--muted)] px-6 py-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[oklch(0.55_0.02_240)]">Feature</div>
              <div className="text-center text-xs font-bold uppercase tracking-wider text-[oklch(0.75_0.02_240)]">Regular</div>
              <div className="text-center text-xs font-bold uppercase tracking-wider text-[var(--gold)]">VIP</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 px-6 py-4 ${i % 2 === 0 ? "" : "bg-[var(--muted)/30]"}`}>
                <div className="text-sm text-[oklch(0.72_0.02_240)]">{row.feature}</div>
                <div className="text-center">
                  {typeof row.regular === "boolean" ? (
                    row.regular ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <span className="text-[oklch(0.35_0.02_240)]">—</span>
                  ) : (
                    <span className="text-xs text-[oklch(0.72_0.02_240)]">{row.regular}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof row.vip === "boolean" ? (
                    row.vip ? <CheckCircle className="w-4 h-4 text-[var(--gold)] mx-auto" /> : <span className="text-[oklch(0.35_0.02_240)]">—</span>
                  ) : (
                    <span className="text-xs text-[var(--gold)] font-semibold">{row.vip}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <div className="section-label justify-center mb-4">Got Questions?</div>
            <h2 className="font-display text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  <span className={`text-[var(--gold)] transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-[oklch(0.65_0.02_240)] leading-relaxed border-t border-[var(--border)]">
                    <div className="pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[oklch(0.09_0.012_240)]">
        <div className="container text-center">
          <Mountain className="w-12 h-12 text-[var(--gold)] mx-auto mb-5 animate-float" />
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to Join the Adventure?</h2>
          <p className="text-[oklch(0.62_0.02_240)] mb-8 max-w-md mx-auto">Start your membership today and unlock a world of adventure, community, and unforgettable experiences.</p>
          {isAuthenticated ? (
            <button className="btn-gold px-10 py-4">Activate Membership Now</button>
          ) : (
            <a href={getLoginUrl()} className="btn-gold px-10 py-4">Create Account & Subscribe</a>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
