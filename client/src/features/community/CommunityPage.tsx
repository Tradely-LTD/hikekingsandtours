import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import {
  MessageSquare, Trophy, Search, Send, Plus, X,
  MapPin, Clock, CheckCircle2, AlertCircle, Flame
} from "lucide-react";

const TABS = [
  { id: "chat", label: "Community Chat", icon: MessageSquare },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "lostfound", label: "Lost & Found", icon: Search },
];

export default function CommunityPage() {
  const { isAuthenticated, user } = useAuth();

  // ── Chat ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const channel = "general";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesRaw, refetch: refetchMessages } = trpc.community.messages.useQuery(
    { channel, limit: 60 },
    { refetchInterval: 5000 }
  );
  const messages = messagesRaw ? [...messagesRaw].reverse() : [];

  const sendMessage = trpc.community.sendMessage.useMutation({
    onSuccess: () => { setMessage(""); refetchMessages(); },
    onError: (err) => toast.error(err.message),
  });

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    sendMessage.mutate({ channel, message: text });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Leaderboard ─────────────────────────────────────────────────────────────
  const { data: leaderboardData } = trpc.community.leaderboard.useQuery({ limit: 10 });

  // ── Lost & Found ─────────────────────────────────────────────────────────────
  const [lostFoundFilter, setLostFoundFilter] = useState<"all" | "lost" | "found">("all");
  const [showReportForm, setShowReportForm] = useState(false);
  const [lfForm, setLfForm] = useState({
    type: "lost" as "lost" | "found",
    title: "", description: "", location: "", contactInfo: "",
  });

  const { data: lostFoundItems, refetch: refetchLF } = trpc.community.lostFound.list.useQuery(
    { type: lostFoundFilter }
  );

  const createLFItem = trpc.community.lostFound.create.useMutation({
    onSuccess: () => {
      toast.success("Item reported successfully!");
      setShowReportForm(false);
      setLfForm({ type: "lost", title: "", description: "", location: "", contactInfo: "" });
      refetchLF();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleLFSubmit = () => {
    if (!lfForm.title.trim()) { toast.error("Please enter a title"); return; }
    createLFItem.mutate(lfForm);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-10 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="section-label mb-4">Connect & Engage</div>
          <h1 className="font-hero text-4xl md:text-5xl text-white mb-3">Community Hub</h1>
          <p className="text-[oklch(0.62_0.02_240)]">Connect with fellow hikers, celebrate achievements, and help each other out.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-[oklch(0.10_0.015_240)] border-b border-white/5">
        <div className="container">
          <div className="flex gap-1 py-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all rounded-lg ${
                  activeTab === tab.id
                    ? "text-[var(--gold)] bg-[oklch(0.72_0.18_75/0.1)]"
                    : "text-[oklch(0.55_0.02_240)] hover:text-[oklch(0.85_0.01_240)]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-10">

        {/* ── CHAT ──────────────────────────────────────────────────────────── */}
        {activeTab === "chat" && (
          <div className="max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col" style={{ height: "70vh" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[var(--gold)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">General Chat</h3>
                    <p className="text-xs text-[oklch(0.55_0.02_240)]">{messages.length} messages</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-[oklch(0.55_0.02_240)]">Live</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-12 h-12 text-[oklch(0.35_0.02_240)] mb-3" />
                    <p className="text-[oklch(0.55_0.02_240)] text-sm">No messages yet. Be the first to say something!</p>
                  </div>
                )}
                {messages.map((m) => {
                  const authUser = user as { id?: number } | null;
                  const isOwn = authUser && m.user?.id === authUser.id;
                  const displayName = m.user?.name ?? "Hiker";
                  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                  const membershipType = m.user?.membershipType;
                  const msgTime = new Date(m.message.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <div key={m.message.id} className={`flex items-start gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                        membershipType === "vip" ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "bg-[var(--stone)] text-white"
                      }`}>
                        {initials}
                      </div>
                      <div className={`max-w-[70%] flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[oklch(0.72_0.02_240)]">{displayName}</span>
                          {membershipType === "vip" && <span className="badge-pill badge-gold text-[0.6rem]">VIP</span>}
                          {membershipType === "regular" && <span className="badge-pill badge-green text-[0.6rem]">Member</span>}
                          <span className="text-[0.6rem] text-[oklch(0.45_0.02_240)]">{msgTime}</span>
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)] rounded-tr-sm"
                            : "bg-[var(--stone)] text-[oklch(0.85_0.01_240)] rounded-tl-sm"
                        }`}>
                          {m.message.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[var(--border)] shrink-0">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share something with the community..."
                      className="flex-1 px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || sendMessage.isPending}
                      className="btn-gold py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <a href={getLoginUrl()} className="text-sm text-[var(--gold)] hover:underline">Sign in to join the conversation</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── LEADERBOARD ───────────────────────────────────────────────────── */}
        {activeTab === "leaderboard" && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-hero text-2xl text-white">Top Hikers</h2>
              <span className="text-xs text-[oklch(0.55_0.02_240)]">All Time Rankings</span>
            </div>

            {leaderboardData && leaderboardData.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[leaderboardData[1], leaderboardData[0], leaderboardData[2]].map((entry, i) => {
                  const displayName = entry?.name ?? "Hiker";
                  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={i} className={`text-center glass-card rounded-2xl p-5 ${i === 1 ? "border-[oklch(0.72_0.18_75/0.4)] -mt-4" : ""}`}>
                      <div className={`text-2xl mb-2 ${i === 1 ? "text-3xl" : ""}`}>{["🥈", "🥇", "🥉"][i]}</div>
                      <div className={`rounded-full mx-auto mb-2 border-2 flex items-center justify-center font-bold text-sm bg-[var(--stone)] text-white ${i === 1 ? "w-14 h-14 border-[var(--gold)]" : "w-11 h-11 border-[var(--border)]"}`}>
                        {initials}
                      </div>
                      <div className="font-semibold text-white text-xs truncate">{displayName.split(" ")[0]}</div>
                      <div className="font-hero text-lg text-[var(--gold)]">{Number(entry?.totalHikes ?? 0) * 100}</div>
                      <div className="text-[0.6rem] text-[oklch(0.45_0.02_240)]">points</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="glass-card rounded-2xl overflow-hidden">
              {!leaderboardData || leaderboardData.length === 0 ? (
                <div className="p-10 text-center">
                  <Trophy className="w-10 h-10 text-[oklch(0.35_0.02_240)] mx-auto mb-3" />
                  <p className="text-[oklch(0.55_0.02_240)] text-sm">No rankings yet. Complete a hike to appear here!</p>
                </div>
              ) : (
                leaderboardData.map((entry, i) => {
                  const displayName = entry?.name ?? "Hiker";
                  const initials = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                  const rank = i + 1;
                  return (
                    <div key={entry.id} className={`flex items-center gap-4 px-5 py-4 ${i < leaderboardData.length - 1 ? "border-b border-[var(--border)]" : ""} ${rank <= 3 ? "bg-[oklch(0.72_0.18_75/0.04)]" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${rank <= 3 ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "bg-[var(--stone)] text-[oklch(0.62_0.02_240)]"}`}>
                        {rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-[var(--stone)] flex items-center justify-center font-bold text-sm text-white shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm truncate">{displayName}</span>
                          {entry.membershipType === "vip" && <span className="badge-pill badge-gold text-xs">VIP</span>}
                          {entry.membershipType === "regular" && <span className="badge-pill badge-green text-xs">Member</span>}
                        </div>
                        <div className="text-xs text-[oklch(0.55_0.02_240)] mt-0.5 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {entry.totalHikes ?? 0} hikes completed
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-hero text-lg text-[var(--gold)]">{Number(entry.totalHikes ?? 0) * 100}</div>
                        <div className="text-[0.6rem] text-[oklch(0.45_0.02_240)]">pts</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── LOST & FOUND ──────────────────────────────────────────────────── */}
        {activeTab === "lostfound" && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-hero text-2xl text-white">Lost & Found</h2>
              {isAuthenticated && (
                <button onClick={() => setShowReportForm(!showReportForm)} className="btn-gold flex items-center gap-2 py-2.5 px-4 text-sm">
                  <Plus className="w-4 h-4" /> Report Item
                </button>
              )}
            </div>

            {showReportForm && (
              <div className="glass-card rounded-2xl p-6 mb-6 border border-[var(--gold)]/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Report an Item</h3>
                  <button onClick={() => setShowReportForm(false)} className="text-[oklch(0.55_0.02_240)] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    {(["lost", "found"] as const).map((t) => (
                      <button key={t} onClick={() => setLfForm((p) => ({ ...p, type: t }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${lfForm.type === t ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "bg-[var(--muted)] text-[oklch(0.62_0.02_240)] hover:text-white"}`}>
                        I {t} something
                      </button>
                    ))}
                  </div>
                  <input value={lfForm.title} onChange={(e) => setLfForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Item name (e.g. Blue water bottle)"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors" />
                  <textarea value={lfForm.description} onChange={(e) => setLfForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Description (colour, brand, any identifying features...)" rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors resize-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={lfForm.location} onChange={(e) => setLfForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Location (e.g. Gurara Falls)"
                      className="px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors" />
                    <input value={lfForm.contactInfo} onChange={(e) => setLfForm((p) => ({ ...p, contactInfo: e.target.value }))}
                      placeholder="Contact (email or phone)"
                      className="px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowReportForm(false)} className="btn-outline-gold flex-1 py-3">Cancel</button>
                    <button onClick={handleLFSubmit} disabled={createLFItem.isPending} className="btn-gold flex-1 py-3 disabled:opacity-50">
                      {createLFItem.isPending ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-6">
              {(["all", "lost", "found"] as const).map((f) => (
                <button key={f} onClick={() => setLostFoundFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${lostFoundFilter === f ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "bg-[var(--muted)] text-[oklch(0.62_0.02_240)] hover:text-white"}`}>
                  {f === "all" ? "All Items" : `${f} Items`}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {!lostFoundItems || lostFoundItems.length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center">
                  <Search className="w-10 h-10 text-[oklch(0.35_0.02_240)] mx-auto mb-3" />
                  <p className="text-[oklch(0.55_0.02_240)] text-sm">No items reported yet.</p>
                  {isAuthenticated && (
                    <button onClick={() => setShowReportForm(true)} className="btn-gold mt-4 px-5 py-2.5 text-sm">Report an Item</button>
                  )}
                </div>
              ) : (
                lostFoundItems.map((item) => (
                  <div key={item.id} className="glass-card rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === "lost" ? "bg-red-500/20" : "bg-green-500/20"}`}>
                        {item.type === "lost" ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-green-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${item.type === "lost" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>{item.type}</span>
                          {item.status === "resolved" && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[oklch(0.55_0.02_240)] font-semibold uppercase">Resolved</span>}
                        </div>
                        <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                        {item.description && <p className="text-sm text-[oklch(0.62_0.02_240)] mb-2">{item.description}</p>}
                        <div className="flex flex-wrap gap-3 text-xs text-[oklch(0.55_0.02_240)]">
                          {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {item.contactInfo && <span className="text-[var(--gold)]">Contact: {item.contactInfo}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {!isAuthenticated && (
              <div className="mt-6 glass-card rounded-2xl p-6 text-center">
                <p className="text-[oklch(0.55_0.02_240)] text-sm mb-3">Sign in to report lost or found items</p>
                <a href={getLoginUrl()} className="btn-gold px-6 py-3">Sign In</a>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
