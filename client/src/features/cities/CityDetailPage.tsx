import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { MapPin, Star, Clock, Users, ArrowRight, ChevronLeft, Bed, Activity, Building2, Calendar } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ACTIVITY_ICONS: Record<string, string> = {
  horse_riding: "🐴", kayaking: "🚣", boat_ride: "⛵", cycling: "🚴",
  swimming: "🏊", zip_line: "🪂", safari: "🦁", camping: "⛺",
  photography: "📸", cultural_tour: "🏛️", hiking: "🥾", other: "✨",
};

const PRICE_UNIT_LABELS: Record<string, string> = {
  per_person: "per person", per_hour: "per hour", per_day: "per day", per_group: "per group",
};

type Tab = "overview" | "places" | "activities" | "accommodation" | "partners";

const PLACE_CATEGORY_ICONS: Record<string, string> = {
  nature: "🌿", wildlife: "🦁", mountain: "⛰️", lake: "🏞️", beach: "🏖️",
  historical: "🏛️", cultural: "🎭", resort: "🏨", adventure: "🧗", other: "📍",
};

export default function CityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [bookingActivity, setBookingActivity] = useState<number | null>(null);
  const [bookingRoom, setBookingRoom] = useState<number | null>(null);
  const [activityDate, setActivityDate] = useState("");
  const [activityParticipants, setActivityParticipants] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const { data, isLoading } = trpc.cities.bySlug.useQuery({ slug: slug ?? "" });
  const bookActivityMutation = trpc.partners.bookActivity.useMutation({
    onSuccess: (res) => {
      toast.success(`Activity booked! Ref: ${res.bookingRef}. Total: ₦${Number(res.totalAmount).toLocaleString()}`);
      setBookingActivity(null);
    },
    onError: (err) => toast.error(err.message),
  });
  const bookRoomMutation = trpc.partners.bookAccommodation.useMutation({
    onSuccess: (res) => {
      toast.success(`Room booked! Ref: ${res.bookingRef}. ${res.nights} night(s) — ₦${Number(res.totalAmount).toLocaleString()}`);
      setBookingRoom(null);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="container pt-32 pb-24">
          <div className="h-96 bg-white/5 rounded-3xl animate-pulse mb-8" />
          <div className="grid grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="container pt-32 pb-24 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-white mb-4">City not found</h2>
          <Link href="/cities"><Button variant="outline">Back to Cities</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { city, partners, activities, accommodations, places = [] } = data;
  const selectedActivity = activities.find(a => a.id === bookingActivity);
  const selectedRoom = accommodations.find(r => r.id === bookingRoom);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={city.heroImageUrl ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200"}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <Link href="/cities">
            <button className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" /> All Cities
            </button>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm">{city.state}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4">{city.name}</h1>
          <p className="text-white/70 text-lg max-w-2xl">{city.description}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2 text-white/60">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-sm">{partners.length} Partner{partners.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-sm">{activities.length} Activit{activities.length !== 1 ? "ies" : "y"}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Bed className="w-4 h-4 text-amber-400" />
              <span className="text-sm">{accommodations.length} Accommodation{accommodations.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-sm">{places.length} Top Place{places.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto py-1">
            {(["overview", "places", "activities", "accommodation", "partners"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  tab === t
                    ? "text-amber-400 border-b-2 border-amber-400"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-12">
            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "🏢", label: "Partners", value: partners.length },
                { icon: "🎯", label: "Activities", value: activities.length },
                { icon: "🛏️", label: "Accommodations", value: accommodations.length },
                { icon: "📍", label: "State", value: city.state ?? "—" },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 rounded-2xl p-6 text-center border border-white/5">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Top Places preview */}
            {places.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Top Places to Visit</h2>
                    <p className="text-white/50 text-sm mt-1">Discover {city.name}'s most memorable destinations.</p>
                  </div>
                  <button onClick={() => setTab("places")} className="text-amber-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {places.slice(0, 3).map(place => (
                    <div key={place.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group">
                      {place.imageUrl ? (
                        <img src={place.imageUrl} alt={place.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-40 bg-white/5 flex items-center justify-center text-4xl">{PLACE_CATEGORY_ICONS[place.category] ?? "📍"}</div>
                      )}
                      <div className="p-5">
                        <div className="text-amber-400 text-xs uppercase tracking-wider mb-1">{place.category}</div>
                        <h3 className="font-bold text-white mb-2">{place.name}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/50">{place.openingHours ?? "Open for exploration"}</span>
                          <span className="text-amber-400 font-semibold">{Number(place.entryFee ?? 0) > 0 ? `₦${Number(place.entryFee).toLocaleString()}` : "Free"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured activities preview */}
            {activities.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Top Activities</h2>
                  <button onClick={() => setTab("activities")} className="text-amber-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activities.slice(0, 3).map(activity => (
                    <div key={activity.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group">
                      {activity.imageUrl && (
                        <img src={activity.imageUrl} alt={activity.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{ACTIVITY_ICONS[activity.type ?? "other"] ?? "✨"}</span>
                          <span className="text-white/50 text-xs capitalize">{(activity.type ?? "other").replace(/_/g, " ")}</span>
                        </div>
                        <h3 className="font-bold text-white mb-1">{activity.name}</h3>
                        <p className="text-white/50 text-sm line-clamp-2 mb-3">{activity.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-amber-400 font-bold">₦{Number(activity.price).toLocaleString()} <span className="text-white/40 text-xs font-normal">{PRICE_UNIT_LABELS[activity.priceUnit ?? "per_person"]}</span></span>
                          <Button size="sm" onClick={() => { if (!isAuthenticated) { toast.error("Please sign in to book"); return; } setBookingActivity(activity.id); }} className="bg-amber-500 hover:bg-amber-400 text-black text-xs">
                            Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured accommodations preview */}
            {accommodations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Where to Stay</h2>
                  <button onClick={() => setTab("accommodation")} className="text-amber-400 text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {accommodations.slice(0, 3).map(room => (
                    <div key={room.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group">
                      {room.imageUrl && (
                        <img src={room.imageUrl} alt={room.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-1">
                          <Bed className="w-4 h-4 text-amber-400" />
                          <span className="text-white/50 text-xs capitalize">{(room.type ?? "double").replace(/_/g, " ")} room</span>
                        </div>
                        <h3 className="font-bold text-white mb-1">{room.name}</h3>
                        <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
                          <Users className="w-3 h-3" /> Up to {room.capacity} guests
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-amber-400 font-bold">₦{Number(room.pricePerNight).toLocaleString()} <span className="text-white/40 text-xs font-normal">/night</span></span>
                          <Button size="sm" onClick={() => { if (!isAuthenticated) { toast.error("Please sign in to book"); return; } setBookingRoom(room.id); }} className="bg-amber-500 hover:bg-amber-400 text-black text-xs">
                            Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Places Tab */}
        {tab === "places" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Top Places to Visit in {city.name}</h2>
            <p className="text-white/50 mb-8">Curated destinations, landmarks, and natural wonders in {city.state}.</p>
            {places.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-xl font-bold text-white mb-2">No places listed yet</h3>
                <p className="text-white/50">The admin will add top destinations for this city soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map(place => {
                  let highlights: string[] = [];
                  try { highlights = place.highlights ? JSON.parse(place.highlights) : []; } catch {}
                  return (
                    <div key={place.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-400/30 transition-all group">
                      {place.imageUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          {place.featured && (
                            <div className="absolute top-3 left-3 bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded-full">⭐ Featured</div>
                          )}
                          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full capitalize">
                            {PLACE_CATEGORY_ICONS[place.category] ?? "📍"} {place.category}
                          </div>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2">{place.name}</h3>
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">{place.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-white/50 mb-4">
                          {place.openingHours && (
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{place.openingHours}</span>
                          )}
                          {place.entryFee && Number(place.entryFee) > 0 ? (
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />₦{Number(place.entryFee).toLocaleString()} entry</span>
                          ) : (
                            <span className="text-green-400 font-medium">Free Entry</span>
                          )}
                        </div>
                        {highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {highlights.slice(0, 3).map((h, i) => (
                              <span key={i} className="bg-amber-400/10 text-amber-400 text-xs px-2 py-1 rounded-full">{h}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {tab === "activities" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">All Activities in {city.name}</h2>
            {activities.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">No activities yet</h3>
                <p className="text-white/50">Partners are being onboarded. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map(activity => (
                  <div key={activity.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group">
                    {activity.imageUrl ? (
                      <img src={activity.imageUrl} alt={activity.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-amber-900/20 to-orange-900/20 flex items-center justify-center text-6xl">
                        {ACTIVITY_ICONS[activity.type ?? "other"] ?? "✨"}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{ACTIVITY_ICONS[activity.type ?? "other"] ?? "✨"}</span>
                        <span className="text-amber-400/70 text-xs uppercase tracking-wider">{(activity.type ?? "other").replace(/_/g, " ")}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{activity.name}</h3>
                      <p className="text-white/50 text-sm mb-4">{activity.description}</p>
                      <div className="flex items-center gap-4 text-white/50 text-xs mb-4">
                        {activity.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.duration}</span>}
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Max {activity.maxParticipants}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-amber-400">₦{Number(activity.price).toLocaleString()}</span>
                          <span className="text-white/40 text-xs ml-1">{PRICE_UNIT_LABELS[activity.priceUnit ?? "per_person"]}</span>
                        </div>
                        <Button onClick={() => { if (!isAuthenticated) { toast.error("Please sign in to book"); return; } setBookingActivity(activity.id); }} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Accommodation Tab */}
        {tab === "accommodation" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Accommodation in {city.name}</h2>
            {accommodations.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🛏️</div>
                <h3 className="text-xl font-bold text-white mb-2">No accommodations yet</h3>
                <p className="text-white/50">Partners are being onboarded. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accommodations.map(room => (
                  <div key={room.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group">
                    {room.imageUrl ? (
                      <img src={room.imageUrl} alt={room.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-amber-900/20 to-orange-900/20 flex items-center justify-center text-6xl">🛏️</div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Bed className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400/70 text-xs uppercase tracking-wider capitalize">{(room.type ?? "double").replace(/_/g, " ")}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{room.name}</h3>
                      <p className="text-white/50 text-sm mb-3">{room.description}</p>
                      <div className="flex items-center gap-3 text-white/50 text-xs mb-4">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Up to {room.capacity} guests</span>
                        <span>{room.totalRooms} room{(room.totalRooms ?? 1) > 1 ? "s" : ""} available</span>
                      </div>
                      {Array.isArray(room.amenities) && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(room.amenities as string[]).slice(0, 4).map((a, i) => (
                            <span key={i} className="bg-white/5 text-white/60 text-xs px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-amber-400">₦{Number(room.pricePerNight).toLocaleString()}</span>
                          <span className="text-white/40 text-xs ml-1">/night</span>
                        </div>
                        <Button onClick={() => { if (!isAuthenticated) { toast.error("Please sign in to book"); return; } setBookingRoom(room.id); }} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                          Book Room
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Partners Tab */}
        {tab === "partners" && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Our Partners in {city.name}</h2>
            {partners.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-white mb-2">No partners yet in {city.name}</h3>
                <p className="text-white/50 mb-6">Be the first to list your venue or activity here!</p>
                <Link href="/partners/register">
                  <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold">Become a Partner</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map(partner => (
                  <Link key={partner.id} href={`/partners/${partner.slug}`}>
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group cursor-pointer">
                      {partner.imageUrl ? (
                        <img src={partner.imageUrl} alt={partner.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-amber-900/20 to-orange-900/20 flex items-center justify-center text-5xl">🏢</div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-amber-400/70 text-xs uppercase tracking-wider capitalize">{(partner.category ?? "partner").replace(/_/g, " ")}</span>
                          {partner.verified && <span className="text-xs text-green-400 flex items-center gap-1">✓ Verified</span>}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{partner.name}</h3>
                        <p className="text-white/50 text-sm line-clamp-2">{partner.shortDescription ?? partner.description}</p>
                        <div className="flex items-center gap-1 mt-3 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View Profile <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Booking Modal */}
      <Dialog open={bookingActivity !== null} onOpenChange={() => setBookingActivity(null)}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-400">Book Activity</DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{ACTIVITY_ICONS[selectedActivity.type ?? "other"]}</span>
                  <h3 className="font-bold text-white">{selectedActivity.name}</h3>
                </div>
                <p className="text-amber-400 font-bold">₦{Number(selectedActivity.price).toLocaleString()} {PRICE_UNIT_LABELS[selectedActivity.priceUnit ?? "per_person"]}</p>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Date</label>
                <input type="datetime-local" value={activityDate} onChange={e => setActivityDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Participants</label>
                <input type="number" min={1} max={selectedActivity.maxParticipants ?? 10} value={activityParticipants}
                  onChange={e => setActivityParticipants(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Price per person</span>
                  <span className="text-white">₦{Number(selectedActivity.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">₦{(Number(selectedActivity.price) * activityParticipants).toLocaleString()}</span>
                </div>
              </div>
              <Button
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
                disabled={!activityDate || bookActivityMutation.isPending}
                onClick={() => bookActivityMutation.mutate({ activityId: selectedActivity.id, scheduledDate: activityDate, participants: activityParticipants })}
              >
                {bookActivityMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Accommodation Booking Modal */}
      <Dialog open={bookingRoom !== null} onOpenChange={() => setBookingRoom(null)}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-400">Book Room</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bed className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white">{selectedRoom.name}</h3>
                </div>
                <p className="text-amber-400 font-bold">₦{Number(selectedRoom.pricePerNight).toLocaleString()} / night</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Check-in</label>
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-1 block">Check-out</label>
                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Guests</label>
                <input type="number" min={1} max={selectedRoom.capacity ?? 2} value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              {nights > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">{nights} night{nights > 1 ? "s" : ""} × ₦{Number(selectedRoom.pricePerNight).toLocaleString()}</span>
                    <span className="text-white">₦{(Number(selectedRoom.pricePerNight) * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-amber-400">₦{(Number(selectedRoom.pricePerNight) * nights).toLocaleString()}</span>
                  </div>
                </div>
              )}
              <Button
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
                disabled={!checkIn || !checkOut || nights < 1 || bookRoomMutation.isPending}
                onClick={() => bookRoomMutation.mutate({ accommodationId: selectedRoom.id, checkInDate: checkIn, checkOutDate: checkOut, guests })}
              >
                {bookRoomMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
