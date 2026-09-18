import { useMemo, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import {
  Camera, Mountain, Tent, Users, Star, Clock, MapPin,
  ChevronRight, Leaf, Sunrise, Droplets, Globe, AlertCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * `iconKey` is a string in the database because a React component cannot be
 * stored in Postgres. Unknown keys fall back rather than crashing the page.
 */
const ICONS: Record<string, LucideIcon> = {
  leaf: Leaf,
  users: Users,
  droplets: Droplets,
  sunrise: Sunrise,
  star: Star,
  globe: Globe,
  camera: Camera,
  tent: Tent,
  mountain: Mountain,
};

/**
 * Tailwind's JIT compiler only generates classes it can SEE in the source at
 * build time. A gradient class string read from the database at runtime would
 * produce unstyled output. So the DB stores a short `themeKey` and the literal
 * class strings live here, in source, where Tailwind can find them.
 */
const GRADIENTS: Record<string, string> = {
  emerald: "from-emerald-900/60 to-emerald-700/20",
  blue: "from-blue-900/60 to-blue-700/20",
  cyan: "from-cyan-900/60 to-cyan-700/20",
  amber: "from-orange-900/60 to-amber-700/20",
  violet: "from-indigo-900/60 to-purple-700/20",
  yellow: "from-yellow-900/60 to-yellow-700/20",
  rose: "from-rose-900/60 to-pink-700/20",
  teal: "from-teal-900/60 to-teal-700/20",
  gold: "from-[oklch(0.32_0.1_55)]/60 to-[oklch(0.22_0.08_55)]/20",
};

const FALLBACK_EXPERIENCE_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80";

interface UiExperience {
  id: number;
  slug: string;
  icon: LucideIcon;
  gradient: string;
  accent: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  duration: string;
  difficulty: string;
  price: string;
  image: string;
  ctaHref: string;
}

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

const normaliseExperiences = (rows: unknown[]): UiExperience[] =>
  rows.map((raw) => {
    const row = raw as Record<string, unknown>;
    // accentHex is injected into an inline style; only accept real hex values.
    const accentRaw = String(row.accentHex ?? "");
    const fromPrice = row.fromPrice == null ? null : Number(row.fromPrice);
    return {
      id: Number(row.id),
      slug: String(row.slug ?? ""),
      icon: ICONS[String(row.iconKey ?? "")] ?? Mountain,
      gradient: GRADIENTS[String(row.themeKey ?? "")] ?? GRADIENTS.gold,
      accent: HEX_RE.test(accentRaw) ? accentRaw : "#c9a227",
      tag: String(row.tag ?? ""),
      title: String(row.title ?? "Experience"),
      subtitle: String(row.subtitle ?? ""),
      description: String(row.description ?? ""),
      highlights: Array.isArray(row.highlights)
        ? row.highlights.filter((h): h is string => typeof h === "string")
        : [],
      duration: String(row.durationLabel ?? ""),
      difficulty: String(row.difficultyLabel ?? ""),
      // fromPrice is a DECIMAL column, so it arrives as the string "15000.00".
      price: fromPrice != null && Number.isFinite(fromPrice)
        ? `₦${fromPrice.toLocaleString("en-NG")}`
        : "",
      image: String(row.imageUrl || FALLBACK_EXPERIENCE_IMAGE),
      ctaHref: typeof row.ctaHref === "string" && row.ctaHref.startsWith("/") ? row.ctaHref : "/hikes",
    };
  });

export default function ExperiencesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const { data, isLoading, isError } = trpc.experiences.list.useQuery();

  const experiences = useMemo(
    () => normaliseExperiences((data ?? []) as unknown[]),
    [data]
  );

  const filters = useMemo(
    () => ["All", ...Array.from(new Set(experiences.map((e) => e.tag).filter(Boolean)))],
    [experiences]
  );

  // If the active tag disappears after a refetch, fall back to "All" rather
  // than rendering a grid that is empty for no visible reason.
  const effectiveFilter = filters.includes(activeFilter) ? activeFilter : "All";

  const filtered = effectiveFilter === "All"
    ? experiences
    : experiences.filter((e) => e.tag === effectiveFilter);

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
            {experiences.length > 0
              ? `${experiences.length} Signature Experience${experiences.length === 1 ? "" : "s"}`
              : "Signature Experiences"}
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
      {filters.length > 1 && (
        <section className="sticky top-16 z-20 bg-[oklch(0.10_0.015_240)]/95 backdrop-blur-xl border-b border-white/5 py-4">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    effectiveFilter === f
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
      )}

      {/* ── Experience Cards ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl bg-white/5 animate-pulse" style={{ height: "520px" }} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-24 glass-card rounded-3xl">
              <AlertCircle className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Experiences are temporarily unavailable</h2>
              <p className="text-[oklch(0.55_0.02_240)]">Please try again shortly, or browse our upcoming hikes.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-3xl">
              <Mountain className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No experiences published yet</h2>
              <p className="text-[oklch(0.55_0.02_240)]">Our team is curating the next line-up. Please check back soon.</p>
            </div>
          ) : (
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
                    <div className={`absolute inset-0 bg-gradient-to-t ${exp.gradient} via-black/60 to-black/80`} />

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
                      {exp.subtitle && (
                        <p className="text-sm font-semibold mb-4" style={{ color: exp.accent }}>{exp.subtitle}</p>
                      )}
                      {exp.description && (
                        <p className="text-sm text-[oklch(0.65_0.02_240)] leading-relaxed mb-6">{exp.description}</p>
                      )}

                      {/* Highlights */}
                      {exp.highlights.length > 0 && (
                        <ul className="space-y-1.5 mb-6">
                          {exp.highlights.map((h) => (
                            <li key={h} className="flex items-center gap-2 text-xs text-[oklch(0.72_0.02_240)]">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: exp.accent }} />
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Meta + CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex gap-4 text-xs text-[oklch(0.55_0.02_240)]">
                          {exp.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exp.duration}</span>}
                          {exp.difficulty && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{exp.difficulty}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          {exp.price && (
                            <span className="font-hero text-xl" style={{ color: exp.accent }}>{exp.price}</span>
                          )}
                          <Link
                            href={exp.ctaHref}
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
          )}
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
