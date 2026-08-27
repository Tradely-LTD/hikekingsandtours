import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Mountain, MapPin, Clock, Users, Filter, Search, Star,
  CheckCircle, X, Calendar, AlertCircle, ChevronDown, ArrowRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ALL_HIKES = [
  {
    id: 1, title: "Waterfall Adventure Hike", slug: "waterfall-adventure",
    location: "Gurara Falls, Niger State", category: "standard", difficulty: "moderate",
    price: 5000, memberPrice: 4000, vipPrice: 3500,
    duration: "6 hours", maxParticipants: 50, currentParticipants: 32,
    eventDate: "2026-04-05T06:00:00", featured: true,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80",
    shortDescription: "Explore the majestic Gurara Falls with a guided trek through lush forest trails.",
    includes: ["Water", "Energy Drinks", "Fruits", "Certified Guide", "First Aid", "Security"],
    requirements: ["Comfortable hiking shoes", "Sunscreen", "Light backpack"],
    theme: "Waterfall Adventure",
  },
  {
    id: 2, title: "Sunrise Hike & Breakfast", slug: "sunrise-hike",
    location: "Aso Rock, Abuja", category: "standard", difficulty: "easy",
    price: 5000, memberPrice: 4000, vipPrice: 3500,
    duration: "4 hours", maxParticipants: 40, currentParticipants: 18,
    eventDate: "2026-04-12T05:30:00", featured: true,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    shortDescription: "Watch the sunrise from Abuja's iconic Aso Rock. Breakfast included.",
    includes: ["Breakfast", "Water", "Guide", "First Aid"],
    requirements: ["Warm jacket", "Comfortable shoes"],
    theme: "Sunrise Hike",
  },
  {
    id: 3, title: "Night Glow Hike", slug: "night-glow",
    location: "Zuma Rock, Niger State", category: "premium", difficulty: "moderate",
    price: 7500, memberPrice: 6000, vipPrice: 5000,
    duration: "5 hours", maxParticipants: 35, currentParticipants: 28,
    eventDate: "2026-04-19T19:00:00", featured: true,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80",
    shortDescription: "Hike Zuma Rock at night with glow sticks, music, and an unforgettable atmosphere.",
    includes: ["Glow Sticks", "Music", "Water", "Guide", "Security"],
    requirements: ["Torchlight", "Comfortable shoes", "Warm jacket"],
    theme: "Night Glow",
  },
  {
    id: 4, title: "Green Heroes Hike", slug: "green-heroes",
    location: "Yankari National Park, Bauchi", category: "standard", difficulty: "easy",
    price: 5000, memberPrice: 4000, vipPrice: 3500,
    duration: "5 hours", maxParticipants: 60, currentParticipants: 12,
    eventDate: "2026-04-26T07:00:00", featured: false,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    shortDescription: "Environmental awareness hike with tree planting and nature conservation activities.",
    includes: ["Tree Planting Kit", "Water", "Guide", "Certificate"],
    requirements: ["Comfortable shoes", "Gloves"],
    theme: "Green Heroes",
  },
  {
    id: 5, title: "Obudu Mountain Premium Trip", slug: "obudu-mountain",
    location: "Obudu Mountain Resort, Cross River", category: "premium", difficulty: "challenging",
    price: 35000, memberPrice: 28000, vipPrice: 20000,
    duration: "2 days", maxParticipants: 25, currentParticipants: 10,
    eventDate: "2026-05-03T06:00:00", featured: true,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    shortDescription: "A premium 2-day expedition to one of Nigeria's most stunning mountain resorts.",
    includes: ["Transport", "Accommodation", "All Meals", "Guide", "First Aid"],
    requirements: ["Hiking boots", "Backpack", "Warm clothing"],
    theme: "Premium Trip",
  },
  {
    id: 6, title: "Photography Safari Tour", slug: "photography-safari",
    location: "Kainji Lake National Park", category: "photography", difficulty: "easy",
    price: 25000, memberPrice: 20000, vipPrice: 15000,
    duration: "8 hours", maxParticipants: 20, currentParticipants: 8,
    eventDate: "2026-05-10T07:00:00", featured: false,
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
    shortDescription: "Capture Nigeria's wildlife and landscapes with a professional photography guide.",
    includes: ["Photography Guide", "Transport", "Water", "Printed Photos"],
    requirements: ["Camera or phone", "Comfortable shoes"],
    theme: "Photography Tour",
  },
  {
    id: 7, title: "Unity Hike", slug: "unity-hike",
    location: "Abuja Hills, FCT", category: "standard", difficulty: "easy",
    price: 5000, memberPrice: 4000, vipPrice: 3500,
    duration: "4 hours", maxParticipants: 80, currentParticipants: 45,
    eventDate: "2026-05-17T06:30:00", featured: false,
    image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&q=80",
    shortDescription: "A community-building hike promoting unity and social bonding.",
    includes: ["Water", "Energy Drinks", "Guide", "Community Activities"],
    requirements: ["Comfortable shoes"],
    theme: "Unity Hike",
  },
  {
    id: 8, title: "Camping Adventure", slug: "camping-adventure",
    location: "Suleja Dam, Niger State", category: "camping", difficulty: "moderate",
    price: 50000, memberPrice: 40000, vipPrice: 30000,
    duration: "3 days", maxParticipants: 30, currentParticipants: 15,
    eventDate: "2026-05-24T09:00:00", featured: false,
    image: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=600&q=80",
    shortDescription: "3-day camping experience with hiking, campfire, and outdoor activities.",
    includes: ["Camping Gear", "All Meals", "Guide", "Activities"],
    requirements: ["Sleeping bag", "Warm clothing", "Hiking boots"],
    theme: "Camping",
  },
];

