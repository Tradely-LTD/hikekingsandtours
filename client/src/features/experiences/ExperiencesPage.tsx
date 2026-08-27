import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Camera, Mountain, Tent, Users, Star, Clock, MapPin,
  ChevronRight, Leaf, Sunrise, Droplets, Globe
} from "lucide-react";

const EXPERIENCES = [
  {
    id: "green-heroes",
    icon: Leaf,
    tag: "Eco Adventure",
    title: "Green Heroes",
    subtitle: "Conservation Hiking",
    description:
      "Join our eco-warriors on conservation hikes where you plant trees, clean trails, and protect Nigeria's natural heritage. Every step you take leaves the environment better than you found it.",
    highlights: ["Tree planting ceremonies", "Trail clean-up missions", "Wildlife spotting", "Eco-education sessions"],
    duration: "6–8 hours",
    difficulty: "Easy to Moderate",
    price: "₦15,000",
    color: "from-emerald-900/60 to-emerald-700/20",
    accent: "#22c55e",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  },
  {
    id: "unity-hike",
    icon: Users,
    tag: "Community",
    title: "Unity Hike",
    subtitle: "Team & Community Building",
    description:
      "Nigeria's most diverse hiking experience — bringing together people from all walks of life, tribes, and backgrounds to conquer trails and build lifelong friendships.",
    highlights: ["Cultural exchange activities", "Group challenges", "Shared meals on the trail", "Community bonding games"],
    duration: "5–7 hours",
    difficulty: "Moderate",
    price: "₦18,000",
    color: "from-blue-900/60 to-blue-700/20",
    accent: "#3b82f6",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
  },
  {
    id: "waterfall-adventure",
    icon: Droplets,
    tag: "Water & Wilderness",
    title: "Waterfall Adventure",
    subtitle: "Cascade Chasing",
    description:
      "Trek through lush forests to discover Nigeria's most spectacular hidden waterfalls. Swim in natural pools, feel the mist on your face, and experience nature's most breathtaking spectacles.",
    highlights: ["Hidden waterfall discovery", "Natural pool swimming", "Rope bridge crossings", "Waterfall photography"],
    duration: "7–9 hours",
    difficulty: "Moderate to Hard",
    price: "₦22,000",
    color: "from-cyan-900/60 to-cyan-700/20",
    accent: "#06b6d4",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    id: "sunrise-glow",
    icon: Sunrise,
    tag: "Dawn Experience",
    title: "Sunrise Glow",
    subtitle: "Early Morning Magic",
    description:
      "Wake before dawn and hike to summit viewpoints to witness Nigeria's most spectacular sunrises. The golden hour from a mountain peak is an experience that changes your perspective forever.",
    highlights: ["Pre-dawn departure", "Summit sunrise viewing", "Hot breakfast at the peak", "Golden hour photography"],
    duration: "4–6 hours",
    difficulty: "Moderate",
    price: "₦20,000",
    color: "from-orange-900/60 to-amber-700/20",
    accent: "#f59e0b",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  },
  {
    id: "night-glow",
    icon: Star,
    tag: "Nocturnal",
    title: "Night Glow",
    subtitle: "Starlight Trekking",
    description:
      "Experience the magic of hiking under a canopy of stars. Our certified night guides lead you through safe trails illuminated by headlamps and moonlight, culminating in a stargazing session.",
    highlights: ["Headlamp night trekking", "Stargazing with telescopes", "Night wildlife sounds", "Campfire storytelling"],
    duration: "4–5 hours",
    difficulty: "Easy to Moderate",
    price: "₦25,000",
    color: "from-indigo-900/60 to-purple-700/20",
    accent: "#8b5cf6",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
  },
  {
    id: "cultural-experiences",
    icon: Globe,
    tag: "Heritage",
    title: "Cultural Experiences",
    subtitle: "Heritage Trail",
    description:
      "Explore Nigeria's rich cultural tapestry through guided heritage hikes that visit ancient sites, traditional villages, and sacred landmarks. Learn the stories that shaped our land.",
    highlights: ["Ancient site visits", "Traditional village tours", "Cultural performances", "Local cuisine tasting"],
    duration: "6–8 hours",
    difficulty: "Easy",
    price: "₦16,000",
    color: "from-yellow-900/60 to-yellow-700/20",
    accent: "#eab308",
    image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80",
  },
  {
    id: "photography-tours",
    icon: Camera,
    tag: "Creative",
    title: "Photography Tours",
    subtitle: "Lens & Landscape",
    description:
      "Designed for photographers and content creators, these guided hikes take you to the most photogenic locations in Nigeria — from dramatic cliffs to misty valleys and vibrant wildlife.",
    highlights: ["Golden hour locations", "Composition workshops", "Model & landscape shoots", "Drone photography zones"],
    duration: "5–7 hours",
    difficulty: "Easy to Moderate",
    price: "₦20,000",
    color: "from-rose-900/60 to-pink-700/20",
    accent: "#f43f5e",
    image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=800&q=80",
  },
  {
    id: "camping-adventures",
    icon: Tent,
    tag: "Overnight",
    title: "Camping Adventures",
    subtitle: "Sleep Under the Stars",
    description:
      "Multi-day camping expeditions deep into Nigeria's wilderness. Set up camp, cook over open fire, and wake up to birdsong in locations most people will never experience.",
    highlights: ["2-day/1-night format", "Campfire cooking", "Wilderness survival skills", "Morning summit hike"],
    duration: "2 Days / 1 Night",
    difficulty: "Moderate to Hard",
    price: "₦45,000",
    color: "from-teal-900/60 to-teal-700/20",
    accent: "#14b8a6",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
  },
];

