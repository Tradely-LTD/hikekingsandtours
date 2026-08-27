import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, CheckCheck, Calendar, Trophy, MessageSquare, Package, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  booking: <Calendar className="w-5 h-5 text-amber-400" />,
  badge: <Trophy className="w-5 h-5 text-yellow-400" />,
  message: <MessageSquare className="w-5 h-5 text-blue-400" />,
  order: <Package className="w-5 h-5 text-green-400" />,
  event: <MapPin className="w-5 h-5 text-purple-400" />,
  system: <AlertCircle className="w-5 h-5 text-white/50" />,
};

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(
    undefined, { enabled: isAuthenticated }
  );

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("All notifications marked as read");
      utils.notifications.list.invalidate();
    },
  });

  const unreadCount = (notifications ?? []).filter(n => !n.read).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="container pt-32 pb-24 text-center max-w-lg mx-auto">
          <Bell className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <h1 className="text-2xl font-black text-white mb-3">Sign In to View Notifications</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="container pt-28 pb-24 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-white/50 text-sm mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button onClick={() => markAllReadMutation.mutate()} variant="outline"
              className="border-white/20 text-white/70 hover:bg-white/5 text-sm">
              <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : !notifications?.length ? (
          <div className="text-center py-24">
            <Bell className="w-16 h-16 mx-auto mb-4 text-white/10" />
            <h2 className="text-xl font-bold text-white/30 mb-2">All caught up!</h2>
            <p className="text-white/20">No notifications yet. Start exploring adventures to get updates.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => { if (!n.read) markReadMutation.mutate({ id: n.id }); }}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? "bg-white/3 border-white/5 opacity-60"
                    : "bg-white/5 border-white/10 hover:border-amber-500/20"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {NOTIFICATION_ICONS[n.type ?? "system"] ?? NOTIFICATION_ICONS.system}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold text-sm ${n.read ? "text-white/50" : "text-white"}`}>{n.title}</h3>
                    <span className="text-white/30 text-xs flex-shrink-0">
                      {new Date(n.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                {!n.read && (
                  <div className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
