import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  Mountain, Award, Calendar, MessageSquare, ShoppingBag, Settings,
  Users, Crown, Star, MapPin, CheckCircle2,
  Edit3, Shield, Flame, Trophy, AlertTriangle, X, Camera,
} from "lucide-react";
import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

// ─── Static data (badges, leaderboard, past hikes) ───────────────────────────
const BADGES = [
  { emoji: "🥾", name: "First Hike", desc: "Completed your first hike", earned: true },
  { emoji: "🏔️", name: "Mountain Explorer", desc: "Completed 5 hikes", earned: true },
  { emoji: "🌿", name: "Green Hero", desc: "Participated in eco hike", earned: true },
  { emoji: "🌅", name: "Early Riser", desc: "Completed a sunrise hike", earned: false },
  { emoji: "🌙", name: "Night Owl", desc: "Completed a night hike", earned: false },
  { emoji: "📸", name: "Shutterbug", desc: "Joined a photography tour", earned: false },
  { emoji: "⛺", name: "Camper", desc: "Completed overnight camping", earned: false },
  { emoji: "👑", name: "VIP Adventurer", desc: "Became a VIP member", earned: false },
];

const PAST_HIKES_STATIC = [
  { id: 1, title: "Green Heroes Hike", date: "Mar 15, 2026", location: "Yankari National Park", rating: 5 },
  { id: 2, title: "Unity Hike", date: "Mar 8, 2026", location: "Abuja Hills", rating: 5 },
  { id: 3, title: "Night Glow Hike", date: "Feb 22, 2026", location: "Zuma Rock", rating: 4 },
];

