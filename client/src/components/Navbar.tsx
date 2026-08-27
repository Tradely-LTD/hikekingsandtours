import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Menu, X, Mountain, ChevronDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";

const navLinks = [
  { label: "Hikes", href: "/hikes" },
  { label: "Cities", href: "/cities" },
  { label: "Trips", href: "/trips" },
  { label: "Experiences", href: "/experiences" },
  { label: "Community", href: "/community" },
  { label: "Store", href: "/store" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: notifications } = trpc.notifications.list.useQuery(undefined, { enabled: isAuthenticated });
  const unreadCount = (notifications ?? []).filter(n => !n.read).length;

  const isHome = location === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? "glass border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_oklch(0.72_0.18_75/0.5)] transition-shadow">
            <Mountain className="w-5 h-5 text-[oklch(0.08_0.01_240)]" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="font-hero text-xl text-[var(--gold)] tracking-widest">HIKE KINGS</div>
            <div className="text-[0.6rem] font-semibold tracking-[0.25em] uppercase text-[oklch(0.62_0.02_240)] -mt-0.5">& Tours 2.0</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${location === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Notifications Bell */}
              <Link href="/notifications" className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
                <Bell className="w-5 h-5 text-white/60" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 glass rounded-full pl-1 pr-3 py-1 hover:border-[var(--gold)/30] transition-all">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-[var(--gold)] text-[oklch(0.08_0.01_240)] text-xs font-bold">
                      {user.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-[oklch(0.85_0.01_240)]">{user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[oklch(0.62_0.02_240)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[var(--card)] border-[var(--border)]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">My Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="flex items-center gap-2 cursor-pointer">
                    Notifications {unreadCount > 0 && <span className="ml-auto bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/partner-dashboard" className="flex items-center gap-2 cursor-pointer">Partner Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-[var(--gold)]">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="text-red-400 cursor-pointer">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <>
              <a href={getLoginUrl()} className="nav-link">Sign In</a>
              <a href={getLoginUrl()} className="btn-gold text-xs">Join Now</a>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-[oklch(0.85_0.01_240)]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden glass border-t border-white/5 mt-2">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`py-3 px-4 rounded-lg text-sm font-semibold tracking-wider uppercase transition-colors ${
                  location === link.href
                    ? "text-[var(--gold)] bg-[oklch(0.72_0.18_75/0.1)]"
                    : "text-[oklch(0.75_0.01_240)] hover:text-[var(--gold)] hover:bg-[oklch(0.72_0.18_75/0.05)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="btn-outline-gold justify-center text-sm">
                    My Dashboard
                  </Link>
                  <Link href="/notifications" onClick={() => setMobileOpen(false)} className="py-2 px-4 rounded-lg text-sm font-semibold text-[oklch(0.75_0.01_240)] hover:text-[var(--gold)] hover:bg-[oklch(0.72_0.18_75/0.05)] transition-colors flex items-center justify-between">
                    Notifications
                    {unreadCount > 0 && <span className="ml-2 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                  </Link>
                  <Link href="/partner-dashboard" onClick={() => setMobileOpen(false)} className="py-2 px-4 rounded-lg text-sm font-semibold text-[oklch(0.75_0.01_240)] hover:text-[var(--gold)] hover:bg-[oklch(0.72_0.18_75/0.05)] transition-colors">
                    Partner Dashboard
                  </Link>
                  {user && user.role === "admin" && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="py-2 px-4 rounded-lg text-sm font-semibold text-[var(--gold)] hover:bg-[oklch(0.72_0.18_75/0.15)] transition-colors border border-[var(--gold)]/30">
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-red-400 text-sm font-semibold py-2 hover:text-red-300 transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a href={getLoginUrl()} className="btn-gold justify-center">Join the Adventure</a>
                  <a href={getLoginUrl()} className="btn-outline-gold justify-center text-sm">Sign In</a>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
