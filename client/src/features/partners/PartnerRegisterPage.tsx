import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Mail, Globe, CheckCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const CATEGORIES = [
  { value: "resort", label: "Resort / Hotel", icon: "🏨" },
  { value: "park", label: "National Park / Reserve", icon: "🌿" },
  { value: "farm", label: "Farm / Ranch", icon: "🌾" },
  { value: "cultural", label: "Cultural Centre", icon: "🏛️" },
  { value: "transport", label: "Transport / Tours", icon: "🚌" },
  { value: "water_sports", label: "Water Sports", icon: "🚣" },
  { value: "adventure", label: "Adventure Sports", icon: "🪂" },
  { value: "accommodation", label: "Accommodation Only", icon: "🛏️" },
  { value: "restaurant", label: "Restaurant / Dining", icon: "🍽️" },
];

const BENEFITS = [
  "Get discovered by thousands of adventure seekers",
  "Manage bookings and availability in real-time",
  "Receive payments directly via Paystack",
  "Feature your activities and accommodation packages",
  "Join Nigeria's fastest-growing adventure community",
  "Access analytics and booking reports",
];

export default function PartnerRegisterPage() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { data: cities } = trpc.cities.list.useQuery();
  const { data: existingPartner } = trpc.partners.myPartner.useQuery(undefined, { enabled: isAuthenticated });

  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    cityId: 0,
    category: "" as string,
    address: "",
    phone: "",
    email: user?.email ?? "",
    website: "",
  });

  const registerMutation = trpc.partners.register.useMutation({
    onSuccess: () => {
      toast.success("Application submitted! We will review and approve your listing within 24–48 hours.");
      navigate("/partner-dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.cityId || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    registerMutation.mutate({
      ...form,
      cityId: Number(form.cityId),
      category: form.category as "resort" | "park" | "farm" | "cultural" | "transport" | "water_sports" | "adventure" | "accommodation" | "restaurant",
      email: form.email || undefined,
      website: form.website || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="container pt-32 pb-24 text-center max-w-lg mx-auto">
          <div className="text-6xl mb-6">🤝</div>
          <h1 className="text-3xl font-black text-white mb-4">Become a Partner</h1>
          <p className="text-white/60 mb-8">Sign in to register your venue, resort, or activity on Hike Kings & Tours and start receiving bookings.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 text-lg">
              Sign In to Continue
            </Button>
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  if (existingPartner) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="container pt-32 pb-24 text-center max-w-lg mx-auto">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-black text-white mb-4">You're already a Partner!</h1>
          <p className="text-white/60 mb-2">Your application for <strong className="text-white">{existingPartner.name}</strong> is <span className={`font-bold ${existingPartner.status === "approved" ? "text-green-400" : existingPartner.status === "pending" ? "text-amber-400" : "text-red-400"}`}>{existingPartner.status}</span>.</p>
          <p className="text-white/50 mb-8 text-sm">{existingPartner.status === "pending" ? "Our team will review your application within 24–48 hours." : ""}</p>
          <Button onClick={() => navigate("/partner-dashboard")} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
            Go to Partner Dashboard
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-transparent" />
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Partner Programme</span>
              </div>
              <h1 className="text-5xl font-black text-white mb-6 leading-tight">
                List Your Venue on<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Hike Kings & Tours
                </span>
              </h1>
              <p className="text-white/60 text-lg mb-8">
                Join Nigeria's premier adventure marketplace. Whether you run a resort, offer horse rides, kayaking, or cultural tours — connect with thousands of adventure seekers ready to book.
              </p>
              <div className="space-y-3">
                {BENEFITS.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-white/70">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Register Your Business</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">Business Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Zuma Rock Resort"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          form.category === cat.value
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                        }`}
                      >
                        <div className="text-xl mb-1">{cat.icon}</div>
                        <div className="text-xs leading-tight">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">City *</label>
                  <select
                    value={form.cityId}
                    onChange={e => setForm(f => ({ ...f, cityId: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  >
                    <option value={0} className="bg-[#111]">Select city...</option>
                    {(cities ?? []).map(city => (
                      <option key={city.id} value={city.id} className="bg-[#111]">{city.name}, {city.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">Short Description (tagline)</label>
                  <input
                    type="text"
                    placeholder="e.g. Adventure resort at the foot of Zuma Rock"
                    value={form.shortDescription}
                    onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                    maxLength={120}
                  />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">Full Description *</label>
                  <textarea
                    placeholder="Describe your venue, what makes it special, and what visitors can expect..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input type="tel" placeholder="+234..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input type="email" placeholder="info@..." value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" placeholder="Full address..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-1.5 block">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="url" placeholder="https://..." value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 text-lg rounded-xl"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Submitting..." : (
                    <span className="flex items-center justify-center gap-2">Submit Application <ArrowRight className="w-5 h-5" /></span>
                  )}
                </Button>
                <p className="text-white/40 text-xs text-center">Applications are reviewed within 24–48 hours. You will be notified once approved.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
