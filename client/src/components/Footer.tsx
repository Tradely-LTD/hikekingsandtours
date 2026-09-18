import { Link } from "wouter";
import { Mountain, Instagram, Youtube, Music2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.06_0.01_240)] border-t border-white/5">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] flex items-center justify-center">
                <Mountain className="w-5 h-5 text-[oklch(0.08_0.01_240)]" strokeWidth={2.5} />
              </div>
              <div className="leading-none">
                <div className="font-hero text-xl text-[var(--gold)] tracking-widest">HIKE KINGS</div>
                <div className="text-[0.6rem] font-semibold tracking-[0.25em] uppercase text-[oklch(0.55_0.02_240)] -mt-0.5">& Tours 2.0</div>
              </div>
            </Link>
            <p className="text-sm text-[oklch(0.55_0.02_240)] leading-relaxed mb-6">
              Nigeria's premier adventure lifestyle community. Connecting thousands of outdoor enthusiasts with unforgettable experiences.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[var(--stone)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-[oklch(0.08_0.01_240)] transition-all text-[oklch(0.62_0.02_240)]">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[var(--stone)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-[oklch(0.08_0.01_240)] transition-all text-[oklch(0.62_0.02_240)]">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-[var(--stone)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-[oklch(0.08_0.01_240)] transition-all text-[oklch(0.62_0.02_240)]">
                <Music2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-5">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: "Upcoming Hikes", href: "/hikes" },
                { label: "Premium Trips", href: "/membership" },
                { label: "Photography Tours", href: "/gallery" },
                { label: "Camping Adventures", href: "/experiences" },
                { label: "Cultural Experiences", href: "/experiences" },
                { label: "Corporate Packages", href: "/corporate" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[oklch(0.55_0.02_240)] hover:text-[var(--gold)] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-5">Community</h4>
            <ul className="space-y-3">
              {[
                { label: "Membership Plans", href: "/membership" },
                { label: "Leaderboard", href: "/community" },
                { label: "Community Chat", href: "/community" },
                { label: "Lost & Found", href: "/community" },
                { label: "Merchandise Store", href: "/store" },
                { label: "My Dashboard", href: "/dashboard" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[oklch(0.55_0.02_240)] hover:text-[var(--gold)] transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--gold)] mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--gold)] mt-0.5 shrink-0" />
                <span className="text-sm text-[oklch(0.55_0.02_240)]">Abuja, Federal Capital Territory, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--gold)] shrink-0" />
                <a href="tel:+2348000000000" className="text-sm text-[oklch(0.55_0.02_240)] hover:text-[var(--gold)] transition-colors">+234 800 000 0000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[var(--gold)] shrink-0" />
                <a href="mailto:info@hikekingsandtours.com" className="text-sm text-[oklch(0.55_0.02_240)] hover:text-[var(--gold)] transition-colors">info@hikekingsandtours.com</a>
              </li>
            </ul>
            <div className="mt-6 p-4 rounded-xl bg-[oklch(0.72_0.18_75/0.08)] border border-[oklch(0.72_0.18_75/0.2)]">
              <p className="text-xs font-bold text-[var(--gold)] tracking-wider uppercase mb-1">Booking Window</p>
              <p className="text-xs text-[oklch(0.62_0.02_240)]">Wednesday – Friday, 11:00 PM only</p>
            </div>
          </div>
        </div>

        <div className="gold-divider my-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[oklch(0.45_0.02_240)]">
            © {new Date().getFullYear()} Hike Kings & Tours 2.0. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map((item) => (
              <Link key={item} href="#" className="text-xs text-[oklch(0.45_0.02_240)] hover:text-[var(--gold)] transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
