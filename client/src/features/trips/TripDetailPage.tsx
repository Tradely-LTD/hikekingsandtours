import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  MapPin, Calendar, Users, Clock, ArrowLeft, CheckCircle, XCircle,
  Star, ChevronDown, ChevronUp, Loader2, Mountain, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

// ── Placeholder trips (same as TripsPage, used as fallback) ──────────────────
const PLACEHOLDER_TRIPS = [
  {
    id: 1, title: "Yankari Wildlife Safari & Lodge", slug: "yankari-wildlife-safari",
    cityName: "Bauchi", duration: 3, difficulty: "easy", soloPrice: 85000,
    couplePrice: 155000, groupPrice: 230000, maxParticipants: 20,
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200",
    galleryUrls: [
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
    ],
    shortDescription: "3-day all-inclusive safari at Yankari Game Reserve with warm spring dip and lodge stay.",
    description: "Experience the magic of Yankari Game Reserve — Nigeria's premier wildlife destination. Over three days you'll enjoy guided game drives spotting elephants, baboons, and hundreds of bird species, take a refreshing dip in the famous Wikki Warm Spring, and unwind in comfortable lodge accommodation. All meals, park entry fees, and a certified guide are included.",
    includes: ["Game drives", "Wikki Warm Spring", "Lodge accommodation", "All meals", "Park entry fees", "Certified guide"],
    excludes: ["Flights / transport to Bauchi", "Personal items", "Alcoholic beverages"],
    itinerary: [
      { day: 1, title: "Arrival & Evening Game Drive", description: "Check in to Yankari Lodge, orientation walk, evening game drive at sunset." },
      { day: 2, title: "Full-Day Safari & Warm Spring", description: "Morning game drive, afternoon at Wikki Warm Spring, bonfire dinner under the stars." },
      { day: 3, title: "Morning Drive & Departure", description: "Early morning bird-watching walk, breakfast, check-out and departure." },
    ],
    departureDateStart: "2026-04-10",
    departureDateEnd: "2026-04-12",
    featured: true, status: "published",
  },
  {
    id: 2, title: "Zuma Rock Adventure Weekend", slug: "zuma-rock-adventure",
    cityName: "Abuja", duration: 2, difficulty: "moderate", soloPrice: 65000,
    couplePrice: 120000, groupPrice: 175000, maxParticipants: 15,
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
    galleryUrls: [
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    ],
    shortDescription: "2-day adventure at Zuma Rock Resort — horse riding, cycling, and rock photography.",
    description: "Spend a thrilling weekend at the foot of Nigeria's iconic Zuma Rock. This adventure package combines horse riding through scenic trails, mountain cycling, and guided photography sessions to capture the monolith at golden hour. Overnight at a boutique resort with all meals included.",
    includes: ["Horse riding", "Cycling trails", "Rock photography", "Resort stay", "All meals"],
    excludes: ["Transport to Abuja", "Personal gear", "Tips"],
    itinerary: [
      { day: 1, title: "Horse Riding & Photography", description: "Morning horse riding, afternoon photography session at Zuma Rock, evening bonfire." },
      { day: 2, title: "Cycling & Departure", description: "Sunrise cycling trail, breakfast, check-out." },
    ],
    departureDateStart: "2026-04-18",
    departureDateEnd: "2026-04-19",
    featured: false, status: "published",
  },
  {
    id: 3, title: "Calabar Cultural Carnival Tour", slug: "calabar-cultural-carnival",
    cityName: "Calabar", duration: 4, difficulty: "easy", soloPrice: 120000,
    couplePrice: 220000, groupPrice: 310000, maxParticipants: 25,
    imageUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200",
    galleryUrls: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600",
    ],
    shortDescription: "4-day cultural immersion in Calabar — museum, Tinapa, and the famous carnival experience.",
    description: "Immerse yourself in the rich culture of Calabar over four unforgettable days. Visit the Calabar Museum, explore Tinapa Resort, witness the world-famous Calabar Carnival parade, and savour authentic Cross River seafood cuisine. Hotel accommodation and all cultural entry fees are included.",
    includes: ["Calabar Museum", "Tinapa Resort", "Carnival parade", "Seafood dining", "Hotel accommodation", "Cultural guide"],
    excludes: ["Flights to Calabar", "Personal shopping", "Alcoholic beverages"],
    itinerary: [
      { day: 1, title: "Arrival & Calabar Museum", description: "Check in, guided tour of Calabar Museum and Old Residency." },
      { day: 2, title: "Tinapa Resort", description: "Full day at Tinapa — water park, shopping, and film village." },
      { day: 3, title: "Carnival Day", description: "Experience the Calabar Carnival parade, street food, and live music." },
      { day: 4, title: "Seafood Brunch & Departure", description: "Waterfront seafood brunch, souvenir shopping, check-out." },
    ],
    departureDateStart: "2026-05-01",
    departureDateEnd: "2026-05-04",
    featured: true, status: "published",
  },
  {
    id: 4, title: "Jabi Lake & Abuja City Explorer", slug: "jabi-lake-abuja",
    cityName: "Abuja", duration: 2, difficulty: "easy", soloPrice: 45000,
    couplePrice: 82000, groupPrice: 115000, maxParticipants: 30,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    galleryUrls: [],
    shortDescription: "Weekend of kayaking, boat rides, and city sightseeing in the capital.",
    description: "A relaxing yet action-packed weekend in Abuja. Kayak and boat-ride on Jabi Lake, stroll through Millennium Park, catch a panoramic view of Aso Rock, and explore the National Mosque and Arts & Crafts Village. Perfect for first-time visitors to the capital.",
    includes: ["Kayaking", "Boat rides", "Millennium Park", "Aso Rock view", "Hotel stay", "Breakfast daily"],
    excludes: ["Transport to Abuja", "Lunch & dinner", "Personal items"],
    itinerary: [
      { day: 1, title: "Jabi Lake & Millennium Park", description: "Morning kayaking, afternoon Millennium Park and Aso Rock viewpoint." },
      { day: 2, title: "City Tour & Departure", description: "National Mosque, Arts & Crafts Village, farewell brunch." },
    ],
    departureDateStart: "2026-04-25",
    departureDateEnd: "2026-04-26",
    featured: false, status: "published",
  },
  {
    id: 5, title: "Jos Plateau Sunrise Hike", slug: "jos-plateau-sunrise",
    cityName: "Jos", duration: 2, difficulty: "moderate", soloPrice: 55000,
    couplePrice: 100000, groupPrice: 140000, maxParticipants: 20,
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200",
    galleryUrls: [],
    shortDescription: "Sunrise hike on the Jos Plateau with panoramic views and a cool highland retreat.",
    description: "Wake before dawn and summit the Jos Plateau for a breathtaking sunrise over the Nigerian highlands. Your certified guide leads you through rocky trails, past ancient rock formations, and into cool highland air. Overnight at a cosy highland lodge with local cuisine.",
    includes: ["Sunrise summit", "Plateau views", "Highland lodge", "Local cuisine", "Certified guide"],
    excludes: ["Transport to Jos", "Personal gear", "Tips"],
    itinerary: [
      { day: 1, title: "Arrival & Evening Trek", description: "Check in, acclimatisation walk, evening briefing." },
      { day: 2, title: "Sunrise Summit & Departure", description: "Pre-dawn hike to summit, sunrise, breakfast at lodge, check-out." },
    ],
    departureDateStart: "2026-05-09",
    departureDateEnd: "2026-05-10",
    featured: false, status: "published",
  },
  {
    id: 6, title: "Kano Ancient City Heritage Tour", slug: "kano-heritage-tour",
    cityName: "Kano", duration: 3, difficulty: "easy", soloPrice: 75000,
    couplePrice: 138000, groupPrice: 195000, maxParticipants: 20,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200",
    galleryUrls: [],
    shortDescription: "3-day deep dive into Kano's ancient walls, dye pits, and Emir's palace.",
    description: "Step back in time in Kano — one of West Africa's oldest cities. Visit the 500-year-old Kofar Mata Dye Pits, the magnificent Emir's Palace, the sprawling Kurmi Market, and the Gidan Makama Museum. A knowledgeable local guide brings history to life at every stop.",
    includes: ["Kofar Mata Dye Pits", "Emir's Palace", "Kurmi Market", "Gidan Makama Museum", "Hotel stay", "All meals"],
    excludes: ["Flights to Kano", "Personal shopping", "Tips"],
    itinerary: [
      { day: 1, title: "Arrival & Old City Walk", description: "Check in, evening walk through the ancient city walls." },
      { day: 2, title: "Dye Pits & Palace", description: "Morning at Kofar Mata Dye Pits, afternoon Emir's Palace tour." },
      { day: 3, title: "Kurmi Market & Museum", description: "Kurmi Market shopping, Gidan Makama Museum, farewell lunch, departure." },
    ],
    departureDateStart: "2026-05-15",
    departureDateEnd: "2026-05-17",
    featured: false, status: "published",
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400 bg-green-500/10 border-green-500/20",
  moderate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  challenging: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  extreme: "text-red-400 bg-red-500/10 border-red-500/20",
};