const CATEGORIES = ["all", "standard", "premium", "camping", "photography", "cultural"];
const DIFFICULTIES = ["all", "easy", "moderate", "challenging", "extreme"];

function isBookingOpen(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 3=Wed, 4=Thu, 5=Fri
  const hour = now.getHours();
  const minute = now.getMinutes();
  const isWedToFri = day >= 3 && day <= 5;
  const isAfter11PM = hour === 23 || (hour === 23 && minute >= 0);
  return isWedToFri && isAfter11PM;
}

function getNextBookingWindow(): string {
  const now = new Date();
  const day = now.getDay();
  let daysUntilWed = (3 - day + 7) % 7;
  if (daysUntilWed === 0 && now.getHours() >= 23) daysUntilWed = 7;
  const next = new Date(now);
  next.setDate(next.getDate() + daysUntilWed);
  next.setHours(23, 0, 0, 0);
  return next.toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" }) + " at 11:00 PM";
}

export default function Hikes() {
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedHike, setSelectedHike] = useState<typeof ALL_HIKES[0] | null>(null);
  const [bookingOpen] = useState(isBookingOpen());

  const filtered = ALL_HIKES.filter((h) => {
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || h.category === category;
    const matchDiff = difficulty === "all" || h.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  const getPrice = (hike: typeof ALL_HIKES[0]) => {
    if (user?.membershipType === "vip") return hike.vipPrice;
    if (user?.membershipType === "regular") return hike.memberPrice;
    return hike.price;
  };

  const formatPrice = (p: number) => `₦${p.toLocaleString("en-NG")}`;
  const spotsLeft = (h: typeof ALL_HIKES[0]) => h.maxParticipants - h.currentParticipants;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-12 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="section-label mb-4">Adventure Awaits</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Upcoming Hikes & Trips</h1>
          <p className="text-[oklch(0.62_0.02_240)] max-w-xl">Browse all upcoming adventures. Booking opens every Wednesday at 11:00 PM and closes Friday at 11:00 PM.</p>

          {/* Booking Window Alert */}
          <div className={`mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${bookingOpen ? "bg-[oklch(0.32_0.1_160/0.15)] border-[oklch(0.32_0.1_160/0.4)] text-[oklch(0.72_0.18_160)]" : "bg-[oklch(0.72_0.18_75/0.08)] border-[oklch(0.72_0.18_75/0.3)] text-[var(--gold)]"}`}>
            {bookingOpen ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            <span className="text-sm font-semibold">
              {bookingOpen ? "Booking is OPEN now! Secure your spot." : `Next booking window: ${getNextBookingWindow()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[oklch(0.10_0.015_240)] border-b border-white/5 py-4">
        <div className="container flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.45_0.02_240)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hikes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${category === cat ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "bg-[var(--muted)] text-[oklch(0.62_0.02_240)] hover:text-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hike Grid */}
      <div className="container py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Mountain className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
            <p className="text-[oklch(0.55_0.02_240)]">No hikes match your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((hike) => (
              <div
                key={hike.id}
                className="hike-card group cursor-pointer"
                style={{ height: "360px" }}
                onClick={() => setSelectedHike(hike)}
              >
                <img src={hike.image} alt={hike.title} className="hike-card-img absolute inset-0" />
                <div className="hike-card-overlay" />
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`badge-pill ${hike.featured ? "badge-gold" : "badge-green"}`}>
                      {hike.featured ? "Featured" : hike.category}
                    </span>
                    <span className={`badge-pill ${hike.difficulty === "easy" ? "badge-green" : hike.difficulty === "challenging" ? "badge-red" : "badge-gold"}`}>
                      {hike.difficulty}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
                      <span className="text-xs text-[oklch(0.75_0.01_240)]">{hike.location}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-1">{hike.title}</h3>
                    <div className="flex items-center gap-3 mb-3 text-xs text-[oklch(0.65_0.02_240)]">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{hike.duration}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{spotsLeft(hike)} spots left</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-hero text-[var(--gold)]">{formatPrice(getPrice(hike))}</span>
                        {user?.membershipType !== "free" && (
                          <span className="text-xs text-[oklch(0.55_0.02_240)] line-through ml-2">{formatPrice(hike.price)}</span>
                        )}
                      </div>
                      <button className="btn-gold text-xs py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hike Detail Modal */}
      {selectedHike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedHike(null)}>
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-64">
              <img src={selectedHike.image} alt={selectedHike.title} className="w-full h-full object-cover rounded-t-3xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.01_240)] to-transparent rounded-t-3xl" />
              <button onClick={() => setSelectedHike(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="badge-pill badge-gold">{selectedHike.category}</span>
              </div>
            </div>
            <div className="p-8">
              <h2 className="font-display text-3xl font-bold text-white mb-2">{selectedHike.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-[oklch(0.65_0.02_240)]">{selectedHike.location}</span>
              </div>
              <p className="text-[oklch(0.65_0.02_240)] leading-relaxed mb-6">{selectedHike.shortDescription}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Duration", value: selectedHike.duration },
                  { label: "Difficulty", value: selectedHike.difficulty },
                  { label: "Spots Left", value: `${spotsLeft(selectedHike)}/${selectedHike.maxParticipants}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--muted)] rounded-xl p-3 text-center">
                    <div className="text-xs text-[oklch(0.55_0.02_240)] uppercase tracking-wider">{label}</div>
                    <div className="font-semibold text-white mt-1 capitalize">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-bold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-3">What's Included</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHike.includes.map((inc) => (
                    <span key={inc} className="flex items-center gap-1.5 text-xs text-[oklch(0.72_0.02_240)] bg-[var(--muted)] px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-[var(--gold)]" /> {inc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-3">What to Bring</h4>
                <ul className="space-y-1.5">
                  {selectedHike.requirements.map((req) => (
                    <li key={req} className="text-sm text-[oklch(0.65_0.02_240)] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" /> {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <div>
                  <div className="text-3xl font-hero text-[var(--gold)]">{formatPrice(getPrice(selectedHike))}</div>
                  {user?.membershipType !== "free" && (
                    <div className="text-xs text-[oklch(0.55_0.02_240)]">
                      Member price · <span className="line-through">{formatPrice(selectedHike.price)}</span> regular
                    </div>
                  )}
                </div>
                {bookingOpen ? (
                  isAuthenticated ? (
                    <button className="btn-gold">
                      <Calendar className="w-4 h-4" /> Book Now
                    </button>
                  ) : (
                    <a href={getLoginUrl()} className="btn-gold">Sign In to Book</a>
                  )
                ) : (
                  <div className="text-right">
                    <button className="btn-outline-gold opacity-50 cursor-not-allowed" disabled>
                      <Clock className="w-4 h-4" /> Booking Closed
                    </button>
                    <p className="text-xs text-[oklch(0.45_0.02_240)] mt-1">Opens Wed 11:00 PM</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
