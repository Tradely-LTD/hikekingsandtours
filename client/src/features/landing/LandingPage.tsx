import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Mountain, ArrowRight, Star, Users, Calendar, Shield, Camera, Tent,
  Globe, Award, ChevronRight, Play, CheckCircle, Zap, Crown, MapPin,
  TrendingUp, Heart, Compass, Clock
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURED_HIKES = [
  {
    id: 1, title: "Waterfall Adventure", location: "Gurara Falls, Niger State",
    price: "₦5,000", category: "Standard", difficulty: "Moderate",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80",
    badge: "Most Popular", badgeClass: "badge-gold",
    includes: ["Water", "Energy Drinks", "Fruits", "Guide"],
  },
  {
    id: 2, title: "Sunrise Hike", location: "Aso Rock, Abuja",
    price: "₦5,000", category: "Standard", difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    badge: "Early Bird", badgeClass: "badge-green",
    includes: ["Breakfast", "Water", "Guide", "First Aid"],
  },
  {
    id: 3, title: "Night Glow Hike", location: "Zuma Rock, Niger State",
    price: "₦7,500", category: "Premium", difficulty: "Moderate",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
    badge: "Night Special", badgeClass: "badge-gold",
    includes: ["Glow Sticks", "Music", "Water", "Guide"],
  },
  {
    id: 4, title: "Green Heroes Hike", location: "Yankari National Park",
    price: "₦5,000", category: "Standard", difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    badge: "Eco Friendly", badgeClass: "badge-green",
    includes: ["Tree Planting", "Water", "Guide", "Certificate"],
  },
  {
    id: 5, title: "Obudu Mountain Resort", location: "Cross River State",
    price: "₦35,000", category: "Premium", difficulty: "Challenging",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    badge: "Premium Trip", badgeClass: "badge-gold",
    includes: ["Transport", "Accommodation", "Meals", "Guide"],
  },
  {
    id: 6, title: "Photography Safari", location: "Kainji Lake National Park",
    price: "₦25,000", category: "Photography", difficulty: "Easy",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
    badge: "Photo Tour", badgeClass: "badge-green",
    includes: ["Photography Guide", "Transport", "Water", "Prints"],
  },
];

const EXPERIENCES = [
  { icon: Mountain, title: "Hiking", desc: "Explore Nigeria's most breathtaking trails with expert guides.", color: "from-[oklch(0.32_0.1_160)] to-[oklch(0.22_0.08_160)]" },
  { icon: Tent, title: "Camping", desc: "Overnight adventures under the stars with full camp setup.", color: "from-[oklch(0.28_0.1_220)] to-[oklch(0.18_0.08_220)]" },
  { icon: Camera, title: "Photography Tours", desc: "Capture stunning landscapes with professional photography guides.", color: "from-[oklch(0.32_0.1_55)] to-[oklch(0.22_0.08_55)]" },
  { icon: Globe, title: "Cultural Experiences", desc: "Immerse in Nigeria's rich heritage, traditions, and local communities.", color: "from-[oklch(0.30_0.1_290)] to-[oklch(0.20_0.08_290)]" },
];

const STATS = [
  { value: "2,500+", label: "Active Members" },
  { value: "180+", label: "Hikes Completed" },
  { value: "15+", label: "Destinations" },
  { value: "4.9", label: "Average Rating" },
];