type PackageType = "solo" | "couple" | "group";

export default function TripDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [packageType, setPackageType] = useState<PackageType>("solo");
  const [participants, setParticipants] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [bookingStep, setBookingStep] = useState<"idle" | "form" | "success">("idle");

  // Try to load from DB first
  const { data: dbData, isLoading } = trpc.trips.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  // Normalise DB trip or fall back to placeholder
  const placeholderTrip = PLACEHOLDER_TRIPS.find((t) => t.slug === slug);

  const trip = dbData?.trip
    ? {
        id: dbData.trip.id,
        title: dbData.trip.title,
        slug: dbData.trip.slug,
        cityName: dbData.city?.name ?? "Nigeria",
        duration: dbData.trip.durationNights ?? 1,
        difficulty: "moderate",
        soloPrice: Number(dbData.trip.soloPrice),
        couplePrice: dbData.trip.couplePrice ? Number(dbData.trip.couplePrice) : Number(dbData.trip.soloPrice) * 1.8,
        groupPrice: dbData.trip.groupPrice ? Number(dbData.trip.groupPrice) : Number(dbData.trip.soloPrice) * 2.5,
        maxParticipants: dbData.trip.maxParticipants ?? 30,
        imageUrl: dbData.trip.imageUrl ?? "",
        galleryUrls: dbData.trip.galleryUrls ?? [],
        shortDescription: dbData.trip.shortDescription ?? "",
        description: dbData.trip.description ?? "",
        includes: dbData.trip.includes ?? [],
        excludes: dbData.trip.excludes ?? [],
        itinerary: dbData.trip.itinerary ?? [],
        departureDateStart: dbData.trip.departureDateStart ? new Date(String(dbData.trip.departureDateStart)).toISOString().split("T")[0] : "",
        departureDateEnd: dbData.trip.departureDateEnd ? new Date(String(dbData.trip.departureDateEnd)).toISOString().split("T")[0] : "",
        featured: dbData.trip.featured ?? false,
        status: dbData.trip.status ?? "published",
      }
    : placeholderTrip ?? null;

  const bookTrip = trpc.trips.book.useMutation({
    onSuccess: () => setBookingStep("success"),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Navbar />
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6">
        <Navbar />
        <Mountain className="w-16 h-16 text-amber-400/30" />
        <h1 className="text-3xl font-black text-white">Trip Not Found</h1>
        <p className="text-white/50">The trip you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/trips")} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Trips
        </Button>
      </div>
    );
  }

  const priceMap: Record<PackageType, number> = {
    solo: trip.soloPrice,
    couple: trip.couplePrice,
    group: trip.groupPrice,
  };
  const selectedPrice = priceMap[packageType];

  const handleBook = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (bookingStep === "idle") {
      setBookingStep("form");
      return;
    }
    bookTrip.mutate({
      tripId: trip.id,
      packageType,
      participants,
      specialRequests: specialRequests || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img
          src={trip.imageUrl}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container pb-10">
          <button
            onClick={() => navigate("/trips")}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Trips
          </button>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${DIFFICULTY_COLORS[trip.difficulty] ?? DIFFICULTY_COLORS.moderate}`}>
              {trip.difficulty}
            </span>
            {trip.featured && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400">
                ★ Featured
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{trip.title}</h1>
          <div className="flex flex-wrap items-center gap-5 text-white/60 text-sm">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-400" />{trip.cityName}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" />{trip.duration} days</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-amber-400" />Max {trip.maxParticipants} people</span>
            {trip.departureDateStart && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                {new Date(trip.departureDateStart).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                {trip.departureDateEnd && ` – ${new Date(trip.departureDateEnd).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}`}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-10">

            {/* Overview */}
            <div>
              <h2 className="text-2xl font-black text-white mb-4">Overview</h2>
              <p className="text-white/70 leading-relaxed">{trip.description || trip.shortDescription}</p>
            </div>

            {/* Gallery */}
            {trip.galleryUrls && trip.galleryUrls.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {trip.galleryUrls.map((url, i) => (
                    <div key={i} className="aspect-video rounded-2xl overflow-hidden">
                      <img src={url} alt={`${trip.title} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {trip.itinerary && trip.itinerary.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-white mb-4">Itinerary</h2>
                <div className="space-y-3">
                  {trip.itinerary.map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-black flex items-center justify-center">
                            {item.day}
                          </span>
                          <span className="font-bold text-white">{item.title}</span>
                        </div>
                        {expandedDay === i
                          ? <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                        }
                      </button>
                      {expandedDay === i && (
                        <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Includes / Excludes */}
            <div className="grid sm:grid-cols-2 gap-6">
              {trip.includes && trip.includes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> What's Included
                  </h3>
                  <ul className="space-y-2">
                    {trip.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {trip.excludes && trip.excludes.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" /> Not Included
                  </h3>
                  <ul className="space-y-2">
                    {trip.excludes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
              {bookingStep === "success" ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-white mb-2">Booking Confirmed!</h3>
                  <p className="text-white/60 text-sm mb-6">Your trip booking has been submitted. Check your dashboard for details.</p>
                  <Button onClick={() => navigate("/dashboard")} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold">
                    View My Bookings <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Starting from</p>
                    <div className="text-3xl font-black text-amber-400">₦{trip.soloPrice.toLocaleString("en-NG")}</div>
                    <p className="text-white/40 text-xs mt-0.5">per person</p>
                  </div>

                  {/* Package type */}
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Package Type</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["solo", "couple", "group"] as PackageType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => { setPackageType(type); if (type === "solo") setParticipants(1); if (type === "couple") setParticipants(2); }}
                          className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                            packageType === type
                              ? "bg-amber-500 text-black"
                              : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {type}
                          <div className="text-[0.6rem] mt-0.5 opacity-70">
                            ₦{priceMap[type].toLocaleString("en-NG")}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Participants</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setParticipants(Math.max(1, participants - 1))}
                        className="w-9 h-9 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-bold text-lg flex items-center justify-center"
                      >−</button>
                      <span className="text-white font-bold text-lg w-8 text-center">{participants}</span>
                      <button
                        onClick={() => setParticipants(Math.min(trip.maxParticipants, participants + 1))}
                        className="w-9 h-9 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-bold text-lg flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>

                  {/* Special requests (shown in form step) */}
                  {bookingStep === "form" && (
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Special Requests (optional)</p>
                      <textarea
                        rows={3}
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Dietary requirements, accessibility needs, etc."
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-amber-500/50 resize-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/60 text-sm">Total</span>
                      <span className="text-amber-400 font-black text-xl">
                        ₦{(selectedPrice * participants).toLocaleString("en-NG")}
                      </span>
                    </div>
                    <Button
                      onClick={handleBook}
                      disabled={bookTrip.isPending}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-3 text-base"
                    >
                      {bookTrip.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                      ) : bookingStep === "form" ? (
                        <>Confirm Booking <ArrowRight className="w-4 h-4 ml-1" /></>
                      ) : isAuthenticated ? (
                        <>Book This Trip <ArrowRight className="w-4 h-4 ml-1" /></>
                      ) : (
                        <>Sign In to Book <ArrowRight className="w-4 h-4 ml-1" /></>
                      )}
                    </Button>
                    {!isAuthenticated && (
                      <p className="text-white/30 text-xs text-center mt-2">You'll be redirected to sign in</p>
                    )}
                  </div>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-4 pt-2 text-white/30 text-xs">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400/50" /> Certified guides</span>
                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400/50" /> Instant confirmation</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
