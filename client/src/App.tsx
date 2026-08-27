/**
 * App.tsx — Root router and provider tree.
 *
 * Architecture: Feature-based module separation (Architecture Playbook)
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  client/src/features/                                               │
 * │    landing/LandingPage.tsx   — Standalone cinematic landing page    │
 * │    hikes/HikesPage.tsx       — Hike catalog + booking               │
 * │    membership/MembershipPage.tsx — Membership tiers                 │
 * │    store/StorePage.tsx       — Merchandise store                    │
 * │    corporate/CorporatePage.tsx — Corporate packages                 │
 * │    community/CommunityPage.tsx — Chat, leaderboard, lost & found    │
 * │    dashboard/DashboardPage.tsx — User profile + bookings            │
 * │    admin/AdminPage.tsx       — Admin management panel               │
 * │    cities/CitiesPage.tsx     — 15 Nigerian destination cities        │
 * │    cities/CityDetailPage.tsx — City detail with partners/activities  │
 * │    partners/PartnerRegisterPage.tsx — Partner onboarding             │
 * │    partners/PartnerDashboardPage.tsx — Partner management portal     │
 * │    trips/TripsPage.tsx       — Curated multi-day trip packages       │
 * │    notifications/NotificationsPage.tsx — In-app notifications        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * The pages/ directory is intentionally kept as thin re-export wrappers
 * so Wouter route registration stays clean and feature modules remain
 * independently importable.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// ── Feature modules (canonical source of truth) ──────────────────────────────
import LandingPage from "./features/landing/LandingPage";
import HikesPage from "./features/hikes/HikesPage";
import MembershipPage from "./features/membership/MembershipPage";
import StorePage from "./features/store/StorePage";
import CorporatePage from "./features/corporate/CorporatePage";
import CommunityPage from "./features/community/CommunityPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import AdminPage from "./features/admin/AdminPage";
import ExperiencesPage from "./features/experiences/ExperiencesPage";
import GalleryPage from "./features/gallery/GalleryPage";
import CitiesPage from "./features/cities/CitiesPage";
import CityDetailPage from "./features/cities/CityDetailPage";
import PartnerRegisterPage from "./features/partners/PartnerRegisterPage";
import PartnerDashboardPage from "./features/partners/PartnerDashboardPage";
import TripsPage from "./features/trips/TripsPage";
import TripDetailPage from "./features/trips/TripDetailPage";
import NotificationsPage from "./features/notifications/NotificationsPage";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* ── Public routes ──────────────────────────────────────────────── */}
      <Route path="/" component={LandingPage} />
      <Route path="/hikes" component={HikesPage} />
      <Route path="/membership" component={MembershipPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/corporate" component={CorporatePage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/experiences" component={ExperiencesPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/cities" component={CitiesPage} />
      <Route path="/cities/:slug" component={CityDetailPage} />
      <Route path="/partners/register" component={PartnerRegisterPage} />
      <Route path="/trips" component={TripsPage} />
      <Route path="/trips/:slug" component={TripDetailPage} />

      {/* ── Authenticated routes ───────────────────────────────────────── */}
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/partner-dashboard" component={PartnerDashboardPage} />
      <Route path="/notifications" component={NotificationsPage} />

      {/* ── Admin routes (role-gated server-side) ─────────────────────── */}
      <Route path="/admin" component={AdminPage} />

      {/* ── Fallback ───────────────────────────────────────────────────── */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