const MEMBERSHIP_TIERS = [
  {
    name: "Regular", price: "₦100,000", period: "/year", popular: false,
    color: "border-[var(--border)]",
    perks: [
      "50% discount on Abuja tourist trips",
      "Priority booking for all hikes",
      "Special members-only hike events",
      "Community recognition badge",
      "Access to members chat",
      "Monthly newsletter & updates",
    ],
  },
  {
    name: "VIP", price: "₦500,000", period: "/year", popular: true,
    color: "membership-vip",
    perks: [
      "Free local trip to one tourist destination",
      "Exclusive VIP-only hike events",
      "Access to all private events",
      "VIP badge on profile",
      "Free merchandise package",
      "Dedicated concierge support",
      "Priority emergency assistance",
      "Bring 2 guests for free per event",
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Amaka Okonkwo", title: "VIP Member since 2023",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
    text: "Hike Kings completely changed my weekends. The community is incredible — I've made lifelong friends on these trails. The VIP membership is absolutely worth every naira.",
    rating: 5, hike: "Waterfall Adventure",
  },
  {
    name: "Emeka Adeyemi", title: "Regular Member",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    text: "I was skeptical at first, but after my first hike I was hooked. The guides are professional, safety is top priority, and the experiences are genuinely world-class.",
    rating: 5, hike: "Sunrise Hike",
  },
  {
    name: "Fatima Bello", title: "Corporate Client",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&q=80",
    text: "We booked a corporate retreat for 40 people. The team handled everything flawlessly. Our employees still talk about it months later. Highly recommend for team building.",
    rating: 5, hike: "Corporate Retreat",
  },
];

const PARTNERS = [
  { name: "Zuma Rock Resort", location: "Niger State", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80" },
  { name: "Yankari National Park", location: "Bauchi State", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80" },
  { name: "Obudu Mountain Resort", location: "Cross River State", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
  { name: "Almat Farmz", location: "Abuja, FCT", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80" },
];

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Components ───────────────────────────────────────────────────────────────
function HikeCard({ hike, delay = 0 }: { hike: typeof FEATURED_HIKES[0]; delay?: number }) {
  return (
    <div className={`hike-card reveal delay-${delay} group`} style={{ height: "380px" }}>
      <img src={hike.image} alt={hike.title} className="hike-card-img absolute inset-0" />
      <div className="hike-card-overlay" />
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className={`badge-pill ${hike.badgeClass}`}>{hike.badge}</span>
          <span className="badge-pill badge-gold">{hike.difficulty}</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
            <span className="text-xs text-[oklch(0.75_0.01_240)]">{hike.location}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-3">{hike.title}</h3>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {hike.includes.slice(0, 3).map((inc) => (
              <span key={inc} className="text-[0.65rem] text-[oklch(0.72_0.02_240)] bg-white/10 px-2 py-0.5 rounded-full">{inc}</span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-hero text-[var(--gold)]">{hike.price}</span>
              <span className="text-xs text-[oklch(0.62_0.02_240)] ml-1">per person</span>
            </div>
            <Link href="/hikes" className="btn-gold text-xs py-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuth();
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=90"
            alt="Hero hiking"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.05_0.01_240/0.92)] via-[oklch(0.05_0.01_240/0.65)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.05_0.01_240/0.8)] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative container pt-24 pb-16">
          <div className="max-w-3xl">
            <div className="section-label mb-6 animate-fade-up">
              Nigeria's Premier Adventure Community
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fade-up delay-100">
              Explore Nature.{" "}
              <span className="text-gradient-gold italic">Build Connections.</span>{" "}
              Experience Adventure.
            </h1>
            <p className="text-lg text-[oklch(0.78_0.01_240)] max-w-xl leading-relaxed mb-10 animate-fade-up delay-200">
              Join thousands of adventure enthusiasts exploring Nigeria's most breathtaking destinations every weekend. Premium experiences, certified guides, and a community that feels like family.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up delay-300">
              <Link href="/hikes" className="btn-gold text-sm px-8 py-4">
                <Mountain className="w-4 h-4" />
                Join a Hike
              </Link>
              <Link href="/membership" className="btn-outline-gold text-sm px-8 py-4">
                <Crown className="w-4 h-4" />
                Become a Member
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-12 animate-fade-up delay-400">
              {[
                { icon: Shield, text: "Certified Guides" },
                { icon: Award, text: "Safety First" },
                { icon: Users, text: "2,500+ Members" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[var(--gold)]" />
                  <span className="text-sm text-[oklch(0.72_0.01_240)]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-[var(--gold)] opacity-60" />
          <span className="text-[0.6rem] tracking-[0.3em] uppercase text-[oklch(0.55_0.02_240)]">Scroll</span>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-12 bg-[oklch(0.10_0.015_240)] border-y border-white/5">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={stat.label} className={`text-center reveal delay-${i * 100}`}>
                <div className="stat-number">{stat.value}</div>
                <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[oklch(0.55_0.02_240)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED HIKES ────────────────────────────────────────────────── */}
      <section className="py-24" id="hikes">
        <div className="container">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="section-label mb-4 reveal">This Weekend's Adventures</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white reveal delay-100">
                Featured Hikes & Trips
              </h2>
            </div>
            <Link href="/hikes" className="hidden md:flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:gap-3 transition-all reveal">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_HIKES.map((hike, i) => (
              <HikeCard key={hike.id} hike={hike} delay={(i % 3) * 100} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/hikes" className="btn-outline-gold">
              Explore All Hikes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOOKING WINDOW BANNER ─────────────────────────────────────────── */}
      <section className="py-8 bg-gradient-to-r from-[oklch(0.15_0.03_75)] via-[oklch(0.12_0.02_240)] to-[oklch(0.15_0.03_75)] border-y border-[oklch(0.72_0.18_75/0.2)]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <Clock className="w-6 h-6 text-[var(--gold)] animate-pulse-gold shrink-0" />
            <div>
              <span className="font-hero text-2xl text-[var(--gold)] tracking-widest">BOOKING WINDOW: </span>
              <span className="font-display text-xl text-white font-semibold"> Wednesday – Friday at 11:00 PM</span>
            </div>
            <span className="text-sm text-[oklch(0.62_0.02_240)] md:ml-4">Limited spots — book early to secure your place</span>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCES ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="text-center mb-16">
            <div className="section-label justify-center mb-4 reveal">What We Offer</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white reveal delay-100">
              Every Adventure, One Platform
            </h2>
            <p className="text-[oklch(0.62_0.02_240)] max-w-xl mx-auto mt-4 reveal delay-200">
              From sunrise hikes to overnight camping, photography tours to cultural immersions — we curate experiences that stay with you forever.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPERIENCES.map((exp, i) => (
              <div key={exp.title} className={`reveal delay-${i * 100} glass-card p-7 group hover:border-[oklch(0.72_0.18_75/0.3)] transition-all`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exp.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <exp.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{exp.title}</h3>
                <p className="text-sm text-[oklch(0.58_0.02_240)] leading-relaxed">{exp.desc}</p>
                <Link href="/experiences" className="flex items-center gap-1.5 text-xs font-semibold text-[var(--gold)] mt-4 hover:gap-2.5 transition-all">
                  Explore <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ─────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label mb-5 reveal">Our Community</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 reveal delay-100">
                More Than a Hike.<br />
                <span className="text-gradient-gold italic">A Family.</span>
              </h2>
              <p className="text-[oklch(0.65_0.02_240)] leading-relaxed mb-8 reveal delay-200">
                Hike Kings is built on the belief that adventure is better shared. Every weekend, hundreds of members come together — strangers who become friends, friends who become family. Our community features keep everyone connected between hikes.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8 reveal delay-300">
                {[
                  { icon: Users, title: "Community Chat", desc: "Connect with fellow hikers" },
                  { icon: Award, title: "Badges & Ranks", desc: "Earn rewards for milestones" },
                  { icon: TrendingUp, title: "Leaderboard", desc: "Weekly & monthly rankings" },
                  { icon: Heart, title: "Lost & Found", desc: "Help each other out" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="glass-card p-4">
                    <Icon className="w-5 h-5 text-[var(--gold)] mb-2" />
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="text-xs text-[oklch(0.55_0.02_240)] mt-0.5">{desc}</div>
                  </div>
                ))}
              </div>
              <Link href="/community" className="btn-gold reveal delay-400">
                Join the Community <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative reveal delay-200">
              <div className="grid grid-cols-2 gap-3">
                <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=400&q=80" alt="Community" className="rounded-2xl w-full h-52 object-cover" />
                <img src="https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400&q=80" alt="Community" className="rounded-2xl w-full h-52 object-cover mt-8" />
                <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80" alt="Community" className="rounded-2xl w-full h-52 object-cover -mt-4" />
                <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80" alt="Community" className="rounded-2xl w-full h-52 object-cover mt-4" />
              </div>
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["photo-1531123897727-8f129e1688ce", "photo-1507003211169-0a1dd7228f2d", "photo-1494790108755-2616b612b47c"].map((id) => (
                      <img key={id} src={`https://images.unsplash.com/${id}?w=40&q=80`} alt="" className="w-8 h-8 rounded-full border-2 border-[var(--card)] object-cover" />
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">2,500+ Members</div>
                    <div className="text-[0.65rem] text-[oklch(0.55_0.02_240)]">Active this month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4 reveal">Our Destinations</div>
            <h2 className="font-display text-4xl font-bold text-white reveal delay-100">Partner Destinations</h2>
            <p className="text-[oklch(0.62_0.02_240)] mt-3 reveal delay-200">Premium locations across Nigeria, handpicked for unforgettable experiences.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {PARTNERS.map((partner, i) => (
              <div key={partner.name} className={`reveal delay-${i * 100} group relative rounded-2xl overflow-hidden`} style={{ height: "260px" }}>
                <img src={partner.image} alt={partner.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.05_0.01_240/0.9)] via-[oklch(0.05_0.01_240/0.3)] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="font-display font-bold text-white text-sm">{partner.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-[var(--gold)]" />
                    <span className="text-[0.65rem] text-[oklch(0.72_0.01_240)]">{partner.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMBERSHIP ────────────────────────────────────────────────────── */}
      <section className="py-24" id="membership">
        <div className="container">
          <div className="text-center mb-16">
            <div className="section-label justify-center mb-4 reveal">Exclusive Access</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white reveal delay-100">
              Choose Your Adventure Level
            </h2>
            <p className="text-[oklch(0.62_0.02_240)] max-w-lg mx-auto mt-4 reveal delay-200">
              Unlock exclusive hikes, discounts, and community perks. The more you invest, the more you experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {MEMBERSHIP_TIERS.map((tier, i) => (
              <div
                key={tier.name}
                className={`reveal delay-${i * 200} rounded-2xl p-8 relative ${tier.popular ? "membership-vip" : "glass-card"}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge-pill badge-gold px-4 py-1.5 text-xs">Most Exclusive</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.popular ? "bg-[var(--gold)]" : "bg-[var(--stone)]"}`}>
                    <Crown className={`w-5 h-5 ${tier.popular ? "text-[oklch(0.08_0.01_240)]" : "text-[var(--gold)]"}`} />
                  </div>
                  <div>
                    <h3 className="font-hero text-2xl tracking-widest text-white">{tier.name}</h3>
                    <div className="text-xs text-[oklch(0.55_0.02_240)] uppercase tracking-wider">Membership</div>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="font-hero text-4xl text-[var(--gold)]">{tier.price}</span>
                  <span className="text-[oklch(0.55_0.02_240)] text-sm">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[var(--gold)] mt-0.5 shrink-0" />
                      <span className="text-sm text-[oklch(0.72_0.02_240)]">{perk}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/membership" className={tier.popular ? "btn-gold w-full justify-center" : "btn-outline-gold w-full justify-center"}>
                  Get {tier.name} Access
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEDIA GALLERY ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="section-label mb-4 reveal">See What You're Missing</div>
              <h2 className="font-display text-4xl font-bold text-white reveal delay-100">Adventure Gallery</h2>
            </div>
            <Link href="/gallery" className="hidden md:flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:gap-3 transition-all reveal">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80", span: "col-span-2 row-span-2", h: "h-80" },
              { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", span: "", h: "h-36" },
              { url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80", span: "", h: "h-36" },
              { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80", span: "", h: "h-36" },
              { url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", span: "", h: "h-36" },
              { url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80", span: "col-span-2", h: "h-36" },
            ].map((item, i) => (
              <div key={i} className={`${item.span} relative rounded-xl overflow-hidden group cursor-pointer`}>
                <img src={item.url} alt="" className={`w-full ${item.h} object-cover transition-transform duration-500 group-hover:scale-110`} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-6">
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[oklch(0.62_0.02_240)] hover:text-[var(--gold)] transition-colors">
                <span className="w-8 h-8 rounded-full bg-[var(--stone)] flex items-center justify-center">▶</span>
                YouTube
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[oklch(0.62_0.02_240)] hover:text-[var(--gold)] transition-colors">
                <span className="w-8 h-8 rounded-full bg-[var(--stone)] flex items-center justify-center">📷</span>
                Instagram
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[oklch(0.62_0.02_240)] hover:text-[var(--gold)] transition-colors">
                <span className="w-8 h-8 rounded-full bg-[var(--stone)] flex items-center justify-center">♪</span>
                TikTok
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4 reveal">Real Stories</div>
            <h2 className="font-display text-4xl font-bold text-white reveal delay-100">What Our Members Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`reveal delay-${i * 150} glass-card p-7`}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[var(--gold)] text-[var(--gold)]" />
                  ))}
                </div>
                <p className="text-[oklch(0.72_0.02_240)] leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs text-[oklch(0.55_0.02_240)]">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAFETY ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <div className="section-label mb-5">Your Safety, Our Priority</div>
              <h2 className="font-display text-4xl font-bold text-white mb-5">
                Adventure with <span className="text-gradient-gold">Confidence</span>
              </h2>
              <p className="text-[oklch(0.62_0.02_240)] leading-relaxed mb-8">
                Every hike is backed by certified guides, first aid support, and real-time safety protocols. We take your safety as seriously as the adventure itself.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, title: "Certified Guides", desc: "All guides are professionally trained & certified" },
                  { icon: Zap, title: "Emergency Contacts", desc: "24/7 emergency response system" },
                  { icon: Compass, title: "Route Planning", desc: "Thoroughly scouted and mapped trails" },
                  { icon: Heart, title: "First Aid Support", desc: "Medical kits and trained responders on every hike" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[oklch(0.72_0.18_75/0.1)] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[var(--gold)]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{title}</div>
                      <div className="text-xs text-[oklch(0.55_0.02_240)] mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal delay-200 relative">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80"
                alt="Safety"
                className="rounded-2xl w-full h-80 object-cover"
              />
              <div className="absolute -bottom-5 -right-5 glass rounded-2xl p-5 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-[var(--gold)]" />
                  <span className="font-bold text-white">Zero Incidents</span>
                </div>
                <p className="text-xs text-[oklch(0.55_0.02_240)]">180+ hikes completed with zero major safety incidents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORPORATE CTA ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <div className="glass-card p-10 md:p-14 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.72_0.18_75/0.05)] to-transparent pointer-events-none" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="section-label mb-4 reveal">For Businesses</div>
                <h2 className="font-display text-4xl font-bold text-white mb-4 reveal delay-100">
                  Corporate Team Building Packages
                </h2>
                <p className="text-[oklch(0.65_0.02_240)] leading-relaxed mb-6 reveal delay-200">
                  Transform your team dynamics with outdoor adventures. Custom packages from ₦2M to ₦5M for groups of 10 to 500+. Full event management, catering, and post-event reporting included.
                </p>
                <div className="flex flex-wrap gap-3 mb-8 reveal delay-300">
                  {["Custom Itineraries", "Private Guides", "Full Catering", "Safety Briefings", "Post-Event Report"].map((f) => (
                    <span key={f} className="badge-pill badge-gold">{f}</span>
                  ))}
                </div>
                <Link href="/corporate" className="btn-gold reveal delay-400">
                  Get a Custom Quote <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="reveal delay-200">
                <div className="grid grid-cols-3 gap-3">
                  {["₦2M", "₦3.5M", "₦5M"].map((price, i) => (
                    <div key={price} className={`rounded-xl p-5 text-center ${i === 1 ? "bg-[oklch(0.72_0.18_75/0.15)] border border-[oklch(0.72_0.18_75/0.3)]" : "bg-[var(--stone)]"}`}>
                      <div className="font-hero text-2xl text-[var(--gold)]">{price}</div>
                      <div className="text-xs text-[oklch(0.55_0.02_240)] mt-1">{["Basic", "Premium", "Enterprise"][i]}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-[var(--stone)] text-center">
                  <div className="text-sm text-[oklch(0.72_0.02_240)]">Teams of <span className="text-[var(--gold)] font-bold">10 – 500+</span> participants</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" alt="CTA" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[oklch(0.05_0.01_240/0.85)]" />
        </div>
        <div className="relative container text-center">
          <div className="section-label justify-center mb-6 reveal">Start Your Journey</div>
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 reveal delay-100">
            Your Next Adventure<br />
            <span className="text-gradient-gold italic">Awaits You</span>
          </h2>
          <p className="text-[oklch(0.72_0.01_240)] max-w-lg mx-auto mb-10 reveal delay-200">
            Join thousands of adventurers who have discovered the best of Nigeria's outdoors with Hike Kings. Your first hike is just one click away.
          </p>
          <div className="flex flex-wrap gap-4 justify-center reveal delay-300">
            <Link href="/hikes" className="btn-gold text-sm px-10 py-4">
              <Mountain className="w-4 h-4" />
              Book Your First Hike
            </Link>
            {!isAuthenticated && (
              <a href={getLoginUrl()} className="btn-outline-gold text-sm px-10 py-4">
                Create Free Account
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
