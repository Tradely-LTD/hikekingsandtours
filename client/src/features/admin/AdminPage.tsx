import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Mountain, Users, Calendar, AlertCircle,
  CheckCircle, Plus, Search, Edit,
  BarChart3, DollarSign, Shield, X, Crown, RefreshCw,
  MessageSquare, Ban, Loader2, Image, Trash2, Star, Upload, Video, Link as LinkIcon, MapPin,
  ShoppingBag, Package, Tag, ToggleLeft, ToggleRight, Truck
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "events", label: "Events", icon: Calendar },
  { id: "bookings", label: "Bookings", icon: Mountain },
  { id: "members", label: "Members", icon: Users },
  { id: "complaints", label: "Complaints", icon: AlertCircle },
  { id: "media", label: "Media", icon: Image },
  { id: "places", label: "Places", icon: MapPin },
  { id: "store", label: "Store", icon: ShoppingBag },
];

const REVENUE_DATA = [
  { month: "Oct", bookings: 420000, memberships: 200000, store: 85000 },
  { month: "Nov", bookings: 580000, memberships: 300000, store: 120000 },
  { month: "Dec", bookings: 750000, memberships: 500000, store: 180000 },
  { month: "Jan", bookings: 620000, memberships: 400000, store: 150000 },
  { month: "Feb", bookings: 890000, memberships: 600000, store: 210000 },
  { month: "Mar", bookings: 1100000, memberships: 750000, store: 280000 },
];
const MEMBER_GROWTH = [
  { month: "Oct", members: 1800 }, { month: "Nov", members: 2000 },
  { month: "Dec", members: 2150 }, { month: "Jan", members: 2280 },
  { month: "Feb", members: 2400 }, { month: "Mar", members: 2500 },
];

const fmt = (n: number) => `₦${Number(n).toLocaleString("en-NG")}`;

