import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Activity, Bed, Calendar, Plus, CheckCircle, Clock, XCircle, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const ACTIVITY_TYPES = [
  "horse_riding", "kayaking", "boat_ride", "cycling", "swimming",
  "zip_line", "safari", "camping", "photography", "cultural_tour", "hiking", "other"
];
const ROOM_TYPES = ["single", "double", "couple", "family", "dormitory", "suite", "chalet", "tent"];
const PRICE_UNITS = ["per_person", "per_hour", "per_day", "per_group"];

type DashTab = "overview" | "activities" | "accommodation" | "bookings";

export default function PartnerDashboardPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<DashTab>("overview");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);

  const { data: partner, refetch: refetchPartner } = trpc.partners.myPartner.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: activityBookings } = trpc.partners.myActivityBookings.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: roomBookings } = trpc.partners.myAccommodationBookings.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  const [activityForm, setActivityForm] = useState({
    name: "", description: "", type: "other", price: "", priceUnit: "per_person",
    duration: "", maxParticipants: 10, imageUrl: "",
  });
  const [roomForm, setRoomForm] = useState({
    name: "", description: "", type: "double", pricePerNight: "",
    capacity: 2, totalRooms: 1, imageUrl: "", amenities: "",
  });

  const addActivityMutation = trpc.partners.addActivity.useMutation({
    onSuccess: () => {
      toast.success("Activity added successfully!");
      setShowAddActivity(false);
      setActivityForm({ name: "", description: "", type: "other", price: "", priceUnit: "per_person", duration: "", maxParticipants: 10, imageUrl: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const addRoomMutation = trpc.partners.addAccommodation.useMutation({
    onSuccess: () => {
      toast.success("Accommodation added successfully!");
      setShowAddRoom(false);
      setRoomForm({ name: "", description: "", type: "double", pricePerNight: "", capacity: 2, totalRooms: 1, imageUrl: "", amenities: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="container pt-32 pb-24 text-center max-w-lg mx-auto">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-black text-white mb-4">Sign In Required</h1>
          <a href={getLoginUrl()}><Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold">Sign In</Button></a>
        </div>
        <Footer />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="container pt-32 pb-24 text-center max-w-lg mx-auto">
          <div className="text-6xl mb-6">🏢</div>
          <h1 className="text-3xl font-black text-white mb-4">Not a Partner Yet</h1>
          <p className="text-white/60 mb-8">Register your venue or activity to access the partner dashboard.</p>
          <Button onClick={() => navigate("/partners/register")} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
            Register as Partner <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "text-amber-400 bg-amber-500/10",
    approved: "text-green-400 bg-green-500/10",
    suspended: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="container pt-28 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white">{partner.name}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusColors[partner.status ?? "pending"]}`}>
                {partner.status}
              </span>
              {partner.verified && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>}
            </div>
            <p className="text-white/50">{partner.shortDescription ?? partner.description}</p>
            {partner.status === "pending" && (
              <p className="text-amber-400/70 text-sm mt-1">⏳ Your application is under review. You'll be notified once approved.</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowAddActivity(true)} disabled={partner.status !== "approved"} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
              <Plus className="w-4 h-4 mr-1" /> Add Activity
            </Button>
            <Button onClick={() => setShowAddRoom(true)} disabled={partner.status !== "approved"} variant="outline" className="border-white/20 text-white hover:bg-white/5">
              <Plus className="w-4 h-4 mr-1" /> Add Room
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5 mb-8">
          {(["overview", "activities", "accommodation", "bookings"] as DashTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? "text-amber-400 border-b-2 border-amber-400" : "text-white/50 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Activity className="w-5 h-5 text-amber-400" />, label: "Activities", value: 0 },
                { icon: <Bed className="w-5 h-5 text-amber-400" />, label: "Rooms", value: 0 },
                { icon: <Calendar className="w-5 h-5 text-amber-400" />, label: "Activity Bookings", value: activityBookings?.length ?? 0 },
                { icon: <Calendar className="w-5 h-5 text-amber-400" />, label: "Room Bookings", value: roomBookings?.length ?? 0 },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">{stat.icon}<span className="text-white/50 text-sm">{stat.label}</span></div>
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Partner info */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Category", value: (partner.category ?? "—").replace(/_/g, " ") },
                  { label: "City", value: partner.cityId ? `City ID: ${partner.cityId}` : "—" },
                  { label: "Address", value: partner.address ?? "—" },
                  { label: "Phone", value: partner.phone ?? "—" },
                  { label: "Email", value: partner.email ?? "—" },
                  { label: "Website", value: partner.website ?? "—" },
                ].map(item => (
                  <div key={item.label}>
                    <span className="text-white/40">{item.label}: </span>
                    <span className="text-white capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {tab === "activities" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Activities</h2>
              <Button onClick={() => setShowAddActivity(true)} disabled={partner.status !== "approved"} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                <Plus className="w-4 h-4 mr-1" /> Add Activity
              </Button>
            </div>
            <div className="text-center py-16 text-white/40">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No activities added yet. Click "Add Activity" to get started.</p>
            </div>
          </div>
        )}

        {/* Accommodation Tab */}
        {tab === "accommodation" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Rooms & Accommodation</h2>
              <Button onClick={() => setShowAddRoom(true)} disabled={partner.status !== "approved"} variant="outline" className="border-white/20 text-white hover:bg-white/5">
                <Plus className="w-4 h-4 mr-1" /> Add Room
              </Button>
            </div>
            <div className="text-center py-16 text-white/40">
              <Bed className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No accommodation added yet. Click "Add Room" to get started.</p>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Activity Bookings</h2>
              {!activityBookings?.length ? (
                <div className="text-center py-12 text-white/40 bg-white/5 rounded-2xl">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No activity bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityBookings.map(b => (
                    <div key={b.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{b.bookingRef}</div>
                        <div className="text-white/50 text-sm">{new Date(b.scheduledDate).toLocaleDateString()} · {b.participants ?? 1} participant{(b.participants ?? 1) > 1 ? "s" : ""}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-bold">₦{Number(b.totalAmount).toLocaleString()}</div>
                        <div className={`text-xs capitalize ${b.status === "confirmed" ? "text-green-400" : b.status === "cancelled" ? "text-red-400" : "text-amber-400"}`}>{b.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Room Bookings</h2>
              {!roomBookings?.length ? (
                <div className="text-center py-12 text-white/40 bg-white/5 rounded-2xl">
                  <Bed className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No room bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roomBookings.map(b => (
                    <div key={b.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{b.bookingRef}</div>
                        <div className="text-white/50 text-sm">{new Date(b.checkInDate).toLocaleDateString()} → {new Date(b.checkOutDate).toLocaleDateString()} · {b.nights} night{b.nights > 1 ? "s" : ""}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-bold">₦{Number(b.totalAmount).toLocaleString()}</div>
                        <div className={`text-xs capitalize ${b.status === "confirmed" ? "text-green-400" : b.status === "cancelled" ? "text-red-400" : "text-amber-400"}`}>{b.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-amber-400">Add Activity</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Activity Name *</label>
              <input type="text" placeholder="e.g. Horse Riding Tour" value={activityForm.name}
                onChange={e => setActivityForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-sm mb-1 block">Type *</label>
                <select value={activityForm.type} onChange={e => setActivityForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50">
                  {ACTIVITY_TYPES.map(t => <option key={t} value={t} className="bg-[#111] capitalize">{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Price (₦) *</label>
                <input type="number" placeholder="5000" value={activityForm.price}
                  onChange={e => setActivityForm(f => ({ ...f, price: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-sm mb-1 block">Price Unit</label>
                <select value={activityForm.priceUnit} onChange={e => setActivityForm(f => ({ ...f, priceUnit: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50">
                  {PRICE_UNITS.map(u => <option key={u} value={u} className="bg-[#111] capitalize">{u.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Duration</label>
                <input type="text" placeholder="e.g. 2 hours" value={activityForm.duration}
                  onChange={e => setActivityForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Max Participants</label>
              <input type="number" min={1} value={activityForm.maxParticipants}
                onChange={e => setActivityForm(f => ({ ...f, maxParticipants: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Description</label>
              <textarea rows={3} placeholder="Describe this activity..." value={activityForm.description}
                onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Image URL</label>
              <input type="url" placeholder="https://..." value={activityForm.imageUrl}
                onChange={e => setActivityForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50" />
            </div>
            <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
              disabled={!activityForm.name || !activityForm.price || addActivityMutation.isPending}
              onClick={() => addActivityMutation.mutate({
                name: activityForm.name,
                description: activityForm.description || undefined,
                type: activityForm.type as "horse_riding" | "kayaking" | "boat_ride" | "cycling" | "swimming" | "zip_line" | "safari" | "camping" | "photography" | "cultural_tour" | "hiking" | "other",
                price: Number(activityForm.price),
                priceUnit: activityForm.priceUnit as "per_person" | "per_hour" | "per_day" | "per_group",
                duration: activityForm.duration || undefined,
                maxParticipants: activityForm.maxParticipants,
                imageUrl: activityForm.imageUrl || undefined,
              })}>
              {addActivityMutation.isPending ? "Adding..." : "Add Activity"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Room Modal */}
      <Dialog open={showAddRoom} onOpenChange={setShowAddRoom}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-amber-400">Add Accommodation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Room Name *</label>
              <input type="text" placeholder="e.g. Deluxe Couple Suite" value={roomForm.name}
                onChange={e => setRoomForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-sm mb-1 block">Room Type *</label>
                <select value={roomForm.type} onChange={e => setRoomForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50">
                  {ROOM_TYPES.map(t => <option key={t} value={t} className="bg-[#111] capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Price/Night (₦) *</label>
                <input type="number" placeholder="25000" value={roomForm.pricePerNight}
                  onChange={e => setRoomForm(f => ({ ...f, pricePerNight: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-sm mb-1 block">Capacity (guests)</label>
                <input type="number" min={1} value={roomForm.capacity}
                  onChange={e => setRoomForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Total Rooms Available</label>
                <input type="number" min={1} value={roomForm.totalRooms}
                  onChange={e => setRoomForm(f => ({ ...f, totalRooms: Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Amenities (comma-separated)</label>
              <input type="text" placeholder="WiFi, AC, Hot Water, TV..." value={roomForm.amenities}
                onChange={e => setRoomForm(f => ({ ...f, amenities: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Description</label>
              <textarea rows={3} placeholder="Describe this room..." value={roomForm.description}
                onChange={e => setRoomForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 resize-none" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Image URL</label>
              <input type="url" placeholder="https://..." value={roomForm.imageUrl}
                onChange={e => setRoomForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50" />
            </div>
            <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
              disabled={!roomForm.name || !roomForm.pricePerNight || addRoomMutation.isPending}
              onClick={() => addRoomMutation.mutate({
                name: roomForm.name,
                description: roomForm.description || undefined,
                type: roomForm.type as "single" | "double" | "couple" | "family" | "dormitory" | "suite" | "chalet" | "tent",
                pricePerNight: Number(roomForm.pricePerNight),
                capacity: roomForm.capacity,
                totalRooms: roomForm.totalRooms,
                imageUrl: roomForm.imageUrl || undefined,
                amenities: roomForm.amenities ? roomForm.amenities.split(",").map(s => s.trim()).filter(Boolean) : [],
              })}>
              {addRoomMutation.isPending ? "Adding..." : "Add Accommodation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