const LEADERBOARD = [
  { rank: 1, name: "Amaka O.", hikes: 24, points: 2400, avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=60&q=80" },
  { rank: 2, name: "Emeka A.", hikes: 21, points: 2100, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80" },
  { rank: 3, name: "Fatima B.", hikes: 18, points: 1800, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&q=80" },
  { rank: 4, name: "Chidi N.", hikes: 15, points: 1500, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80" },
  { rank: 5, name: "Ngozi K.", hikes: 12, points: 1200, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80" },
];

const TABS = [
  { id: "overview", label: "Overview", icon: Mountain },
  { id: "bookings", label: "My Bookings", icon: Calendar },
  { id: "badges", label: "Badges", icon: Award },
  { id: "community", label: "Community", icon: Users },
  { id: "profile", label: "Profile Settings", icon: Settings },
];

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
type HikingLevel = "beginner" | "intermediate" | "advanced" | "expert";

interface ProfileData {
  name?: string | null;
  bio?: string | null;
  phone?: string | null;
  hikingLevel?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  totalHikes?: number | null;
  membershipType?: string | null;
  membershipExpiresAt?: Date | string | null;
}

function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: ProfileData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(profile.name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [hikingLevel, setHikingLevel] = useState<HikingLevel>(
    (profile.hikingLevel as HikingLevel) ?? "beginner"
  );

  const utils = trpc.useUtils();
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.profile.get.invalidate();
      onSaved();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile. Please try again.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-3xl p-8 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[oklch(0.55_0.02_240)] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-display text-2xl font-bold text-white mb-6">Edit Profile</h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
              Full Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
              Hiking Level
            </label>
            <select
              value={hikingLevel}
              onChange={(e) => setHikingLevel(e.target.value as HikingLevel)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
            >
              {(["beginner", "intermediate", "advanced", "expert"] as const).map((l) => (
                <option key={l} value={l} className="bg-[var(--card)]">
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-7">
          <button onClick={onClose} className="btn-outline flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) { toast.error("Name cannot be empty."); return; }
              updateProfile.mutate({ name: name.trim(), bio: bio.trim(), phone: phone.trim(), hikingLevel });
            }}
            disabled={updateProfile.isPending}
            className="btn-gold flex-1 justify-center disabled:opacity-60"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────
function UpgradeModal({
  currentPlan,
  onClose,
}: {
  currentPlan: string | null | undefined;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const upgradeMembership = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Membership upgraded! Your new benefits are now active.");
      utils.profile.get.invalidate();
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Upgrade failed. Please try again.");
    },
  });

  const plans = [
    {
      id: "regular" as const,
      name: "Regular Member",
      price: "₦100,000",
      period: "/ year",
      borderClass: "border-blue-500/40",
      badgeClass: "bg-blue-500/20 text-blue-400",
      perks: [
        "Priority booking access",
        "10% discount on all hikes",
        "Monthly newsletter",
        "Member-only events",
        "Community forum access",
      ],
    },
    {
      id: "vip" as const,
      name: "VIP Member",
      price: "₦500,000",
      period: "/ year",
      borderClass: "border-[var(--gold)]/60",
      badgeClass: "bg-[var(--gold)]/20 text-[var(--gold)]",
      perks: [
        "Everything in Regular",
        "25% discount on all hikes",
        "Free gear rental (1x/month)",
        "Dedicated VIP guide",
        "Exclusive VIP-only experiences",
        "Priority complaint resolution",
        "Annual VIP gala invitation",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-3xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[oklch(0.55_0.02_240)] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-display text-2xl font-bold text-white mb-2">Upgrade Membership</h3>
        <p className="text-[oklch(0.62_0.02_240)] text-sm mb-7">
          Choose a plan to unlock premium adventure benefits.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border-2 p-6 flex flex-col gap-4 ${plan.borderClass} bg-white/3`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${plan.badgeClass}`}>
                    {plan.name}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-green-400 font-semibold">Current Plan</span>
                  )}
                </div>
                <div>
                  <span className="font-display text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-[oklch(0.55_0.02_240)] text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-[oklch(0.75_0.02_240)]">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent || upgradeMembership.isPending}
                  onClick={() =>
                    upgradeMembership.mutate({ hikingLevel: undefined })
                  }
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.id === "vip" ? "btn-gold" : "btn-outline"
                  }`}
                >
                  {isCurrent
                    ? "Current Plan"
                    : upgradeMembership.isPending
                    ? "Processing..."
                    : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[oklch(0.45_0.02_240)] text-center mt-5">
          Payment processed via Paystack. Contact us at info@hikekings.ng for corporate billing.
        </p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user: authUser, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Live profile data
  const { data: profile, refetch: refetchProfile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Live bookings
  const { data: bookingsData } = trpc.bookings.myBookings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Settings form (controlled inputs)
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    phone: "",
    bio: "",
    hikingLevel: "beginner" as HikingLevel,
    emergencyContact: "",
    emergencyPhone: "",
  });

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setSettingsForm({
        name: profile.name ?? "",
        phone: (profile as ProfileData).phone ?? "",
        bio: (profile as ProfileData).bio ?? "",
        hikingLevel: ((profile as ProfileData).hikingLevel as HikingLevel) ?? "beginner",
        emergencyContact: (profile as ProfileData).emergencyContact ?? "",
        emergencyPhone: (profile as ProfileData).emergencyPhone ?? "",
      });
    }
  }, [profile]);

  const utils = trpc.useUtils();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation({
    onSuccess: () => {
      toast.success("Profile photo updated successfully!");
      utils.profile.get.invalidate();
      refetchProfile();
    },
    onError: (err) => {
      toast.error(err.message || "Could not upload your profile photo.");
    },
  });

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photos must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        toast.error("Could not read that image.");
        return;
      }
      uploadAvatar.mutate({
        base64Data: reader.result,
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
        fileName: file.name,
      });
    };
    reader.onerror = () => toast.error("Could not read that image.");
    reader.readAsDataURL(file);
  };

  const saveSettings = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      utils.profile.get.invalidate();
      refetchProfile();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save settings. Please try again.");
    },
  });

  const handleSaveSettings = () => {
    if (!settingsForm.name.trim()) { toast.error("Name cannot be empty."); return; }
    saveSettings.mutate({
      name: settingsForm.name.trim(),
      phone: settingsForm.phone.trim(),
      bio: settingsForm.bio.trim(),
      hikingLevel: settingsForm.hikingLevel,
      emergencyContact: settingsForm.emergencyContact.trim(),
      emergencyPhone: settingsForm.emergencyPhone.trim(),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Mountain className="w-10 h-10 text-[var(--gold)] animate-bounce" />
          <p className="text-[oklch(0.62_0.02_240)]">Loading your adventure profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center glass-card p-12 rounded-3xl max-w-md mx-4">
          <Mountain className="w-14 h-14 text-[var(--gold)] mx-auto mb-5" />
          <h2 className="font-display text-3xl font-bold text-white mb-3">Join the Adventure</h2>
          <p className="text-[oklch(0.62_0.02_240)] mb-8">
            Sign in to access your dashboard, bookings, and community features.
          </p>
          <a href={getLoginUrl()} className="btn-gold w-full justify-center">
            Sign In to Continue
          </a>
        </div>
      </div>
    );
  }

  // Merge live profile with auth user
  const user = (profile as ProfileData | null | undefined) ?? (authUser as ProfileData | null | undefined);
  const membershipColor =
    user?.membershipType === "vip"
      ? "text-[var(--gold)]"
      : user?.membershipType === "regular"
      ? "text-blue-400"
      : "text-[oklch(0.55_0.02_240)]";
  const membershipLabel =
    user?.membershipType === "vip"
      ? "VIP Member"
      : user?.membershipType === "regular"
      ? "Regular Member"
      : "Free Member";

  const upcomingBookings =
    bookingsData?.filter((b) => b.booking.status === "confirmed" || b.booking.status === "pending") ?? [];
  const pastBookings =
    bookingsData?.filter((b) => b.booking.status === "attended" || b.booking.status === "cancelled") ?? [];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Modals */}
      {showEditModal && user && (
        <EditProfileModal
          profile={user}
          onClose={() => setShowEditModal(false)}
          onSaved={() => refetchProfile()}
        />
      )}
      {showUpgradeModal && (
        <UpgradeModal
          currentPlan={user?.membershipType}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      <div className="pt-20">
        {/* ── Profile Header ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[oklch(0.10_0.015_240)] to-[oklch(0.08_0.01_240)] border-b border-white/5">
          <div className="container py-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-[var(--gold)]">
                  <AvatarImage src={user?.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-[var(--gold)] text-[oklch(0.08_0.01_240)] text-2xl font-bold">
                    {user?.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-[var(--background)]" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="font-display text-2xl font-bold text-white">
                    {user?.name ?? "Adventurer"}
                  </h1>
                  <span
                    className={`text-xs font-semibold border border-current/30 px-3 py-1 rounded-full ${membershipColor}`}
                  >
                    {membershipLabel}
                  </span>
                </div>
                <p className="text-[oklch(0.55_0.02_240)] text-sm">{user?.email}</p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-[oklch(0.62_0.02_240)]">
                  <span className="flex items-center gap-1.5">
                    <Mountain className="w-4 h-4 text-[var(--gold)]" />
                    {user?.totalHikes ?? 0} Hikes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[var(--gold)]" />
                    {BADGES.filter((b) => b.earned).length} Badges
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[var(--gold)]" />
                    {(user?.totalHikes ?? 0) * 100} Points
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-outline flex items-center gap-2 text-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                {user?.membershipType !== "vip" && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="btn-gold flex items-center gap-2 text-sm"
                  >
                    <Crown className="w-3.5 h-3.5" /> Upgrade
                  </button>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mt-8 overflow-x-auto pb-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]"
                        : "text-[oklch(0.62_0.02_240)] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────────── */}
        <div className="container py-10">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Progress */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-display font-bold text-white mb-5">Adventure Progress</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Hikes Completed", value: user?.totalHikes ?? 0, max: 50, color: "bg-[var(--gold)]" },
                      { label: "Badges Earned", value: BADGES.filter((b) => b.earned).length, max: BADGES.length, color: "bg-green-500" },
                      { label: "Community Points", value: (user?.totalHikes ?? 0) * 100, max: 5000, color: "bg-blue-500" },
                    ].map(({ label, value, max, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[oklch(0.75_0.02_240)]">{label}</span>
                          <span className="text-white font-semibold">{value} / {max}</span>
                        </div>
                        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${color}`}
                            style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-display font-bold text-white">Upcoming Hikes</h3>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-xs text-[var(--gold)] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Mountain className="w-10 h-10 text-[oklch(0.35_0.02_240)] mx-auto mb-3" />
                      <p className="text-[oklch(0.55_0.02_240)] text-sm">No upcoming hikes yet.</p>
                      <Link href="/hikes" className="text-[var(--gold)] text-sm hover:underline mt-2 inline-block">
                        Browse Hikes →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBookings.slice(0, 3).map((b) => (
                        <div
                          key={String(b.booking.id)}
                          className="flex items-center gap-4 p-4 bg-white/3 rounded-xl border border-white/5"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center shrink-0">
                            <Mountain className="w-5 h-5 text-[var(--gold)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate">
                              {String(b.event?.title ?? "Hike Event")}
                            </p>
                            <p className="text-xs text-[oklch(0.55_0.02_240)]">
                              {b.event?.eventDate
                                ? new Date(String(b.event.eventDate)).toLocaleDateString("en-NG", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "—"}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              b.booking.status === "confirmed"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-[var(--gold)]/20 text-[var(--gold)]"
                            }`}
                          >
                            {String(b.booking.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past Hikes */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-display font-bold text-white mb-5">Hike History</h3>
                  <div className="space-y-3">
                    {PAST_HIKES_STATIC.map((hike) => (
                      <div
                        key={hike.id}
                        className="flex items-center gap-4 p-4 bg-white/3 rounded-xl border border-white/5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{hike.title}</p>
                          <p className="text-xs text-[oklch(0.55_0.02_240)] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {hike.location} · {hike.date}
                          </p>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < hike.rating
                                  ? "text-[var(--gold)] fill-[var(--gold)]"
                                  : "text-[oklch(0.35_0.02_240)]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Membership */}
                <div
                  className={`glass-card p-6 rounded-2xl border ${
                    user?.membershipType === "vip" ? "border-[var(--gold)]/40" : "border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className={`w-6 h-6 ${membershipColor}`} />
                    <h3 className="font-display font-bold text-white">Membership</h3>
                  </div>
                  <p className={`text-lg font-bold mb-1 ${membershipColor}`}>{membershipLabel}</p>
                  {!user?.membershipType || user.membershipType === "free" ? (
                    <>
                      <p className="text-xs text-[oklch(0.55_0.02_240)] mt-2 mb-4">
                        Upgrade to unlock exclusive hikes, discounts, and premium perks.
                      </p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="btn-gold w-full justify-center text-xs"
                      >
                        Upgrade Now
                      </button>
                    </>
                  ) : (
                    <p className="text-xs text-[oklch(0.55_0.02_240)] mt-2">
                      {user?.membershipExpiresAt
                        ? `Expires: ${new Date(String(user.membershipExpiresAt)).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}`
                        : "Active membership"}
                    </p>
                  )}
                </div>

                {/* Badges Preview */}
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-white">Recent Badges</h3>
                    <button
                      onClick={() => setActiveTab("badges")}
                      className="text-xs text-[var(--gold)] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {BADGES.slice(0, 4).map((badge) => (
                      <div
                        key={badge.name}
                        title={badge.name}
                        className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${
                          badge.earned
                            ? "bg-[var(--gold)]/20"
                            : "bg-[var(--muted)] opacity-40 grayscale"
                        }`}
                      >
                        {badge.emoji}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-display font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Book a Hike", href: "/hikes", icon: Mountain },
                      { label: "Browse Store", href: "/store", icon: ShoppingBag },
                      { label: "Community Chat", href: "/community", icon: MessageSquare },
                      { label: "Corporate Packages", href: "/corporate", icon: Shield },
                    ].map(({ label, href, icon: Icon }) => (
                      <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[oklch(0.75_0.02_240)] hover:text-white text-sm"
                      >
                        <Icon className="w-4 h-4 text-[var(--gold)]" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="max-w-3xl space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-5">Upcoming Bookings</h2>
                {upcomingBookings.length === 0 ? (
                  <div className="glass-card p-10 rounded-2xl text-center">
                    <Calendar className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
                    <p className="text-[oklch(0.55_0.02_240)] mb-4">No upcoming bookings.</p>
                    <Link href="/hikes" className="btn-gold inline-flex">
                      Browse Hikes
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((b) => (
                      <div
                        key={String(b.booking.id)}
                        className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center shrink-0">
                          <Mountain className="w-6 h-6 text-[var(--gold)]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{String(b.event?.title ?? "Hike Event")}</h4>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-[oklch(0.55_0.02_240)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {b.event?.eventDate
                                ? new Date(String(b.event.eventDate)).toLocaleDateString("en-NG", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {String(b.event?.location ?? "—")}
                            </span>
                          </div>
                          <p className="text-xs text-[oklch(0.45_0.02_240)] mt-1">
                            Ticket: {String(b.booking.ticketCode ?? "—")} · Guests: {Number(b.booking.guestCount ?? 1)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              b.booking.status === "confirmed"
                                ? "bg-green-500/20 text-green-400"
                                : b.booking.status === "cancelled"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-[var(--gold)]/20 text-[var(--gold)]"
                            }`}
                          >
                            {String(b.booking.status)}
                          </span>
                          <span className="text-sm font-bold text-[var(--gold)]">
                            ₦{Number(b.booking.amountPaid ?? 0).toLocaleString("en-NG")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-5">Past Hikes</h2>
                {pastBookings.length === 0 ? (
                  <div className="glass-card p-8 rounded-2xl text-center">
                    <p className="text-[oklch(0.55_0.02_240)] text-sm">
                      No completed hikes yet. Your adventure history will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((b) => (
                      <div
                        key={String(b.booking.id)}
                        className="glass-card p-6 rounded-2xl flex items-center gap-4 opacity-80"
                      >
                        <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{String(b.event?.title ?? "Hike Event")}</h4>
                          <p className="text-xs text-[oklch(0.55_0.02_240)]">
                            {b.event?.eventDate ? new Date(String(b.event.eventDate)).toLocaleDateString("en-NG") : "—"}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-[oklch(0.55_0.02_240)]">
                          ₦{Number(b.booking.amountPaid ?? 0).toLocaleString("en-NG")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BADGES */}
          {activeTab === "badges" && (
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl font-bold text-white mb-6">Achievement Badges</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {BADGES.map((badge) => (
                  <div
                    key={badge.name}
                    className={`glass-card p-5 rounded-2xl text-center flex flex-col items-center gap-3 transition-all ${
                      badge.earned ? "border border-[var(--gold)]/30" : "opacity-50 grayscale"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                        badge.earned ? "bg-[var(--gold)]/20" : "bg-[var(--muted)]"
                      }`}
                    >
                      {badge.emoji}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{badge.name}</p>
                      <p className="text-xs text-[oklch(0.55_0.02_240)] mt-1">{badge.desc}</p>
                    </div>
                    {badge.earned ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                        Earned
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-[oklch(0.45_0.02_240)]">
                        Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMMUNITY */}
          {activeTab === "community" && (
            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl">
              <div>
                <h3 className="font-display font-bold text-white mb-5">Top Hikers This Month</h3>
                <div className="glass-card p-5 space-y-3">
                  {LEADERBOARD.map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          entry.rank <= 3
                            ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]"
                            : "bg-[var(--stone)] text-[oklch(0.62_0.02_240)]"
                        }`}
                      >
                        {entry.rank}
                      </div>
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{entry.name}</div>
                        <div className="text-xs text-[oklch(0.55_0.02_240)]">{entry.hikes} hikes</div>
                      </div>
                      <div className="text-sm font-bold text-[var(--gold)]">{entry.points}pts</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-white mb-5">Community Hub</h3>
                <div className="glass-card p-6 rounded-2xl text-center">
                  <MessageSquare className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
                  <p className="text-[oklch(0.62_0.02_240)] mb-4">
                    Join the full community chat, lost &amp; found, and more.
                  </p>
                  <Link href="/community" className="btn-gold inline-flex">
                    Open Community
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-white mb-6">Profile Settings</h2>
              <div className="glass-card p-8 space-y-6">
                {/* Avatar row */}
                <div className="flex items-center gap-4 pb-6 border-b border-[var(--border)]">
                  <Avatar className="w-16 h-16 border-2 border-[var(--gold)]">
                    <AvatarImage src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-[var(--gold)] text-[oklch(0.08_0.01_240)] text-xl font-bold">
                      {user?.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{user?.name}</h3>
                    <p className="text-sm text-[oklch(0.55_0.02_240)]">{user?.email}</p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <button
                      type="button"
                      disabled={uploadAvatar.isPending}
                      className="text-xs text-[var(--gold)] mt-1 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Camera className="w-3 h-3" />
                      {uploadAvatar.isPending ? "Uploading…" : "Change Photo"}
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
                    Full Name *
                  </label>
                  <input
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
                    Email Address
                  </label>
                  <input
                    value={user?.email ?? ""}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[oklch(0.55_0.02_240)] text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-[oklch(0.45_0.02_240)] mt-1">
                    Email is managed by your sign-in provider.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
                    Phone Number
                  </label>
                  <input
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
                      Emergency Contact
                    </label>
                    <input
                      value={settingsForm.emergencyContact}
                      onChange={(e) =>
                        setSettingsForm((f) => ({ ...f, emergencyContact: e.target.value }))
                      }
                      placeholder="Contact name"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
                      Emergency Phone
                    </label>
                    <input
                      value={settingsForm.emergencyPhone}
                      onChange={(e) =>
                        setSettingsForm((f) => ({ ...f, emergencyPhone: e.target.value }))
                      }
                      placeholder="+234 800 000 0000"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
                    />
                  </div>
                </div>

                {/* Hiking Level */}
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
                    Hiking Level
                  </label>
                  <select
                    value={settingsForm.hikingLevel}
                    onChange={(e) =>
                      setSettingsForm((f) => ({
                        ...f,
                        hikingLevel: e.target.value as HikingLevel,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors"
                  >
                    {(["beginner", "intermediate", "advanced", "expert"] as const).map((level) => (
                      <option key={level} value={level} className="bg-[var(--card)]">
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-semibold tracking-wider uppercase text-[oklch(0.55_0.02_240)] mb-2 block">
                    Bio
                  </label>
                  <textarea
                    value={settingsForm.bio}
                    onChange={(e) => setSettingsForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell the community about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors resize-none"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={saveSettings.isPending}
                  className="btn-gold w-full justify-center disabled:opacity-60"
                >
                  {saveSettings.isPending ? "Saving..." : "Save Changes"}
                </button>

                {/* Safety note */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <h4 className="text-sm font-semibold text-[oklch(0.55_0.02_240)] mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Safety Information
                  </h4>
                  <p className="text-xs text-[oklch(0.45_0.02_240)]">
                    Your emergency contact information is only shared with Hike Kings guides in case
                    of an emergency during a hike. It is never shared publicly.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