// ── Create Event Modal ─────────────────────────────────────────────────────────
function CreateEventModal({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    title: "", slug: "", shortDescription: "", description: "",
    category: "standard" as "standard" | "premium" | "camping" | "photography" | "cultural" | "corporate" | "vip_exclusive",
    theme: "",
    difficulty: "moderate" as "easy" | "moderate" | "challenging" | "extreme",
    location: "", price: "", maxParticipants: 50, eventDate: "", featured: false,
    // Fields the public hikes page renders. Without these an event shows a
    // placeholder image, no duration, and empty "What's Included"/"What to Bring".
    imageUrl: "", meetingPoint: "", duration: "",
    memberPrice: "", vipPrice: "",
    includes: "", requirements: "",
    status: "draft" as "draft" | "published",
  });
  const createEvent = trpc.admin.createEvent.useMutation({
    onSuccess: () => { toast.success("Event created successfully!"); utils.admin.events.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  /** "Guide, Water, Lunch" -> ["Guide","Water","Lunch"]; blank -> omitted entirely. */
  const toList = (value: string) => {
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventDate) { toast.error("Please select an event date"); return; }
    const { imageUrl, meetingPoint, duration, memberPrice, vipPrice, includes, requirements, ...rest } = form;
    // Optional fields are spread in only when set — the procedure rejects an
    // empty string where it expects a URL, and treats absent as "not provided".
    createEvent.mutate({
      ...rest,
      eventDate: new Date(form.eventDate),
      ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      ...(meetingPoint.trim() ? { meetingPoint: meetingPoint.trim() } : {}),
      ...(duration.trim() ? { duration: duration.trim() } : {}),
      ...(memberPrice.trim() ? { memberPrice: memberPrice.trim() } : {}),
      ...(vipPrice.trim() ? { vipPrice: vipPrice.trim() } : {}),
      ...(toList(includes) ? { includes: toList(includes) } : {}),
      ...(toList(requirements) ? { requirements: toList(requirements) } : {}),
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[oklch(0.11_0.015_240)] border border-white/10 rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-white">Create New Event</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Event Title *</label>
              <input required value={form.title}
                onChange={(e) => { set("title", e.target.value); set("slug", slugify(e.target.value)); }}
                placeholder="e.g. Waterfall Adventure Hike"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Location *</label>
              <input required value={form.location} onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Gurara Falls, Niger State"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm">
                {["standard","premium","camping","photography","cultural","corporate","vip_exclusive"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm">
                {["easy","moderate","challenging","extreme"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Price (₦) *</label>
              <input required value={form.price} onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Max Participants</label>
              <input type="number" min={1} value={form.maxParticipants} onChange={(e) => set("maxParticipants", Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Event Date & Time *</label>
              <input required type="datetime-local" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Theme</label>
              <input value={form.theme} onChange={(e) => set("theme", e.target.value)} placeholder="e.g. Waterfall Adventure"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Short Description</label>
              <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Brief summary shown on cards"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Full Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Detailed event description..."
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm resize-none" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Image URL</label>
              <input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://… — leave blank to use the default hike image"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
              {form.imageUrl.trim() && (
                <img src={form.imageUrl} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = "block"; }}
                  className="mt-2 w-full h-28 object-cover rounded-lg border border-white/10" />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Member Price (₦)</label>
              <input value={form.memberPrice} onChange={(e) => set("memberPrice", e.target.value)} placeholder="e.g. 4500"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">VIP Price (₦)</label>
              <input value={form.vipPrice} onChange={(e) => set("vipPrice", e.target.value)} placeholder="e.g. 4000"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Duration</label>
              <input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 6 hours"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Meeting Point</label>
              <input value={form.meetingPoint} onChange={(e) => set("meetingPoint", e.target.value)} placeholder="e.g. Jos — Rayfield junction"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">What&apos;s Included</label>
              <input value={form.includes} onChange={(e) => set("includes", e.target.value)}
                placeholder="Comma separated — e.g. Certified guide, Transport, Packed lunch"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">What to Bring</label>
              <input value={form.requirements} onChange={(e) => set("requirements", e.target.value)}
                placeholder="Comma separated — e.g. Hiking boots, 2L water, Rain jacket"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm">
                <option value="draft">Draft — not visible on the site</option>
                <option value="published">Published — live on the hikes page</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-[var(--gold)]" />
              <label htmlFor="featured" className="text-sm text-[oklch(0.75_0.02_240)] cursor-pointer">Feature this event on the homepage</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-[oklch(0.62_0.02_240)] hover:text-white hover:border-white/20 transition-colors text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={createEvent.isPending} className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2">
              {createEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {createEvent.isPending ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Event Modal ───────────────────────────────────────────────────────────
function EditEventModal({ event, onClose }: { event: Record<string, unknown>; onClose: () => void }) {
  const utils = trpc.useUtils();

  const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  /** jsonb arrays come back as string[] | null; render them as an editable comma list. */
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").join(", ") : "");
  /** A timestamp arrives as a Date via superjson; datetime-local needs local "YYYY-MM-DDTHH:mm". */
  const toLocalInput = (v: unknown) => {
    if (!v) return "";
    const d = v instanceof Date ? v : new Date(String(v));
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    title: str(event.title),
    slug: str(event.slug),
    location: str(event.location),
    category: str(event.category) || "standard",
    difficulty: str(event.difficulty) || "moderate",
    theme: str(event.theme),
    price: str(event.price),
    memberPrice: str(event.memberPrice),
    vipPrice: str(event.vipPrice),
    maxParticipants: Number(event.maxParticipants ?? 50),
    eventDate: toLocalInput(event.eventDate),
    imageUrl: str(event.imageUrl),
    meetingPoint: str(event.meetingPoint),
    duration: str(event.duration),
    shortDescription: str(event.shortDescription),
    description: str(event.description),
    includes: list(event.includes),
    requirements: list(event.requirements),
    status: str(event.status) || "published",
    featured: Boolean(event.featured),
  });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const updateEvent = trpc.admin.updateEvent.useMutation({
    onSuccess: () => { toast.success("Event updated!"); utils.admin.events.invalidate(); utils.hikes.list.invalidate(); utils.hikes.featured.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSave = () => {
    const text = (v: string) => (v.trim() ? v.trim() : undefined);
    const toList = (v: string) => {
      const items = v.split(",").map((s) => s.trim()).filter(Boolean);
      return items.length > 0 ? items : undefined;
    };
    // Every field is optional on update; only send what has a value so a blank
    // input never overwrites stored content with an empty string.
    updateEvent.mutate({
      id: Number(event.id),
      title: form.title,
      status: form.status as "draft" | "published" | "cancelled" | "completed",
      featured: form.featured,
      maxParticipants: Number(form.maxParticipants) || undefined,
      ...(form.eventDate ? { eventDate: new Date(form.eventDate) } : {}),
      ...(text(form.slug) ? { slug: text(form.slug) } : {}),
      ...(text(form.location) ? { location: text(form.location) } : {}),
      ...(text(form.category) ? { category: form.category as "standard" } : {}),
      ...(text(form.difficulty) ? { difficulty: form.difficulty as "moderate" } : {}),
      ...(text(form.theme) ? { theme: text(form.theme) } : {}),
      ...(text(form.price) ? { price: text(form.price) } : {}),
      ...(text(form.memberPrice) ? { memberPrice: text(form.memberPrice) } : {}),
      ...(text(form.vipPrice) ? { vipPrice: text(form.vipPrice) } : {}),
      ...(text(form.imageUrl) ? { imageUrl: text(form.imageUrl) } : {}),
      ...(text(form.meetingPoint) ? { meetingPoint: text(form.meetingPoint) } : {}),
      ...(text(form.duration) ? { duration: text(form.duration) } : {}),
      ...(text(form.shortDescription) ? { shortDescription: text(form.shortDescription) } : {}),
      ...(text(form.description) ? { description: text(form.description) } : {}),
      ...(toList(form.includes) ? { includes: toList(form.includes) } : {}),
      ...(toList(form.requirements) ? { requirements: toList(form.requirements) } : {}),
    });
  };

  const field = "w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm";
  const lbl = "block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[oklch(0.11_0.015_240)] border border-white/10 rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[oklch(0.11_0.015_240)] z-10">
          <h2 className="font-display text-xl font-bold text-white">Edit Event</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Title</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={field} />
            </div>
            <div>
              <label className={lbl}>Location</label>
              <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Idanre, Ondo State" className={field} />
            </div>
            <div>
              <label className={lbl}>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={field}>
                {["standard","premium","camping","photography","cultural","corporate","vip_exclusive"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Difficulty</label>
              <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={field}>
                {["easy","moderate","challenging","extreme"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Price (₦)</label>
              <input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 45000" className={field} />
            </div>
            <div>
              <label className={lbl}>Max Participants</label>
              <input type="number" min={1} value={form.maxParticipants} onChange={(e) => set("maxParticipants", Number(e.target.value))} className={field} />
            </div>
            <div>
              <label className={lbl}>Member Price (₦)</label>
              <input value={form.memberPrice} onChange={(e) => set("memberPrice", e.target.value)} placeholder="e.g. 40500" className={field} />
            </div>
            <div>
              <label className={lbl}>VIP Price (₦)</label>
              <input value={form.vipPrice} onChange={(e) => set("vipPrice", e.target.value)} placeholder="e.g. 38000" className={field} />
            </div>
            <div>
              <label className={lbl}>Event Date &amp; Time</label>
              <input type="datetime-local" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} className={field} />
            </div>
            <div>
              <label className={lbl}>Duration</label>
              <input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 8 hours" className={field} />
            </div>
            <div>
              <label className={lbl}>Theme</label>
              <input value={form.theme} onChange={(e) => set("theme", e.target.value)} placeholder="e.g. Sunrise" className={field} />
            </div>
            <div>
              <label className={lbl}>Meeting Point</label>
              <input value={form.meetingPoint} onChange={(e) => set("meetingPoint", e.target.value)} placeholder="e.g. Akure city centre" className={field} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className={lbl}>Image URL</label>
              <input type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" className={field} />
              {form.imageUrl.trim() && (
                <img src={form.imageUrl} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = "block"; }}
                  className="mt-2 w-full h-28 object-cover rounded-lg border border-white/10" />
              )}
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className={lbl}>Slug</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="url-friendly-name" className={field} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className={lbl}>Short Description</label>
              <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="Brief summary shown on cards" className={field} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className={lbl}>Full Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={`${field} resize-none`} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className={lbl}>What&apos;s Included</label>
              <input value={form.includes} onChange={(e) => set("includes", e.target.value)} placeholder="Comma separated — e.g. Certified guide, Transport, Lunch" className={field} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className={lbl}>What to Bring</label>
              <input value={form.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder="Comma separated — e.g. Hiking boots, 2L water" className={field} />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={field}>
                <option value="draft">Draft — not visible on the site</option>
                <option value="published">Published — live on the hikes page</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="edit-featured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-[var(--gold)]" />
              <label htmlFor="edit-featured" className="text-sm text-[oklch(0.75_0.02_240)] cursor-pointer">Featured on homepage</label>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-3 sticky bottom-0 bg-[oklch(0.11_0.015_240)]">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-[oklch(0.62_0.02_240)] hover:text-white transition-colors text-sm font-semibold">Cancel</button>
          <button onClick={handleSave} disabled={updateEvent.isPending}
            className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2">
            {updateEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
            {updateEvent.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Booking Modal ─────────────────────────────────────────────────────────
function BookingModal({ booking, onClose }: { booking: Record<string, unknown>; onClose: () => void }) {
  const fields: [string, string][] = [
    ["Booking ID", String(booking.id ?? "—")],
    ["Member", String(booking.userName ?? "—")],
    ["Email", String(booking.userEmail ?? "—")],
    ["Event", String(booking.eventTitle ?? "—")],
    ["Event Date", booking.eventDate ? new Date(String(booking.eventDate)).toLocaleString("en-NG") : "—"],
    ["Guests", String(booking.guestCount ?? 1)],
    ["Total Amount", booking.totalAmount ? fmt(Number(booking.totalAmount)) : "—"],
    ["Payment Status", String(booking.paymentStatus ?? "—")],
    ["Booking Status", String(booking.status ?? "—")],
    ["Booked On", booking.createdAt ? new Date(String(booking.createdAt)).toLocaleString("en-NG") : "—"],
    ["Special Requests", String(booking.specialRequests ?? "None")],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[oklch(0.11_0.015_240)] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-white">Booking Details</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3">
          {fields.map(([k, v]) => (
            <div key={k} className="flex justify-between items-start gap-4 border-b border-white/5 pb-3 last:border-0">
              <span className="text-xs font-semibold text-[oklch(0.55_0.02_240)] uppercase tracking-wider shrink-0">{k}</span>
              <span className="text-sm text-white font-medium text-right">{v}</span>
            </div>
          ))}
        </div>
        <div className="p-6 pt-0">
          <button onClick={onClose} className="w-full btn-gold py-2.5 text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Respond Complaint Modal ────────────────────────────────────────────────────
function RespondModal({ complaint, onClose }: { complaint: Record<string, unknown>; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [notes, setNotes] = useState(String(complaint.adminNotes ?? ""));
  const [status, setStatus] = useState<"open" | "in_review" | "resolved" | "closed">("in_review");
  const resolve = trpc.admin.resolveComplaint.useMutation({
    onSuccess: () => { toast.success("Complaint updated successfully!"); utils.admin.complaints.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[oklch(0.11_0.015_240)] border border-white/10 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-white">Respond to Complaint</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm font-semibold text-white">{String(complaint.subject ?? "")}</p>
            <p className="text-xs text-[oklch(0.55_0.02_240)] mt-1">
              {complaint.createdAt ? new Date(String(complaint.createdAt)).toLocaleDateString("en-NG") : ""}
            </p>
            {complaint.description != null && <p className="text-sm text-[oklch(0.62_0.02_240)] mt-2">{String(complaint.description)}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Update Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm">
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Admin Notes / Response</label>
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your response or internal notes here..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm resize-none" />
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-[oklch(0.62_0.02_240)] hover:text-white transition-colors text-sm font-semibold">Cancel</button>
          <button
            onClick={() => resolve.mutate({ id: Number(complaint.id), status, adminNotes: notes })}
            disabled={resolve.isPending}
            className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2">
            {resolve.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {resolve.isPending ? "Saving..." : "Save Response"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [complaintFilter, setComplaintFilter] = useState<string | undefined>(undefined);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Record<string, unknown> | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Record<string, unknown> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Record<string, unknown> | null>(null);

  const isAdmin = isAuthenticated && user?.role === "admin";

  const statsQuery = trpc.admin.stats.useQuery(undefined, { enabled: isAdmin });
  const eventsQuery = trpc.admin.events.useQuery({ limit: 50 }, { enabled: isAdmin });
  const bookingsQuery = trpc.admin.bookings.useQuery({ limit: 50, offset: 0 }, { enabled: isAdmin });
  const membersQuery = trpc.admin.members.useQuery({ limit: 50, offset: 0 }, { enabled: isAdmin });
  const complaintsQuery = trpc.admin.complaints.useQuery({ status: complaintFilter }, { enabled: isAdmin });
  const utils = trpc.useUtils();

  const updateEvent = trpc.admin.updateEvent.useMutation({
    onSuccess: () => { toast.success("Event updated!"); utils.admin.events.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (loading) return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <Mountain className="w-10 h-10 text-[var(--gold)] animate-bounce" />
    </div>
  );

  if (!isAuthenticated || user?.role !== "admin") return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center glass-card p-12 rounded-3xl max-w-md mx-4">
        <Shield className="w-14 h-14 text-[oklch(0.55_0.22_25)] mx-auto mb-5" />
        <h2 className="font-display text-3xl font-bold text-white mb-3">Access Restricted</h2>
        <p className="text-[oklch(0.62_0.02_240)] mb-8">This area is only accessible to administrators.</p>
        <Link href="/" className="btn-gold px-6 py-3">Return Home</Link>
      </div>
    </div>
  );

  const stats = statsQuery.data;
  const events = (eventsQuery.data ?? []) as Record<string, unknown>[];
  const bookings = (bookingsQuery.data ?? []) as Record<string, unknown>[];
  const members = (membersQuery.data ?? []) as Record<string, unknown>[];
  const complaints = (complaintsQuery.data ?? []) as Record<string, unknown>[];

  const filteredBookings = bookings.filter(b =>
    !search ||
    String(b.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(b.eventTitle ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredMembers = members.filter(m =>
    !search ||
    String(m.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    String(m.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const refreshAll = () => {
    statsQuery.refetch(); eventsQuery.refetch();
    bookingsQuery.refetch(); membersQuery.refetch(); complaintsQuery.refetch();
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {showCreateEvent && <CreateEventModal onClose={() => setShowCreateEvent(false)} />}
      {selectedBooking && <BookingModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
      {selectedComplaint && <RespondModal complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />}
      {editingEvent && <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />}

      {/* Header */}
      <div className="pt-24 pb-6 bg-[oklch(0.09_0.012_240)] border-b border-white/5">
        <div className="container flex items-center justify-between">
          <div>
            <div className="section-label mb-2">Admin Panel</div>
            <h1 className="font-display text-3xl font-bold text-white">Management Dashboard</h1>
            <p className="text-[oklch(0.55_0.02_240)] text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refreshAll} title="Refresh all data"
              className="p-2.5 rounded-xl border border-white/10 text-[oklch(0.55_0.02_240)] hover:text-white hover:border-white/20 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setShowCreateEvent(true)} className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Event
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-[oklch(0.10_0.015_240)] border-b border-white/5">
        <div className="container">
          <div className="flex overflow-x-auto gap-1 py-1">
            {ADMIN_TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all rounded-lg ${
                  activeTab === tab.id
                    ? "text-[var(--gold)] bg-[oklch(0.72_0.18_75/0.1)]"
                    : "text-[oklch(0.55_0.02_240)] hover:text-[oklch(0.85_0.01_240)]"
                }`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-10">

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Total Revenue", value: stats ? fmt(Number(stats.totalRevenue ?? 0)) : "—", icon: DollarSign },
                { label: "Active Members", value: stats ? String(stats.totalUsers ?? 0) : "—", icon: Users },
                { label: "Total Bookings", value: stats ? String(stats.totalBookings ?? 0) : "—", icon: Mountain },
                { label: "Open Complaints", value: stats ? String(stats.openComplaints ?? 0) : "—", icon: AlertCircle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-card p-6 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-[oklch(0.72_0.18_75/0.1)] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[var(--gold)]" />
                  </div>
                  {statsQuery.isLoading
                    ? <div className="h-8 w-24 bg-white/5 rounded animate-pulse mb-1" />
                    : <div className="font-hero text-2xl text-white">{value}</div>
                  }
                  <div className="text-xs text-[oklch(0.55_0.02_240)] mt-1 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
                <h3 className="font-display font-bold text-white mb-5">Revenue Breakdown (6 Months)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={REVENUE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 240)" />
                    <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.02 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "oklch(0.55 0.02 240)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "oklch(0.11 0.015 240)", border: "1px solid oklch(0.22 0.02 240)", borderRadius: "0.75rem", color: "white" }} />
                    <Bar dataKey="bookings" name="Bookings" fill="oklch(0.72 0.18 75)" radius={[4,4,0,0]} />
                    <Bar dataKey="memberships" name="Memberships" fill="oklch(0.62 0.15 160)" radius={[4,4,0,0]} />
                    <Bar dataKey="store" name="Store" fill="oklch(0.55 0.12 220)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-display font-bold text-white mb-5">Member Growth</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={MEMBER_GROWTH}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 240)" />
                    <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.02 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "oklch(0.55 0.02 240)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "oklch(0.11 0.015 240)", border: "1px solid oklch(0.22 0.02 240)", borderRadius: "0.75rem", color: "white" }} />
                    <Line type="monotone" dataKey="members" stroke="oklch(0.72 0.18 75)" strokeWidth={2.5} dot={{ fill: "oklch(0.72 0.18 75)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent bookings preview */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h3 className="font-display font-bold text-white">Recent Bookings</h3>
                <button onClick={() => setActiveTab("bookings")} className="text-xs text-[var(--gold)] hover:underline">View All</button>
              </div>
              {bookingsQuery.isLoading ? (
                <div className="p-6 space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />)}</div>
              ) : bookings.length === 0 ? (
                <div className="p-10 text-center text-[oklch(0.55_0.02_240)]">No bookings yet.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Member","Event","Amount","Status"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[oklch(0.45_0.02_240)] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0,5).map((b, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer" onClick={() => setSelectedBooking(b)}>
                        <td className="px-6 py-4 text-white font-medium">{String(b.userName ?? "—")}</td>
                        <td className="px-6 py-4 text-[oklch(0.75_0.02_240)]">{String(b.eventTitle ?? "—")}</td>
                        <td className="px-6 py-4 text-[var(--gold)] font-semibold">{b.totalAmount ? fmt(Number(b.totalAmount)) : "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`badge-pill text-xs ${b.status === "confirmed" ? "badge-green" : b.status === "cancelled" ? "badge-red" : "badge-gold"}`}>
                            {String(b.status ?? "—")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── EVENTS ───────────────────────────────────────────────────────── */}
        {activeTab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-white">Event Management</h2>
              <button onClick={() => setShowCreateEvent(true)} className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Event
              </button>
            </div>
            {eventsQuery.isLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}</div>
            ) : events.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <Calendar className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
                <p className="text-[oklch(0.55_0.02_240)] mb-4">No events yet. Create your first event to get started.</p>
                <button onClick={() => setShowCreateEvent(true)} className="btn-gold px-6 py-2.5 text-sm flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" /> Create First Event
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Event","Date","Location","Spots","Price","Status","Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[oklch(0.45_0.02_240)] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={String(ev.id)} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{String(ev.title ?? "—")}</div>
                          {Boolean(ev.featured) && <span className="badge-pill badge-gold text-xs mt-1">Featured</span>}
                        </td>
                        <td className="px-5 py-4 text-[oklch(0.75_0.02_240)]">
                          {ev.eventDate ? new Date(String(ev.eventDate)).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-4 text-[oklch(0.75_0.02_240)]">{String(ev.location ?? "—")}</td>
                        <td className="px-5 py-4">
                          <div className="text-white">{String(ev.currentParticipants ?? 0)}/{String(ev.maxParticipants ?? 0)}</div>
                          <div className="w-20 h-1 bg-white/10 rounded-full mt-1">
                            <div className="h-full bg-[var(--gold)] rounded-full"
                              style={{ width: `${Math.min(100, (Number(ev.currentParticipants ?? 0) / Number(ev.maxParticipants ?? 1)) * 100)}%` }} />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[var(--gold)] font-semibold">{ev.price ? fmt(Number(ev.price)) : "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`badge-pill text-xs ${ev.status === "published" ? "badge-green" : ev.status === "cancelled" ? "badge-red" : "badge-gold"}`}>
                            {String(ev.status ?? "draft")}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditingEvent(ev)}
                              className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[oklch(0.55_0.02_240)] hover:text-[var(--gold)] transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            {ev.status !== "cancelled" && (
                              <button
                                onClick={() => { if (confirm(`Cancel "${ev.title}"?`)) updateEvent.mutate({ id: Number(ev.id), status: "cancelled" }); }}
                                className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[oklch(0.55_0.02_240)] hover:text-red-400 transition-colors" title="Cancel event">
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                            {ev.status === "draft" && (
                              <button
                                onClick={() => updateEvent.mutate({ id: Number(ev.id), status: "published" })}
                                className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[oklch(0.55_0.02_240)] hover:text-green-400 transition-colors" title="Publish event">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS ─────────────────────────────────────────────────────── */}
        {activeTab === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <h2 className="font-display text-2xl font-bold text-white">Booking Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.45_0.02_240)]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or event..."
                  className="pl-9 pr-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors w-64" />
              </div>
            </div>
            {bookingsQuery.isLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}</div>
            ) : filteredBookings.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <Mountain className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
                <p className="text-[oklch(0.55_0.02_240)]">{search ? "No bookings match your search." : "No bookings yet."}</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Member","Event","Date","Amount","Guests","Status","Details"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[oklch(0.45_0.02_240)] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={String(b.id)} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{String(b.userName ?? "—")}</div>
                          <div className="text-xs text-[oklch(0.45_0.02_240)]">{String(b.userEmail ?? "")}</div>
                        </td>
                        <td className="px-5 py-4 text-[oklch(0.75_0.02_240)]">{String(b.eventTitle ?? "—")}</td>
                        <td className="px-5 py-4 text-[oklch(0.75_0.02_240)]">
                          {b.createdAt ? new Date(String(b.createdAt)).toLocaleDateString("en-NG") : "—"}
                        </td>
                        <td className="px-5 py-4 text-[var(--gold)] font-semibold">{b.totalAmount ? fmt(Number(b.totalAmount)) : "—"}</td>
                        <td className="px-5 py-4 text-[oklch(0.75_0.02_240)]">{String(b.guestCount ?? 1)}</td>
                        <td className="px-5 py-4">
                          <span className={`badge-pill text-xs ${b.status === "confirmed" ? "badge-green" : b.status === "cancelled" ? "badge-red" : "badge-gold"}`}>
                            {String(b.status ?? "—")}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[oklch(0.55_0.02_240)] hover:text-white transition-colors" title="View booking details">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERS ──────────────────────────────────────────────────────── */}
        {activeTab === "members" && (
          <div>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <h2 className="font-display text-2xl font-bold text-white">Member Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.45_0.02_240)]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..."
                  className="pl-9 pr-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors w-64" />
              </div>
            </div>
            {membersQuery.isLoading ? (
              <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}</div>
            ) : filteredMembers.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <Users className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
                <p className="text-[oklch(0.55_0.02_240)]">{search ? "No members match your search." : "No members yet."}</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Member","Email","Membership","Hikes","Joined","Role"].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[oklch(0.45_0.02_240)] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={String(m.id)} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[oklch(0.72_0.18_75/0.2)] flex items-center justify-center text-[var(--gold)] font-bold text-sm">
                              {String(m.name ?? "?")[0]?.toUpperCase()}
                            </div>
                            <span className="font-semibold text-white">{String(m.name ?? "—")}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[oklch(0.75_0.02_240)]">{String(m.email ?? "—")}</td>
                        <td className="px-5 py-4">
                          <span className={`badge-pill text-xs flex items-center gap-1 w-fit ${m.membershipType === "vip" ? "badge-gold" : m.membershipType === "regular" ? "badge-green" : ""}`}>
                            {m.membershipType === "vip" && <Crown className="w-3 h-3" />}
                            <span>{String(m.membershipType ?? "free")}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[oklch(0.75_0.02_240)]">{String(m.totalHikes ?? 0)}</td>
                        <td className="px-5 py-4 text-[oklch(0.75_0.02_240)]">
                          {m.createdAt ? new Date(String(m.createdAt)).toLocaleDateString("en-NG", { month:"short", year:"numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`badge-pill text-xs flex items-center gap-1 w-fit ${m.role === "admin" ? "badge-red" : ""}`}>
                            {m.role === "admin" && <Shield className="w-3 h-3" />}
                            <span>{String(m.role ?? "user")}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── COMPLAINTS ───────────────────────────────────────────────────── */}
        {activeTab === "complaints" && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="font-display text-2xl font-bold text-white">Complaints & Support</h2>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "All", value: undefined },
                  { label: "Open", value: "open" },
                  { label: "In Review", value: "in_review" },
                  { label: "Resolved", value: "resolved" },
                ].map(({ label, value }) => (
                  <button key={label} onClick={() => setComplaintFilter(value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                      complaintFilter === value
                        ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]"
                        : "bg-[var(--muted)] text-[oklch(0.62_0.02_240)] hover:text-white"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {complaintsQuery.isLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>
            ) : complaints.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-[oklch(0.55_0.02_240)]">No complaints found. All clear!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((c) => (
                  <div key={String(c.id)} className="glass-card rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          c.priority === "high" ? "bg-[oklch(0.55_0.22_25/0.15)]" :
                          c.priority === "medium" ? "bg-[oklch(0.72_0.18_75/0.1)]" : "bg-[var(--muted)]"
                        }`}>
                          <AlertCircle className={`w-5 h-5 ${
                            c.priority === "high" ? "text-[oklch(0.75_0.18_25)]" :
                            c.priority === "medium" ? "text-[var(--gold)]" : "text-[oklch(0.55_0.02_240)]"
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`badge-pill text-xs ${c.priority === "high" ? "badge-red" : c.priority === "medium" ? "badge-gold" : ""}`}>
                              {String(c.priority ?? "low")} priority
                            </span>
                            <span className={`badge-pill text-xs ${c.status === "resolved" ? "badge-green" : c.status === "in_review" ? "badge-gold" : "badge-red"}`}>
                              {String(c.status ?? "open")}
                            </span>
                          </div>
                          <h4 className="font-semibold text-white">{String(c.subject ?? "—")}</h4>
                          {c.description != null && (
                            <p className="text-sm text-[oklch(0.62_0.02_240)] mt-1 line-clamp-2">{String(c.description)}</p>
                          )}
                          <div className="text-xs text-[oklch(0.45_0.02_240)] mt-2">
                            {c.createdAt ? new Date(String(c.createdAt)).toLocaleDateString("en-NG") : "—"}
                          </div>
                          {c.adminNotes != null && (
                            <div className="mt-2 text-xs text-[oklch(0.62_0.02_240)] bg-white/5 rounded-lg p-2">
                              <span className="font-semibold text-[var(--gold)]">Admin note: </span><span>{String(c.adminNotes)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {c.status !== "resolved" && c.status !== "closed" ? (
                          <>
                            <button onClick={() => setSelectedComplaint(c)}
                              className="btn-outline-gold text-xs py-2 px-3 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" /> Respond
                            </button>
                            <button onClick={() => setSelectedComplaint(c)}
                              className="btn-gold text-xs py-2 px-3 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Resolve
                            </button>
                          </>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold px-3 py-2">
                            <CheckCircle className="w-3.5 h-3.5" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MEDIA ────────────────────────────────────────────────────────────────── */}
        {activeTab === "media" && <MediaTab />}

        {/* ── PLACES ───────────────────────────────────────────────────────────────── */}
        {activeTab === "places" && <PlacesTab />}

        {/* ── STORE ────────────────────────────────────────────────────────────────── */}
        {activeTab === "store" && <StoreTab />}

      </div>
    </div>
  );
}

// ── Media Management Tab ──────────────────────────────────────────────────────────────────
function MediaTab() {
  const utils = trpc.useUtils();
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<"all" | "photo" | "video" | "reel">("all");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: mediaList, isLoading } = trpc.media.list.useQuery({ type: filter, limit: 200 });

  const deleteMedia = trpc.media.delete.useMutation({
    onSuccess: () => { toast.success("Media deleted"); utils.media.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleFeatured = trpc.media.toggleFeatured.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.media.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Media Library</h2>
          <p className="text-sm text-[oklch(0.55_0.02_240)] mt-1">Upload and manage photos, videos, and reels for the Gallery page</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm">
          <Upload className="w-4 h-4" /> Upload Media
        </button>
      </div>

      <div className="flex gap-2">
        {(["all", "photo", "video", "reel"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === f ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "glass text-[oklch(0.62_0.02_240)] hover:text-white"
            }`}>
            {f === "all" ? "All Media" : f === "photo" ? "Photos" : f === "video" ? "Videos" : "Reels"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
        </div>
      ) : !mediaList || mediaList.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border border-white/5">
          <Image className="w-12 h-12 text-[oklch(0.45_0.02_240)] mx-auto mb-4" />
          <p className="text-[oklch(0.62_0.02_240)] font-semibold">No media uploaded yet</p>
          <p className="text-sm text-[oklch(0.45_0.02_240)] mt-1">Click “Upload Media” to add your first photo or video</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mediaList.map((item) => (
            <div key={item.id} className="group relative glass rounded-xl overflow-hidden border border-white/5 hover:border-[oklch(0.72_0.18_75/0.3)] transition-all">
              <div className="aspect-square bg-[oklch(0.12_0.015_240)] cursor-pointer" onClick={() => setPreviewUrl(item.url)}>
                {item.type === "photo" ? (
                  <img src={item.url} alt={item.title ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Video className="w-8 h-8 text-[var(--gold)]" />
                    <span className="text-xs text-[oklch(0.62_0.02_240)] uppercase tracking-wider">{item.type}</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => toggleFeatured.mutate({ id: item.id, featured: !item.featured })}
                  className={`p-2 rounded-lg transition-colors ${
                    item.featured ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "bg-white/10 text-white hover:bg-[var(--gold)] hover:text-[oklch(0.08_0.01_240)]"
                  }`}
                  title={item.featured ? "Remove from featured" : "Mark as featured"}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm("Delete this media item?")) deleteMedia.mutate({ id: item.id }); }}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-white truncate">{item.title ?? "Untitled"}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[0.65rem] text-[oklch(0.45_0.02_240)] uppercase tracking-wider">{item.category}</span>
                  {item.featured && <span className="text-[0.65rem] text-[var(--gold)] font-bold">★ Featured</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && <UploadMediaModal onClose={() => setShowUpload(false)} />}

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setPreviewUrl(null)}>
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Upload Media Modal ──────────────────────────────────────────────────────────────────
function UploadMediaModal({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [form, setForm] = useState({
    title: "",
    type: "photo" as "photo" | "video" | "reel",
    category: "general",
    caption: "",
    featured: false,
    url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = trpc.media.upload.useMutation({
    onSuccess: () => { toast.success("Media uploaded!"); utils.media.list.invalidate(); onClose(); },
    onError: (e) => { toast.error(e.message); setUploading(false); },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
    if (f.type.startsWith("video/")) setForm((p) => ({ ...p, type: "video" }));
    else setForm((p) => ({ ...p, type: "photo" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    if (uploadMode === "file" && file && preview) {
      upload.mutate({ title: form.title || file.name, type: form.type, category: form.category, caption: form.caption, featured: form.featured, base64Data: preview, mimeType: file.type, fileName: file.name });
    } else if (uploadMode === "url" && form.url) {
      upload.mutate({ title: form.title, type: form.type, category: form.category, caption: form.caption, featured: form.featured, url: form.url });
    } else {
      toast.error("Please select a file or enter a URL");
      setUploading(false);
    }
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[oklch(0.11_0.015_240)] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-white">Upload Media</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2 p-1 bg-[var(--muted)] rounded-xl">
            <button type="button" onClick={() => setUploadMode("file")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                uploadMode === "file" ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "text-[oklch(0.62_0.02_240)]"
              }`}>
              <Upload className="w-3.5 h-3.5" /> Upload File
            </button>
            <button type="button" onClick={() => setUploadMode("url")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                uploadMode === "url" ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "text-[oklch(0.62_0.02_240)]"
              }`}>
              <LinkIcon className="w-3.5 h-3.5" /> Paste URL
            </button>
          </div>

          {uploadMode === "file" ? (
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Select Photo or Video</label>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--gold)] transition-colors bg-[var(--muted)] relative overflow-hidden">
                {preview && <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-[oklch(0.55_0.02_240)]" />
                  <span className="text-xs text-[oklch(0.55_0.02_240)]">{file ? file.name : "Click to browse or drag & drop"}</span>
                  <span className="text-[0.65rem] text-[oklch(0.45_0.02_240)]">JPG, PNG, GIF, MP4, WebM</span>
                </div>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Image or YouTube URL</label>
              <input value={form.url} onChange={(e) => set("url", e.target.value)}
                placeholder="https://... or https://youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Waterfall Hike 2025"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm">
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="reel">Reel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm">
                <option value="general">General</option>
                <option value="waterfall">Waterfall</option>
                <option value="sunrise">Sunrise / Night Glow</option>
                <option value="cultural">Cultural</option>
                <option value="camping">Camping</option>
                <option value="team">Team Building</option>
                <option value="members">Members</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Caption (optional)</label>
            <textarea value={form.caption} onChange={(e) => set("caption", e.target.value)} rows={2}
              placeholder="Short description..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm resize-none" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set("featured", !form.featured)}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.featured ? "bg-[var(--gold)]" : "bg-[var(--muted)]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-[oklch(0.75_0.01_240)]">Mark as Featured (shows prominently in Gallery)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline-gold py-3 text-sm">Cancel</button>
            <button type="submit" disabled={uploading} className="flex-1 btn-gold py-3 text-sm flex items-center justify-center gap-2">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Places Management Tab ─────────────────────────────────────────────────────
function PlacesTab() {
  const utils = trpc.useUtils();
  const emptyPlaceForm = {
    name: "", slug: "", description: "", category: "nature",
    imageUrl: "", entryFee: "", openingHours: "", highlights: "", featured: false,
  };
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyPlaceForm);

  const { data: cities = [] } = trpc.cities.list.useQuery();
  const { data: places = [], isLoading } = trpc.cities.places.useQuery(
    { cityId: selectedCityId ?? 0 },
    { enabled: !!selectedCityId }
  );

  const createPlace = trpc.cities.createPlace.useMutation({
    onSuccess: () => {
      toast.success("Place added successfully");
      utils.cities.places.invalidate();
      utils.cities.bySlug.invalidate();
      setShowAdd(false);
      setEditingPlaceId(null);
      setForm(emptyPlaceForm);
    },
    onError: (err) => toast.error(err.message),
  });

  const updatePlace = trpc.cities.updatePlace.useMutation({
    onSuccess: () => {
      toast.success("Place updated successfully");
      utils.cities.places.invalidate();
      utils.cities.bySlug.invalidate();
      setShowAdd(false);
      setEditingPlaceId(null);
      setForm(emptyPlaceForm);
    },
    onError: (err) => toast.error(err.message),
  });
  const deletePlace = trpc.cities.deletePlace.useMutation({
    onSuccess: () => {
      toast.success("Place removed");
      utils.cities.places.invalidate();
      utils.cities.bySlug.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleFeatured = trpc.cities.updatePlace.useMutation({
    onSuccess: () => {
      toast.success("Updated");
      utils.cities.places.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const openAdd = () => {
    setEditingPlaceId(null);
    setForm(emptyPlaceForm);
    setShowAdd(true);
  };

  const openEdit = (place: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    imageUrl: string | null;
    entryFee: string | null;
    openingHours: string | null;
    highlights: string | null;
    featured: boolean | null;
  }) => {
    let highlights = "";
    try { highlights = place.highlights ? JSON.parse(place.highlights).join(", ") : ""; } catch { highlights = place.highlights ?? ""; }
    setEditingPlaceId(place.id);
    setForm({
      name: place.name,
      slug: place.slug,
      description: place.description ?? "",
      category: place.category,
      imageUrl: place.imageUrl ?? "",
      entryFee: place.entryFee ?? "",
      openingHours: place.openingHours ?? "",
      highlights,
      featured: Boolean(place.featured),
    });
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!form.name || !form.slug || !form.description) return toast.error("Name, slug, and description are required");
    const highlights = form.highlights ? form.highlights.split(",").map(h => h.trim()).filter(Boolean) : [];
    if (editingPlaceId !== null) {
      updatePlace.mutate({
        id: editingPlaceId,
        name: form.name,
        slug: form.slug,
        description: form.description,
        category: form.category,
        imageUrl: form.imageUrl || undefined,
        entryFee: form.entryFee ? Number(form.entryFee) : 0,
        openingHours: form.openingHours || undefined,
        highlights,
        featured: form.featured,
      });
      return;
    }
    if (!selectedCityId) return toast.error("Select a city first");
    createPlace.mutate({
      cityId: selectedCityId,
      name: form.name,
      slug: form.slug,
      description: form.description,
      category: form.category,
      imageUrl: form.imageUrl || undefined,
      entryFee: form.entryFee ? Number(form.entryFee) : 0,
      openingHours: form.openingHours || undefined,
      highlights,
      featured: form.featured,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Top Places Management</h2>
          <p className="text-white/50 text-sm mt-1">Add, edit, or remove top destinations per city</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[var(--gold)] text-black px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Place
        </button>
      </div>

      {/* City Selector */}
      <div className="mb-6">
        <label className="text-white/70 text-sm mb-2 block">Select City</label>
        <select
          value={selectedCityId ?? ""}
          onChange={e => setSelectedCityId(Number(e.target.value) || null)}
          className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 w-full max-w-xs focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="">-- Choose a city --</option>
          {cities.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
          ))}
        </select>
      </div>

      {/* Places Grid */}
      {!selectedCityId ? (
        <div className="text-center py-16 text-white/40">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Select a city above to manage its top places</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No places added for this city yet. Click "Add Place" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map(place => (
            <div key={place.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {place.imageUrl && (
                <div className="relative h-36 overflow-hidden">
                  <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                  {place.featured && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{place.name}</h3>
                    <span className="text-white/40 text-xs capitalize">{place.category}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(place)}
                      className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleFeatured.mutate({ id: place.id, featured: !place.featured })}
                      className={`p-1.5 rounded-lg transition-colors ${place.featured ? "bg-amber-400/20 text-amber-400" : "bg-white/5 text-white/40 hover:text-amber-400"}`}
                      title={place.featured ? "Unfeature" : "Feature"}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Remove "${place.name}"?`)) deletePlace.mutate({ id: place.id }); }}
                      className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-white/50 text-xs line-clamp-2">{place.description}</p>
                {place.openingHours && <p className="text-white/30 text-xs mt-1">🕐 {place.openingHours}</p>}
                {place.entryFee && Number(place.entryFee) > 0
                  ? <p className="text-amber-400 text-xs mt-1">₦{Number(place.entryFee).toLocaleString()} entry</p>
                  : <p className="text-green-400 text-xs mt-1">Free Entry</p>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Place Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingPlaceId !== null ? "Edit Top Place" : "Add Top Place"}</h3>
              <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Place Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold)]" placeholder="e.g. Yankari Game Reserve" />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Slug *</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold)]" placeholder="yankari-game-reserve" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold)] resize-none" placeholder="Describe this place..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold)]">
                    {["nature","wildlife","mountain","lake","beach","historical","cultural","resort","adventure","other"].map(c => (
                      <option key={c} value={c} className="bg-[#111]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Entry Fee (₦)</label>
                  <input type="number" value={form.entryFee} onChange={e => setForm(f => ({ ...f, entryFee: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold)]" placeholder="0 = Free" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Image URL</label>
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold)]" placeholder="https://..." />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Opening Hours</label>
                <input value={form.openingHours} onChange={e => setForm(f => ({ ...f, openingHours: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold)]" placeholder="e.g. Daily 7am-6pm" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">Highlights (comma-separated)</label>
                <input value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--gold)]" placeholder="Wildlife, Safari, Photography" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-amber-400" />
                <span className="text-white/70 text-sm">Mark as Featured</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-white/10 text-white/70 py-2 rounded-xl text-sm hover:border-white/30 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={createPlace.isPending || updatePlace.isPending}
                className="flex-1 bg-[var(--gold)] text-black py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {createPlace.isPending || updatePlace.isPending ? "Saving..." : editingPlaceId !== null ? "Save Changes" : "Add Place"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Store Management Tab ──────────────────────────────────────────────────────
type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  price: string;
  stock: number;
  imageUrl: string | null;
  featured: boolean;
  sizes: string[] | null;
  colors: string[] | null;
};

type OrderRow = {
  id: number;
  orderRef: string;
  userId: number;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  deliveryAddress: string;
  createdAt: Date | string | null;
};

const PRODUCT_CATEGORIES = ["apparel", "accessories", "gear", "drinkware"] as const;
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

function ProductFormModal({
  product,
  onClose,
}: {
  product?: ProductRow;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: (product?.category ?? "apparel") as typeof PRODUCT_CATEGORIES[number],
    price: product?.price ?? "",
    stock: product?.stock ?? 0,
    imageUrl: product?.imageUrl ?? "",
    sizes: (product?.sizes ?? []).join(", "),
    colors: (product?.colors ?? []).join(", "),
    featured: product?.featured ?? false,
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const createProduct = trpc.store.adminCreateProduct.useMutation({
    onSuccess: () => { toast.success("Product created!"); utils.store.list.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  const updateProduct = trpc.store.adminUpdateProduct.useMutation({
    onSuccess: () => { toast.success("Product updated!"); utils.store.list.invalidate(); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || undefined,
      category: form.category,
      price: form.price,
      stock: form.stock,
      imageUrl: form.imageUrl || undefined,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(",").map((c) => c.trim()).filter(Boolean) : [],
      featured: form.featured,
    };
    if (isEdit) {
      updateProduct.mutate({ id: product!.id, ...payload });
    } else {
      createProduct.mutate(payload);
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[oklch(0.11_0.015_240)] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-white">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Product Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Hike Kings Cap"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm">
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#111] capitalize">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Price (₦) *</label>
              <input required value={form.price} onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Stock Quantity</label>
            <input type="number" min={0} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Image URL</label>
            <input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Product description..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Sizes (comma-separated)</label>
              <input value={form.sizes} onChange={(e) => set("sizes", e.target.value)}
                placeholder="S, M, L, XL, XXL"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[oklch(0.62_0.02_240)] uppercase tracking-wider mb-1.5">Colors (comma-separated)</label>
              <input value={form.colors} onChange={(e) => set("colors", e.target.value)}
                placeholder="Black, White, Gold"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="prod-featured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-[var(--gold)]" />
            <label htmlFor="prod-featured" className="text-sm text-[oklch(0.75_0.02_240)] cursor-pointer">Feature this product (shown prominently in store)</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-[oklch(0.62_0.02_240)] hover:text-white transition-colors text-sm font-semibold">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StoreTab() {
  const utils = trpc.useUtils();
  const [subTab, setSubTab] = useState<"products" | "orders">("products");
  const [search, setSearch] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  const { data: products = [], isLoading: productsLoading } = trpc.store.list.useQuery();
  const { data: orders = [], isLoading: ordersLoading } = trpc.store.adminOrders.useQuery();

  const deleteProduct = trpc.store.adminDeleteProduct.useMutation({
    onSuccess: () => { toast.success("Product deleted"); utils.store.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleFeatured = trpc.store.adminToggleFeatured.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.store.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const updateOrderStatus = trpc.store.adminUpdateOrderStatus.useMutation({
    onSuccess: () => { toast.success("Order status updated"); utils.store.adminOrders.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const filteredProducts = (products as ProductRow[]).filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = (orders as OrderRow[]).filter((o) =>
    !search || o.orderRef.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === "delivered") return "badge-green";
    if (s === "cancelled") return "badge-red";
    if (s === "shipped") return "text-blue-400 bg-blue-400/10";
    return "badge-gold";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Store Management</h2>
          <p className="text-sm text-[oklch(0.55_0.02_240)] mt-1">
            {(products as ProductRow[]).length} products · {(orders as OrderRow[]).length} orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.45_0.02_240)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={subTab === "products" ? "Search products..." : "Search orders..."}
              className="pl-9 pr-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors w-56" />
          </div>
          {subTab === "products" && (
            <button onClick={() => setShowAddProduct(true)} className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        {(["products", "orders"] as const).map((t) => (
          <button key={t} onClick={() => { setSubTab(t); setSearch(""); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              subTab === t ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "glass text-[oklch(0.62_0.02_240)] hover:text-white"
            }`}>
            {t === "products" ? <Package className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            {t === "products" ? "Products" : "Orders"}
          </button>
        ))}
      </div>

      {/* ── Products sub-tab ── */}
      {subTab === "products" && (
        <>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <ShoppingBag className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
              <p className="text-[oklch(0.55_0.02_240)] mb-4">
                {search ? "No products match your search." : "No products yet. Add your first product to the store."}
              </p>
              {!search && (
                <button onClick={() => setShowAddProduct(true)} className="btn-gold px-6 py-2.5 text-sm flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" /> Add First Product
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-[oklch(0.72_0.18_75/0.3)] transition-all group">
                  {/* Image */}
                  <div className="relative h-44 bg-[oklch(0.12_0.015_240)] overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-[oklch(0.35_0.02_240)]" />
                      </div>
                    )}
                    {p.featured && (
                      <span className="absolute top-2 left-2 bg-[var(--gold)] text-black text-xs font-bold px-2 py-0.5 rounded-full">★ Featured</span>
                    )}
                    <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full capitalize">{p.category}</span>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-sm truncate mb-1">{p.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[var(--gold)] font-bold">₦{Number(p.price).toLocaleString("en-NG")}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 0 ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                        {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFeatured.mutate({ id: p.id, featured: !p.featured })}
                        className={`p-2 rounded-lg transition-colors flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold ${
                          p.featured ? "bg-[oklch(0.72_0.18_75/0.15)] text-[var(--gold)]" : "bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-[var(--gold)]"
                        }`} title={p.featured ? "Unfeature" : "Feature"}>
                        {p.featured ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {p.featured ? "Featured" : "Feature"}
                      </button>
                      <button onClick={() => setEditingProduct(p)}
                        className="p-2 rounded-lg bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-white hover:bg-white/10 transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm(`Delete "${p.name}"? This cannot be undone.`)) deleteProduct.mutate({ id: p.id }); }}
                        className="p-2 rounded-lg bg-white/5 text-[oklch(0.55_0.02_240)] hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Orders sub-tab ── */}
      {subTab === "orders" && (
        <>
          {ordersLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <Truck className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
              <p className="text-[oklch(0.55_0.02_240)]">{search ? "No orders match your search." : "No orders placed yet."}</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Order Ref", "Date", "Amount", "Payment", "Status", "Delivery Address", "Update Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[oklch(0.45_0.02_240)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.orderRef} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-[var(--gold)] font-semibold text-xs">{o.orderRef}</span>
                      </td>
                      <td className="px-5 py-4 text-[oklch(0.75_0.02_240)] text-xs">
                        {o.createdAt ? new Date(String(o.createdAt)).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-5 py-4 text-[var(--gold)] font-semibold">
                        ₦{Number(o.totalAmount).toLocaleString("en-NG")}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge-pill text-xs ${o.paymentStatus === "paid" ? "badge-green" : "badge-red"}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge-pill text-xs ${statusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[oklch(0.62_0.02_240)] text-xs max-w-[160px] truncate" title={o.deliveryAddress}>
                        {o.deliveryAddress}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus.mutate({ orderRef: o.orderRef, status: e.target.value as typeof ORDER_STATUSES[number] })}
                          className="px-3 py-1.5 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-white text-xs focus:outline-none focus:border-[var(--gold)] transition-colors">
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-[#111] capitalize">{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showAddProduct && <ProductFormModal onClose={() => setShowAddProduct(false)} />}
      {editingProduct && <ProductFormModal product={editingProduct} onClose={() => setEditingProduct(null)} />}
    </div>
  );
}
