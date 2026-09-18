import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Building2, Users, CheckCircle, ArrowRight, Mountain, Calendar,
  Shield, Star, Briefcase, Award, ChevronDown, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PACKAGES = [
  {
    id: "basic",
    name: "Basic Team",
    price: 2000000,
    groupSize: "10–30",
    duration: "1 Day",
    popular: false,
    color: "glass-card",
    features: [
      "1-day guided team hike",
      "Professional guide (1:15 ratio)",
      "Water & energy drinks",
      "Light refreshments",
      "Team photo session",
      "Safety briefing & first aid",
      "Post-event summary report",
      "Certificate of participation",
    ],
    ideal: "Small teams, department outings, quarterly team events",
  },
  {
    id: "premium",
    name: "Premium Corporate",
    price: 3500000,
    groupSize: "30–100",
    duration: "1–2 Days",
    popular: true,
    color: "membership-vip",
    features: [
      "Everything in Basic, plus:",
      "Custom itinerary design",
      "Multiple activity stations",
      "Full catering (breakfast & lunch)",
      "Team-building facilitator",
      "Professional photographer",
      "Branded merchandise for all",
      "Live location tracking",
      "Emergency medical support",
      "Detailed analytics report",
    ],
    ideal: "Mid-size companies, annual retreats, leadership programs",
  },
  {
    id: "enterprise",
    name: "Enterprise Retreat",
    price: 5000000,
    groupSize: "100–500+",
    duration: "2–3 Days",
    popular: false,
    color: "glass-card",
    features: [
      "Everything in Premium, plus:",
      "Multi-day expedition planning",
      "Accommodation arrangements",
      "All meals included",
      "Executive concierge service",
      "Custom branded experience",
      "Keynote speaker option",
      "Live streaming capability",
      "Dedicated account manager",
      "Post-event video production",
    ],
    ideal: "Large corporations, annual company retreats, executive programs",
  },
];

const PROCESS = [
  { step: "01", title: "Initial Consultation", desc: "Tell us about your team size, goals, and preferred dates. We'll suggest the best package." },
  { step: "02", title: "Custom Proposal", desc: "Within 48 hours, receive a tailored proposal with itinerary, pricing, and logistics." },
  { step: "03", title: "Confirmation & Planning", desc: "Approve the proposal, make a 50% deposit, and we handle all the logistics." },
  { step: "04", title: "The Experience", desc: "Your team enjoys a world-class adventure with our certified guides and full support." },
  { step: "05", title: "Post-Event Report", desc: "Receive a comprehensive report with photos, analytics, and participant feedback." },
];

const CLIENTS = [
  { name: "GTBank", industry: "Banking", size: "120 staff" },
  { name: "MTN Nigeria", industry: "Telecom", size: "85 staff" },
  { name: "Dangote Group", industry: "Manufacturing", size: "200 staff" },
  { name: "Access Bank", industry: "Banking", size: "60 staff" },
  { name: "Flutterwave", industry: "Fintech", size: "45 staff" },
  { name: "Zenith Bank", industry: "Banking", size: "150 staff" },
];

const FAQS = [
  { q: "What is the minimum group size?", a: "Our minimum group size is 10 participants for the Basic package. We can accommodate groups of up to 500+ for Enterprise packages." },
  { q: "How far in advance should we book?", a: "We recommend booking at least 4–6 weeks in advance for Basic packages and 8–12 weeks for Premium and Enterprise packages to allow proper planning." },
  { q: "Are the packages customizable?", a: "Absolutely. All packages can be customized to match your company culture, team goals, and specific requirements. We'll work with you to create the perfect experience." },
  { q: "What safety measures are in place?", a: "All corporate events include certified first aid responders, emergency protocols, real-time location tracking, and a dedicated safety officer for groups over 50." },
  { q: "What payment terms are available?", a: "We require a 50% deposit to confirm the booking, with the balance due 7 days before the event. We accept bank transfers and all major payment methods." },
];

