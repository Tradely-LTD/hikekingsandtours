import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Mountain, MapPin, Clock, Users, Search, CheckCircle, X, Calendar,
  AlertCircle, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useHikes, useBookingWindow, useCreateBooking } from "./useHikes";

/**
 * UI asset fallback for hikes with no imageUrl. This is a design asset, not
 * placeholder *content* — an empty API result still renders a true empty state.
 */
const FALLBACK_HIKE_IMAGE =
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80";

/**
 * The shape the JSX below consumes. Every rename, null and decimal-string cast
 * from the API is absorbed here so no component has to defend itself.
 *
 * API contract notes:
 *  - `price` / `memberPrice` / `vipPrice` are DECIMAL columns => arrive as strings.
 *  - `eventDate` is a timestamp column => arrives as a real Date via superjson.
 *  - `imageUrl` (not `image`), `location`, `includes`, `requirements` are nullable.
 */
interface UiHike {
  id: number;
  title: string;
  slug: string;
  location: string;
  imageUrl: string;
  shortDescription: string;
  category: string;
  difficulty: string;
  duration: string;
  price: number;
  memberPrice: number | null;
  vipPrice: number | null;
  maxParticipants: number;
  currentParticipants: number;
  spotsLeft: number;
  includes: string[];
  requirements: string[];
  eventDate: Date | null;
  featured: boolean;
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const asOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normaliseHikes = (rows: unknown[]): UiHike[] =>
  rows.map((raw) => {
    const row = raw as Record<string, unknown>;
    const maxParticipants = Number(row.maxParticipants ?? 0) || 0;
    const currentParticipants = Number(row.currentParticipants ?? 0) || 0;
    return {
      id: Number(row.id),
      title: String(row.title ?? "Untitled hike"),
      slug: String(row.slug ?? ""),
      location: String(row.location ?? ""),
      imageUrl: String(row.imageUrl || FALLBACK_HIKE_IMAGE),
      shortDescription: String(row.shortDescription ?? ""),
      category: String(row.category ?? "standard"),
      difficulty: String(row.difficulty ?? "moderate"),
      duration: String(row.duration ?? "—"),
      price: Number(row.price) || 0,
      memberPrice: asOptionalNumber(row.memberPrice),
      vipPrice: asOptionalNumber(row.vipPrice),
      maxParticipants,
      currentParticipants,
      spotsLeft: Math.max(0, maxParticipants - currentParticipants),
      includes: asStringArray(row.includes),
      requirements: asStringArray(row.requirements),
      eventDate: row.eventDate instanceof Date ? row.eventDate : null,
      featured: Boolean(row.featured),
    };
  });

const formatPrice = (p: number) => `₦${p.toLocaleString("en-NG")}`;

/** tRPC surfaces the server's TRPCError code at `error.data.code`. */
const errorCode = (error: unknown): string | undefined =>
  (error as { data?: { code?: string } } | null)?.data?.code;

export default function Hikes() {
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedHike, setSelectedHike] = useState<UiHike | null>(null);
  const [guestCount, setGuestCount] = useState(1);

  const { data, isLoading, isError } = useHikes();
  const { data: bookingWindow } = useBookingWindow();

  const utils = trpc.useUtils();
  const createBooking = useCreateBooking();

  const hikes = useMemo(() => normaliseHikes((data ?? []) as unknown[]), [data]);

