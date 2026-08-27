import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { MapPin, Calendar, Users, Star, Clock, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400 bg-green-500/10",
  moderate: "text-amber-400 bg-amber-500/10",
  challenging: "text-orange-400 bg-orange-500/10",
  extreme: "text-red-400 bg-red-500/10",
};

type PlaceholderTrip = {
  id: number; title: string; slug: string; cityName: string;
  duration: number; difficulty: string; price: number;
  maxParticipants: number; imageUrl: string; shortDescription: string;
  highlights: string[]; category: string;
};

const PLACEHOLDER_TRIPS: PlaceholderTrip[] = [
  {
    id: 1, title: "Yankari Wildlife Safari & Lodge", slug: "yankari-wildlife-safari",
    cityName: "Bauchi", duration: 3, difficulty: "easy", price: 85000,
    maxParticipants: 20, imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    shortDescription: "3-day all-inclusive safari at Yankari Game Reserve with warm spring dip and lodge stay.",
    highlights: ["Game drives", "Wikki Warm Spring", "Lodge accommodation", "All meals"],
    category: "wildlife",
  },
  {
    id: 2, title: "Zuma Rock Adventure Weekend", slug: "zuma-rock-adventure",
    cityName: "Abuja", duration: 2, difficulty: "moderate", price: 65000,
    maxParticipants: 15, imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    shortDescription: "2-day adventure at Zuma Rock Resort — horse riding, cycling, and rock photography.",
    highlights: ["Horse riding", "Cycling trails", "Rock photography", "Resort stay"],
    category: "adventure",
  },
  {
    id: 3, title: "Calabar Cultural Carnival Tour", slug: "calabar-cultural-carnival",
    cityName: "Calabar", duration: 4, difficulty: "easy", price: 120000,
    maxParticipants: 25, imageUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
    shortDescription: "4-day cultural immersion in Calabar — museum, Tinapa, and the famous carnival experience.",
    highlights: ["Calabar Museum", "Tinapa Resort", "Carnival parade", "Seafood dining"],
    category: "cultural",
  },
  {
    id: 4, title: "Jabi Lake & Abuja City Explorer", slug: "jabi-lake-abuja",
    cityName: "Abuja", duration: 2, difficulty: "easy", price: 45000,
    maxParticipants: 30, imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    shortDescription: "Weekend of kayaking, boat rides, and city sightseeing in the capital.",
    highlights: ["Kayaking", "Boat rides", "Millennium Park", "Aso Rock view"],
    category: "water",
  },
  {
    id: 5, title: "Jos Plateau Sunrise Hike", slug: "jos-plateau-sunrise",
    cityName: "Jos", duration: 2, difficulty: "moderate", price: 55000,
    maxParticipants: 20, imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    shortDescription: "Sunrise hike on the Jos Plateau with panoramic views and a cool highland retreat.",
    highlights: ["Sunrise summit", "Plateau views", "Highland lodge", "Local cuisine"],
    category: "hiking",
  },
  {
    id: 6, title: "Kano Ancient City Heritage Tour", slug: "kano-heritage-tour",
    cityName: "Kano", duration: 3, difficulty: "easy", price: 75000,
    maxParticipants: 20, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    shortDescription: "3-day deep dive into Kano's ancient walls, dye pits, and Emir's palace.",
    highlights: ["Kofar Mata Dye Pits", "Emir's Palace", "Kurmi Market", "Gidan Makama Museum"],
    category: "cultural",
  },
];

const CATEGORIES = ["all", "wildlife", "adventure", "cultural", "water", "hiking"];

export default function TripsPage() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  // Try to load from DB, fall back to placeholders
  const { data: dbTrips } = trpc.trips.list.useQuery({});
  // Normalise DB trips to the same shape as placeholder trips
  const normalisedDbTrips: PlaceholderTrip[] = (dbTrips ?? []).map(t => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    cityName: String(t.cityId ?? ""),
    duration: t.durationNights ?? 1,
    difficulty: "moderate",
    price: Number(t.soloPrice),
    maxParticipants: t.maxParticipants ?? 30,
    imageUrl: t.imageUrl ?? "",
    shortDescription: t.shortDescription ?? t.description ?? "",
    highlights: (t.includes ?? []).slice(0, 4),
    category: "adventure",
  }));
  const trips: PlaceholderTrip[] = normalisedDbTrips.length > 0 ? normalisedDbTrips : PLACEHOLDER_TRIPS;

  const filtered = trips.filter(t => {
    const catMatch = activeCategory === "all" || (t as typeof PLACEHOLDER_TRIPS[0]).category === activeCategory;
    const diffMatch = difficulty === "all" || t.difficulty === difficulty;
    return catMatch && diffMatch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600" alt="Trips" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]" />
        </div>
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Curated Adventures</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Multi-Day Trip<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Packages</span>
          </h1>
          <p className="text-white/60 text-lg">
            Fully curated multi-day adventures across Nigeria's most spectacular destinations. Accommodation, activities, and guides — all included.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 py-4">
        <div className="container flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-sm">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${activeCategory === cat ? "bg-amber-500 text-black" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}>
                {cat === "all" ? "All Trips" : cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {["all", "easy", "moderate", "challenging", "extreme"].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${difficulty === d ? "bg-white/20 text-white" : "text-white/40 hover:text-white"}`}>
                {d === "all" ? "Any Level" : d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-16">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-white/40">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No trips match your filters. Try adjusting the category or difficulty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(trip => (
                <div key={trip.id}
                  onClick={() => navigate(`/trips/${trip.slug}`)}
                  className="group bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 cursor-pointer hover:-translate-y-1">
                  <div className="relative h-56 overflow-hidden">
                    <img src={trip.imageUrl ?? ""} alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${DIFFICULTY_COLORS[trip.difficulty ?? "easy"]}`}>
                        {trip.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{trip.cityName ?? "Nigeria"}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{trip.title}</h3>
                    <p className="text-white/50 text-sm mb-4 line-clamp-2">{trip.shortDescription}</p>

                    <div className="flex items-center gap-4 text-white/40 text-sm mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {trip.duration} days</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Max {trip.maxParticipants}</span>
                    </div>

                    {(trip as typeof PLACEHOLDER_TRIPS[0]).highlights && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {(trip as typeof PLACEHOLDER_TRIPS[0]).highlights.slice(0, 3).map(h => (
                          <span key={h} className="text-xs bg-white/5 text-white/50 px-2.5 py-1 rounded-full">{h}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-amber-400 font-black text-xl">₦{Number(trip.price).toLocaleString()}</span>
                        <span className="text-white/40 text-sm"> / person</span>
                      </div>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                        View Trip <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-4">Want a Custom Trip?</h2>
          <p className="text-white/60 mb-8">Planning a corporate retreat, family adventure, or group expedition? We'll design a bespoke itinerary just for you.</p>
          <Button onClick={() => navigate("/corporate")} className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 text-lg">
            Request Custom Package
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
