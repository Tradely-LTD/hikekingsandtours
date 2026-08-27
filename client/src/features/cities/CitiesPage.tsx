import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { MapPin, Users, Star, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ACTIVITY_ICONS: Record<string, string> = {
  horse_riding: "🐴",
  kayaking: "🚣",
  boat_ride: "⛵",
  cycling: "🚴",
  swimming: "🏊",
  zip_line: "🪂",
  safari: "🦁",
  camping: "⛺",
  photography: "📸",
  cultural_tour: "🏛️",
  hiking: "🥾",
  other: "✨",
};

export default function CitiesPage() {
  const [search, setSearch] = useState("");
  const { data: cities, isLoading } = trpc.cities.list.useQuery();

  const filtered = (cities ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.state ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const featured = filtered.filter(c => c.featured);
  const others = filtered.filter(c => !c.featured);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-transparent" />
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Explore Nigeria</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-none">
            Discover Your Next<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Adventure City
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            From Yankari's wildlife to Jabi Lake's waterfront — explore Nigeria's top 15 adventure destinations, book activities, and find accommodation in one place.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search cities or states..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-4 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Featured Cities */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="container">
            <h2 className="text-2xl font-bold text-white mb-2">Featured Destinations</h2>
            <p className="text-white/50 mb-8">Top picks for your next adventure</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse" />
                  ))
                : featured.map(city => (
                    <Link key={city.id} href={`/cities/${city.slug}`}>
                      <div className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-amber-500/30 transition-all duration-300">
                        <img
                          src={city.heroImageUrl ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
                          alt={city.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-400 text-xs font-medium">{city.state}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                          <p className="text-white/60 text-sm line-clamp-2">{city.description}</p>
                          <div className="flex items-center gap-2 mt-3 text-amber-400 text-sm font-medium group-hover:gap-3 transition-all">
                            Explore <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                        {city.featured && (
                          <div className="absolute top-4 right-4 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" /> Featured
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* All Other Cities */}
      {others.length > 0 && (
        <section className="py-8 pb-24">
          <div className="container">
            <h2 className="text-2xl font-bold text-white mb-2">More Destinations</h2>
            <p className="text-white/50 mb-8">Explore all Nigerian adventure cities</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {others.map(city => (
                <Link key={city.id} href={`/cities/${city.slug}`}>
                  <div className="group relative h-48 rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-amber-500/30 transition-all duration-300">
                    <img
                      src={city.heroImageUrl ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"}
                      alt={city.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-amber-400 text-xs mb-0.5">{city.state}</div>
                      <h3 className="text-lg font-bold text-white">{city.name}</h3>
                      <div className="flex items-center gap-1 mt-1 text-amber-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {filtered.length === 0 && !isLoading && (
        <div className="container py-24 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-white mb-2">No cities found</h3>
          <p className="text-white/50">Try a different search term</p>
        </div>
      )}

      <Footer />
    </div>
  );
}