  // Categories come from the live rows so a filter button can never point at an
  // empty set. Filtering stays entirely client-side — hikes.list takes no input.
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(hikes.map((h) => h.category)))],
    [hikes]
  );

  const activeCategory = categories.includes(category) ? category : "all";

  const filtered = hikes.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch =
      h.title.toLowerCase().includes(q) || h.location.toLowerCase().includes(q);
    const matchCat = activeCategory === "all" || h.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Signed-out visitors are tier "free" and must never see a member price.
  const tier = user?.membershipType ?? "free";
  const effectivePrice = (h: UiHike) =>
    tier === "vip"
      ? h.vipPrice ?? h.memberPrice ?? h.price
      : tier === "regular"
        ? h.memberPrice ?? h.price
        : h.price;
  const showStrikethrough = (h: UiHike) => Boolean(user) && effectivePrice(h) < h.price;

  // The server owns the WAT clock. Default closed while the query is in flight.
  const bookingOpen = bookingWindow?.isOpen ?? false;
  const bookingMessage =
    bookingWindow?.message ?? "Checking the booking window…";

  const openHike = (hike: UiHike) => {
    setGuestCount(1);
    setSelectedHike(hike);
  };

  const handleBook = (hike: UiHike) => {
    createBooking.mutate(
      { eventId: hike.id, guestCount },
      {
        onSuccess: (result: { ticketCode: string; amount: string }) => {
          toast.success(`Booked! Your ticket code is ${result.ticketCode}`, {
            description: `${formatPrice(Number(result.amount) || 0)} · ${hike.title}`,
          });
          setSelectedHike(null);
        },
        onError: (error: unknown) => {
          const code = errorCode(error);
          const message = (error as { message?: string } | null)?.message;

          // The event filled up between the page loading and this click. That
          // is ordinary, not a system error - say so plainly and refresh the
          // list so the spots-left count stops lying.
          if (code === "CONFLICT") {
            toast.warning("This hike is now fully booked.", {
              description: "Someone took the last spot. We've refreshed the list for you.",
            });
            setSelectedHike(null);
            utils.hikes.list.invalidate();
            utils.hikes.featured.invalidate();
            return;
          }

          // The event was withdrawn or unpublished while the page was open.
          if (code === "NOT_FOUND" || code === "BAD_REQUEST") {
            toast.error(message ?? "This hike is no longer available to book.");
            setSelectedHike(null);
            utils.hikes.list.invalidate();
            utils.hikes.featured.invalidate();
            return;
          }

          // FORBIDDEN is the Wed-Fri 11PM window; the server message is the
          // clearest statement of it, so pass it straight through.
          toast.error(message ?? "Could not complete your booking. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-12 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="section-label mb-4">Adventure Awaits</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Upcoming Hikes & Trips</h1>
          <p className="text-[oklch(0.62_0.02_240)] max-w-xl">Browse all upcoming adventures. Booking opens every Wednesday at 11:00 PM and closes Friday at 11:00 PM.</p>

          {/* Booking Window Alert — server-authoritative */}
          <div className={`mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${bookingOpen ? "bg-[oklch(0.32_0.1_160/0.15)] border-[oklch(0.32_0.1_160/0.4)] text-[oklch(0.72_0.18_160)]" : "bg-[oklch(0.72_0.18_75/0.08)] border-[oklch(0.72_0.18_75/0.3)] text-[var(--gold)]"}`}>
            {bookingOpen ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            <span className="text-sm font-semibold">
              {bookingOpen ? "Booking is OPEN now! Secure your spot." : bookingMessage}
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
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${activeCategory === cat ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "bg-[var(--muted)] text-[oklch(0.62_0.02_240)] hover:text-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hike Grid */}
      <div className="container py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl bg-white/5 animate-pulse" style={{ height: "360px" }} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <AlertCircle className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Hikes are temporarily unavailable</h2>
            <p className="text-[oklch(0.55_0.02_240)]">Please try again shortly or contact Hike Kings & Tours for assistance.</p>
          </div>
        ) : hikes.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Mountain className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No hikes scheduled yet</h2>
            <p className="text-[oklch(0.55_0.02_240)]">The next season is being planned. Check back soon for new dates.</p>
          </div>
        ) : filtered.length === 0 ? (
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
                onClick={() => openHike(hike)}
              >
                <img src={hike.imageUrl} alt={hike.title} className="hike-card-img absolute inset-0" />
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
                    {hike.location && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
                        <span className="text-xs text-[oklch(0.75_0.01_240)]">{hike.location}</span>
                      </div>
                    )}
                    <h3 className="font-display text-lg font-bold text-white mb-1">{hike.title}</h3>
                    <div className="flex items-center gap-3 mb-3 text-xs text-[oklch(0.65_0.02_240)]">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{hike.duration}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{hike.spotsLeft} spots left</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-hero text-[var(--gold)]">{formatPrice(effectivePrice(hike))}</span>
                        {showStrikethrough(hike) && (
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
              <img src={selectedHike.imageUrl} alt={selectedHike.title} className="w-full h-full object-cover rounded-t-3xl" />
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
              {selectedHike.location && (
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[var(--gold)]" />
                  <span className="text-[oklch(0.65_0.02_240)]">{selectedHike.location}</span>
                </div>
              )}
              {selectedHike.shortDescription && (
                <p className="text-[oklch(0.65_0.02_240)] leading-relaxed mb-6">{selectedHike.shortDescription}</p>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Duration", value: selectedHike.duration },
                  { label: "Difficulty", value: selectedHike.difficulty },
                  { label: "Spots Left", value: `${selectedHike.spotsLeft}/${selectedHike.maxParticipants}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--muted)] rounded-xl p-3 text-center">
                    <div className="text-xs text-[oklch(0.55_0.02_240)] uppercase tracking-wider">{label}</div>
                    <div className="font-semibold text-white mt-1 capitalize">{value}</div>
                  </div>
                ))}
              </div>

              {selectedHike.eventDate && (
                <div className="flex items-center gap-2 mb-6 text-sm text-[oklch(0.65_0.02_240)]">
                  <Calendar className="w-4 h-4 text-[var(--gold)]" />
                  {selectedHike.eventDate.toLocaleDateString("en-NG", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })}
                </div>
              )}

              {selectedHike.includes.length > 0 && (
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
              )}

              {selectedHike.requirements.length > 0 && (
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
              )}

              {bookingOpen && isAuthenticated && (
                <div className="flex items-center gap-3 mb-6">
                  <label htmlFor="guestCount" className="text-xs font-bold tracking-wider uppercase text-[oklch(0.55_0.02_240)]">
                    Guests
                  </label>
                  <select
                    id="guestCount"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n} className="bg-[var(--card)]">{n}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <div>
                  <div className="text-3xl font-hero text-[var(--gold)]">{formatPrice(effectivePrice(selectedHike))}</div>
                  {showStrikethrough(selectedHike) && (
                    <div className="text-xs text-[oklch(0.55_0.02_240)]">
                      Member price · <span className="line-through">{formatPrice(selectedHike.price)}</span> regular
                    </div>
                  )}
                </div>
                {bookingOpen ? (
                  isAuthenticated ? (
                    <button
                      className="btn-gold"
                      disabled={createBooking.isPending}
                      onClick={() => handleBook(selectedHike)}
                    >
                      {createBooking.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</>
                      ) : (
                        <><Calendar className="w-4 h-4" /> Book Now</>
                      )}
                    </button>
                  ) : (
                    <a href={getLoginUrl()} className="btn-gold">Sign In to Book</a>
                  )
                ) : (
                  <div className="text-right">
                    <button className="btn-outline-gold opacity-50 cursor-not-allowed" disabled>
                      <Clock className="w-4 h-4" /> Booking Closed
                    </button>
                    <p className="text-xs text-[oklch(0.45_0.02_240)] mt-1">{bookingMessage}</p>
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