export default function Corporate() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // NOTE: there is no `date` key. The form renders no date input, and
  // corporate.inquire does not accept a preferred date — keeping the field
  // would silently discard whatever the user typed.
  const [formData, setFormData] = useState({
    company: "", name: "", email: "", phone: "", groupSize: "", package: "", message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const fmt = (n: number) => `₦${(n / 1000000).toFixed(1)}M`;

  const inquire = trpc.corporate.inquire.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Request received. We'll be in touch within 24 hours.");
    },
    onError: (error: { message?: string }) =>
      toast.error(error?.message ?? "Could not send your request. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Free text -> positive int. NaN would fail zod and lose the submission.
    const parsedTeamSize = parseInt(formData.groupSize.replace(/\D/g, ""), 10);
    const teamSize = Number.isFinite(parsedTeamSize) && parsedTeamSize > 0 ? parsedTeamSize : undefined;

    // "custom" is not in the server enum ["basic","premium","enterprise"], and
    // neither is "". Send undefined and keep the signal in the requirements.
    const selected = formData.package;
    const packageType =
      selected === "basic" || selected === "premium" || selected === "enterprise"
        ? selected
        : undefined;

    const requirements = [
      selected === "custom" ? "Custom package requested." : "",
      formData.message.trim(),
    ].filter(Boolean).join(" ");

    const phone = formData.phone.trim();

    inquire.mutate({
      companyName: formData.company.trim(),
      contactName: formData.name.trim(),
      contactEmail: formData.email.trim(),
      ...(phone ? { contactPhone: phone } : {}),
      ...(packageType ? { packageType } : {}),
      ...(teamSize !== undefined ? { teamSize } : {}),
      ...(requirements ? { requirements } : {}),
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1920&q=80" alt="Corporate" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[oklch(0.05_0.01_240/0.88)]" />
        </div>
        <div className="relative container">
          <div className="max-w-3xl">
            <div className="section-label mb-5">For Businesses</div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-5">
              Corporate Team Building<br />
              <span className="text-gradient-gold italic">Through Adventure</span>
            </h1>
            <p className="text-[oklch(0.72_0.01_240)] text-lg max-w-xl mb-8">
              Transform your team dynamics with outdoor adventures. Custom packages designed for Nigerian businesses, from intimate team outings to large-scale corporate retreats.
            </p>
            <div className="flex flex-wrap gap-6 mb-10">
              {[
                { label: "Companies Served", value: "50+" },
                { label: "Staff Participants", value: "3,000+" },
                { label: "Satisfaction Rate", value: "98%" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="font-hero text-3xl text-[var(--gold)]">{value}</div>
                  <div className="text-xs text-[oklch(0.62_0.02_240)] uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
            <a href="#packages" className="btn-gold text-sm px-8 py-4">
              <Briefcase className="w-4 h-4" /> View Packages
            </a>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20" id="packages">
        <div className="container">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4">Investment Options</div>
            <h2 className="font-display text-4xl font-bold text-white">Corporate Packages</h2>
            <p className="text-[oklch(0.62_0.02_240)] mt-3 max-w-lg mx-auto">All packages are fully customizable. Prices are starting points — final pricing depends on group size, location, and requirements.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {PACKAGES.map((pkg) => (
              <div key={pkg.id} className={`rounded-3xl p-8 relative ${pkg.color}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="badge-pill badge-gold px-5 py-2 text-sm">Most Popular</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${pkg.popular ? "bg-[var(--gold)]" : "bg-[var(--stone)]"}`}>
                    <Building2 className={`w-5 h-5 ${pkg.popular ? "text-[oklch(0.08_0.01_240)]" : "text-[var(--gold)]"}`} />
                  </div>
                  <div>
                    <h3 className="font-hero text-2xl tracking-widest text-white">{pkg.name}</h3>
                    <div className="text-xs text-[oklch(0.55_0.02_240)] uppercase tracking-wider">Package</div>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-xs text-[oklch(0.55_0.02_240)] uppercase tracking-wider">Starting from</span>
                  <div className="font-hero text-4xl text-[var(--gold)]">{fmt(pkg.price)}</div>
                </div>
                <div className="flex gap-4 mb-5">
                  <span className="badge-pill badge-green text-xs">
                    <Users className="w-3 h-3" /> {pkg.groupSize} people
                  </span>
                  <span className="badge-pill badge-gold text-xs">
                    <Calendar className="w-3 h-3" /> {pkg.duration}
                  </span>
                </div>
                <p className="text-xs text-[oklch(0.55_0.02_240)] italic mb-5">Ideal for: {pkg.ideal}</p>
                <ul className="space-y-2.5 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--gold)] mt-0.5 shrink-0" />
                      <span className="text-sm text-[oklch(0.72_0.02_240)]">{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#contact" className={`w-full justify-center flex items-center gap-2 ${pkg.popular ? "btn-gold" : "btn-outline-gold"}`}>
                  Request Quote <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-4">How It Works</div>
            <h2 className="font-display text-4xl font-bold text-white">Our Process</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {PROCESS.map((step, i) => (
              <div key={step.step} className="text-center relative">
                {i < PROCESS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-[var(--gold)] to-transparent opacity-30" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.72_0.18_75/0.2)] to-[oklch(0.72_0.18_75/0.05)] border border-[oklch(0.72_0.18_75/0.3)] flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="font-hero text-xl text-[var(--gold)]">{step.step}</span>
                </div>
                <h4 className="font-display font-bold text-white text-sm mb-2">{step.title}</h4>
                <p className="text-xs text-[oklch(0.55_0.02_240)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Clients */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <div className="section-label justify-center mb-4">Trusted By</div>
            <h2 className="font-display text-3xl font-bold text-white">Companies That Trust Us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CLIENTS.map((client) => (
              <div key={client.name} className="glass-card p-5 text-center rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-[var(--stone)] flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div className="font-semibold text-white text-sm">{client.name}</div>
                <div className="text-xs text-[oklch(0.45_0.02_240)] mt-0.5">{client.size}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-[oklch(0.09_0.012_240)]" id="contact">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="section-label mb-5">Get in Touch</div>
              <h2 className="font-display text-4xl font-bold text-white mb-5">Request a Custom Quote</h2>
              <p className="text-[oklch(0.62_0.02_240)] leading-relaxed mb-8">
                Tell us about your team and goals. We'll respond within 24 hours with a tailored proposal.
              </p>
              <div className="space-y-5">
                {[
                  { icon: Shield, title: "Fully Insured", desc: "All events covered by comprehensive liability insurance" },
                  { icon: Award, title: "Certified Team", desc: "Professional guides with wilderness first aid certification" },
                  { icon: Star, title: "5-Star Rated", desc: "Consistently rated 5 stars by corporate clients" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[oklch(0.72_0.18_75/0.1)] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{title}</div>
                      <div className="text-sm text-[oklch(0.55_0.02_240)]">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-3xl p-8">
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-16 h-16 text-[var(--gold)] mx-auto mb-5" />
                  <h3 className="font-display text-2xl font-bold text-white mb-3">Request Received!</h3>
                  <p className="text-[oklch(0.62_0.02_240)]">We'll reach out within 24 hours with your custom proposal.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2 block">Company Name *</label>
                      <input required value={formData.company} onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors" placeholder="Your company" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2 block">Contact Name *</label>
                      <input required value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors" placeholder="Your name" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2 block">Email *</label>
                    <input required type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors" placeholder="company@email.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2 block">Phone *</label>
                      <input required value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors" placeholder="+234 800 000 0000" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2 block">Group Size *</label>
                      <input required value={formData.groupSize} onChange={(e) => setFormData(p => ({ ...p, groupSize: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors" placeholder="e.g. 50 people" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2 block">Preferred Package</label>
                    <select value={formData.package} onChange={(e) => setFormData(p => ({ ...p, package: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors">
                      <option value="" className="bg-[var(--card)]">Select a package</option>
                      <option value="basic" className="bg-[var(--card)]">Basic Team (from ₦2M)</option>
                      <option value="premium" className="bg-[var(--card)]">Premium Corporate (from ₦3.5M)</option>
                      <option value="enterprise" className="bg-[var(--card)]">Enterprise Retreat (from ₦5M)</option>
                      <option value="custom" className="bg-[var(--card)]">Custom Package</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2 block">Additional Requirements</label>
                    <textarea value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors resize-none" placeholder="Tell us about your team goals, preferred dates, or any special requirements..." />
                  </div>
                  <button type="submit" className="btn-gold w-full justify-center py-4" disabled={inquire.isPending}>
                    {inquire.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      <>Submit Request <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-white">Corporate FAQs</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  <span className={`text-[var(--gold)] transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-[oklch(0.65_0.02_240)] leading-relaxed border-t border-[var(--border)]">
                    <div className="pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