const FILTERS = ["All", "Eco Adventure", "Community", "Water & Wilderness", "Dawn Experience", "Nocturnal", "Heritage", "Creative", "Overnight"];

export default function ExperiencesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = activeFilter === "All"
    ? EXPERIENCES
    : EXPERIENCES.filter((e) => e.tag === activeFilter);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.12_0.02_240)] to-[var(--background)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[var(--background)]" />
        <div className="relative container max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-xs font-semibold tracking-widest uppercase mb-6">
            <Mountain className="w-3.5 h-3.5" />
            8 Signature Experiences
          </div>
          <h1 className="font-hero text-5xl md:text-7xl text-white mb-6 leading-tight">
            Choose Your <span className="text-[var(--gold)] italic">Adventure</span>
          </h1>
          <p className="text-lg text-[oklch(0.65_0.02_240)] max-w-2xl mx-auto leading-relaxed">
            From eco-conservation hikes to nocturnal stargazing treks — every Hike Kings experience is crafted to create memories that last a lifetime.
          </p>
        </div>
      </section>

      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      <section className="sticky top-16 z-20 bg-[oklch(0.10_0.015_240)]/95 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeFilter === f
                    ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]"
                    : "bg-[var(--muted)] text-[oklch(0.62_0.02_240)] hover:text-white hover:bg-[var(--stone)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience Cards ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {filtered.map((exp) => {
              const Icon = exp.icon;
              const isHovered = hoveredId === exp.id;
              return (
                <div
                  key={exp.id}
                  className="group relative rounded-3xl overflow-hidden border border-white/8 cursor-pointer transition-all duration-500 hover:border-[var(--gold)]/30 hover:shadow-2xl hover:shadow-[var(--gold)]/10"
                  onMouseEnter={() => setHoveredId(exp.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${exp.image}')` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${exp.color} via-black/60 to-black/80`} />

                  <div className="relative p-8">
                    {/* Tag + Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${exp.accent}20`, color: exp.accent, border: `1px solid ${exp.accent}30` }}
                      >
                        <Icon className="w-3 h-3" />
                        {exp.tag}
                      </span>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${exp.accent}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: exp.accent }} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-hero text-3xl text-white mb-1">{exp.title}</h3>
                    <p className="text-sm font-semibold mb-4" style={{ color: exp.accent }}>{exp.subtitle}</p>
                    <p className="text-sm text-[oklch(0.65_0.02_240)] leading-relaxed mb-6">{exp.description}</p>

                    {/* Highlights */}
                    <ul className="space-y-1.5 mb-6">
                      {exp.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-[oklch(0.72_0.02_240)]">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: exp.accent }} />
                          {h}
                        </li>
                      ))}
                    </ul>

                    {/* Meta + CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex gap-4 text-xs text-[oklch(0.55_0.02_240)]">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exp.duration}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{exp.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-hero text-xl" style={{ color: exp.accent }}>{exp.price}</span>
                        <Link
                          href="/hikes"
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            backgroundColor: isHovered ? exp.accent : `${exp.accent}20`,
                            color: isHovered ? "oklch(0.08 0.01 240)" : exp.accent,
                          }}
                        >
                          Book Now <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-[oklch(0.12_0.02_240)] to-[oklch(0.10_0.015_240)]">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-hero text-4xl md:text-5xl text-white mb-4">
            Not Sure Which to Choose?
          </h2>
          <p className="text-[oklch(0.65_0.02_240)] mb-8 max-w-xl mx-auto">
            Browse our full hike catalog with dates, availability, and real-time booking — or contact us for a personalised recommendation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hikes" className="btn-gold px-8 py-4 text-base">
              Browse All Hikes
            </Link>
            <Link href="/corporate" className="btn-outline-gold px-8 py-4 text-base">
              Corporate Packages
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
