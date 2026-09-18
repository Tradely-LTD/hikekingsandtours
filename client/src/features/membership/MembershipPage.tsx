import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Crown, CheckCircle, Star, Mountain, AlertCircle, Loader2, Clock,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/** `tier.icon` is a component, so it is keyed off tierKey rather than stored. */
const TIER_ICONS: Record<string, LucideIcon> = { regular: Star, vip: Crown };

interface UiTier {
  id: number;
  tierKey: string;
  name: string;
  price: number;
  period: string;
  description: string;
  perks: string[];
  popular: boolean;
  cta: string;
  icon: LucideIcon;
}

const normaliseTiers = (rows: unknown[]): UiTier[] =>
  rows.map((raw) => {
    const row = raw as Record<string, unknown>;
    const tierKey = String(row.tierKey ?? "");
    return {
      id: Number(row.id),
      tierKey,
      name: String(row.name ?? "Membership"),
      // price is a DECIMAL column — it arrives as the string "100000.00".
      price: Number(row.price) || 0,
      period: String(row.period ?? "/year"),
      description: String(row.description ?? ""),
      perks: Array.isArray(row.perks)
        ? row.perks.filter((p): p is string => typeof p === "string")
        : [],
      popular: Boolean(row.popular),
      cta: String(row.ctaLabel || `Get ${String(row.name ?? "")} Membership`),
      icon: TIER_ICONS[tierKey] ?? Star,
    };
  });

// Editorial copy, deliberately not tier data — it is not modelled in the DB.
const COMPARISON = [
  { feature: "Hike Discounts", regular: "50% off Abuja trips", vip: "All trips included" },
  { feature: "Priority Booking", regular: true, vip: true },
  { feature: "Members-only Events", regular: true, vip: true },
  { feature: "VIP-only Events", regular: false, vip: true },
  { feature: "Free Trip Included", regular: false, vip: "1 trip/year" },
  { feature: "Guest Passes", regular: false, vip: "2 per event" },
  { feature: "Merchandise Discount", regular: "10%", vip: "20%" },
  { feature: "Welcome Package", regular: false, vip: "₦25,000 value" },
  { feature: "Concierge Support", regular: false, vip: true },
  { feature: "Emergency Priority", regular: false, vip: true },
  { feature: "Annual Gala", regular: false, vip: true },
];

const FAQS = [
  {
    q: "How do I activate my membership?",
    a: "After payment is confirmed via Paystack or Flutterwave, your membership is automatically activated within 24 hours. You'll receive a confirmation email with your member ID.",
  },
  {
    q: "Can I upgrade from Regular to VIP?",
    a: "Yes! You can upgrade at any time. We'll prorate the remaining value of your Regular membership against the VIP price.",
  },
  {
    q: "What is the free trip included in VIP?",
    a: "VIP members get one fully-sponsored trip to a partner tourist destination per year. Destinations include Obudu Mountain Resort, Yankari National Park, and more.",
  },
  {
    q: "Are membership fees refundable?",
    a: "Memberships are non-refundable after 14 days of activation. Within 14 days, you can request a full refund if no benefits have been used.",
  },
  {
    q: "Do membership discounts apply to all hikes?",
    a: "Regular membership gives 50% off Abuja tourist trips. VIP membership covers all local trips and provides significant discounts on premium trips.",
  },
];

const formatPrice = (p: number) => `₦${p.toLocaleString("en-NG")}`;

/** tRPC surfaces the server's TRPCError code at `error.data.code`. */
const errorCode = (error: unknown): string | undefined =>
  (error as { data?: { code?: string } } | null)?.data?.code;

/**
 * Codes that mean this reference is finished and will never settle. Only these
 * justify discarding the reference from the URL.
 *
 * CONFLICT is deliberately absent: it means Paystack has the money but has not
 * finalised the charge yet, so the reference is still live and the webhook is
 * expected to settle it. UNAUTHORIZED is absent too - the session, not the
 * payment, is the problem, and the reference is needed after signing back in.
 */
const TERMINAL_VERIFY_CODES = new Set([
  "BAD_REQUEST",
  "FORBIDDEN",
  "NOT_FOUND",
  "PRECONDITION_FAILED",
]);

/** How long to wait before the one permitted re-check of membership state. */
const SETTLEMENT_RECHECK_MS = 5_000;

export default function Membership() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pendingTier, setPendingTier] = useState<string | null>(null);
  const utils = trpc.useUtils();

  // The reference Paystack redirected back with. Held in state rather than read
  // from the URL at use time, so it survives being cleaned out of the address
  // bar - and so it is NOT cleaned out until the mutation has actually settled.
  const [returnReference, setReturnReference] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("reference")
  );
  const [settlementPending, setSettlementPending] = useState(false);

  const clearReferenceFromUrl = useCallback(() => {
    window.history.replaceState({}, "", window.location.pathname);
    setReturnReference(null);
  }, []);

  const { data, isLoading, isError } = trpc.membership.tiers.useQuery();
  const tiers = useMemo(() => normaliseTiers((data ?? []) as unknown[]), [data]);

  const initiate = trpc.membership.initiate.useMutation({
    onSuccess: (result: { authorizationUrl: string }) => {
      // Paystack hosts the card form. The client never handles a card, an
      // amount, or a payment status.
      window.location.href = result.authorizationUrl;
    },
    onError: (error: { message?: string }) => {
      setPendingTier(null);
      toast.error(error?.message ?? "Could not start the payment. Please try again.");
    },
  });

  const verify = trpc.membership.verify.useMutation({
    onSuccess: (result: { membershipType: string }) => {
      setSettlementPending(false);
      toast.success(`Welcome to ${String(result.membershipType).toUpperCase()}!`, {
        description: "Your membership is active. Member pricing applies across the site.",
      });
      utils.auth.me.invalidate();
      clearReferenceFromUrl();
    },
    onError: (error: unknown) => {
      const code = errorCode(error);
      const message = (error as { message?: string } | null)?.message;

      // CONFLICT is not a failure. The charge is real and still finalising at
      // Paystack; the webhook settles it moments later. Telling this person
      // their payment failed invites a second payment - real money lost.
      if (code === "CONFLICT") {
        setSettlementPending(true);
        toast.info("Payment received - we're confirming it now.", {
          description: "Your membership will activate shortly. There's no need to pay again.",
        });
        return;
      }

      setSettlementPending(false);
      toast.error(message ?? "We could not verify that payment.");

      // Only discard the reference once it can never settle.
      if (code && TERMINAL_VERIFY_CODES.has(code)) clearReferenceFromUrl();
    },
  });

  // ── Paystack return leg ────────────────────────────────────────────────
  // Paystack redirects to /membership?reference=<ref>.
  //
  // The effect waits for auth to resolve and only fires when signed in. If the
  // session did not survive the redirect, verify is never called and the
  // reference stays in the URL, so signing in and coming back still works. The
  // param is stripped by the mutation handlers, never before they settle.
  const verifiedRef = useRef(false);
  const verifyMutate = verify.mutate;
  useEffect(() => {
    if (verifiedRef.current) return;
    if (!returnReference) return;
    if (authLoading) return;       // auth.me still in flight - do not judge yet
    if (!isAuthenticated) return;  // keep the reference; they can sign in and return
    verifiedRef.current = true;    // StrictMode double-invokes effects in dev
    verifyMutate({ reference: returnReference });
  }, [verifyMutate, returnReference, authLoading, isAuthenticated]);

  // One re-check after the webhook has had a moment to land, so a settled
  // membership appears without a manual refresh. Exactly one - no polling.
  useEffect(() => {
    if (!settlementPending) return;
    const timer = window.setTimeout(() => {
      utils.auth.me.invalidate();
    }, SETTLEMENT_RECHECK_MS);
    return () => window.clearTimeout(timer);
  }, [settlementPending, utils]);

  const recheckSettlement = () => {
    if (!returnReference || verify.isPending) return;
    verifyMutate({ reference: returnReference });
  };

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-16 bg-[oklch(0.09_0.012_240)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.72_0.18_75/0.04)] to-transparent pointer-events-none" />
        <div className="container text-center relative">
          <div className="section-label justify-center mb-5">Exclusive Access</div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-5">
            Choose Your<br />
            <span className="text-gradient-gold italic">Adventure Level</span>
          </h1>
          <p className="text-[oklch(0.62_0.02_240)] max-w-xl mx-auto text-lg">
            Unlock exclusive hikes, premium discounts, and a community of passionate adventurers. The more you invest, the more you experience.
          </p>
          {verify.isPending && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
              <span className="text-sm font-semibold text-white">Confirming your payment…</span>
            </div>
          )}

          {/* Returned from Paystack but the session did not survive the redirect.
              The reference is still in the URL, so signing in completes it. */}
          {!authLoading && !isAuthenticated && returnReference && (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
              <Clock className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span className="text-sm text-white">
                Payment received. Sign in to activate your membership — we’ve kept your reference.
              </span>
              <a href={getLoginUrl()} className="btn-gold text-xs py-2 px-4">Sign In</a>
            </div>
          )}

          {/* CONFLICT: the charge is real and still finalising at Paystack. This
              is a neutral waiting state, never an error, and it must never
              suggest paying again. */}
          {settlementPending && !verify.isPending && (
            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-3 rounded-xl bg-[oklch(0.72_0.18_75/0.08)] border border-[oklch(0.72_0.18_75/0.3)]">
              <Clock className="w-4 h-4 text-[var(--gold)] shrink-0" />
              <span className="text-sm text-white text-left">
                Payment received — we’re confirming it now.
                <span className="block text-xs text-[oklch(0.62_0.02_240)]">
                  Your membership will activate shortly. Please don’t pay again.
                </span>
              </span>
              <button onClick={recheckSettlement} className="btn-outline-gold text-xs py-2 px-4">
                Check again
              </button>
            </div>
          )}
          {isAuthenticated && user != null && user.membershipType !== "free" && (
            <div className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[oklch(0.72_0.18_75/0.1)] border border-[oklch(0.72_0.18_75/0.3)]">
              <Crown className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-sm font-semibold text-[var(--gold)]">
                You are a {user?.membershipType?.toUpperCase()} Member
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20" id="pricing">
        <div className="container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-3xl bg-white/5 animate-pulse" style={{ height: "620px" }} />
              ))}
            </div>
          ) : isError ? (
            <div className="max-w-4xl mx-auto text-center py-24 glass-card rounded-3xl">
              <AlertCircle className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Membership is temporarily unavailable</h2>
              <p className="text-[oklch(0.55_0.02_240)]">Please try again shortly or contact Hike Kings & Tours for assistance.</p>
            </div>
          ) : tiers.length === 0 ? (
            <div className="max-w-4xl mx-auto text-center py-24 glass-card rounded-3xl">
              <Crown className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No membership tiers on sale right now</h2>
              <p className="text-[oklch(0.55_0.02_240)]">New tiers are being prepared. Please check back soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                const isSubmitting = initiate.isPending && pendingTier === tier.tierKey;
                return (
                  <div key={tier.id} className={`rounded-3xl p-8 relative ${tier.popular ? "membership-vip" : "glass-card"}`}>
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="badge-pill badge-gold px-5 py-2 text-sm">Most Exclusive</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tier.popular ? "bg-[var(--gold)]" : "bg-[var(--stone)]"}`}>
                        <Icon className={`w-6 h-6 ${tier.popular ? "text-[oklch(0.08_0.01_240)]" : "text-[var(--gold)]"}`} />
                      </div>
                      <div>
                        <h3 className="font-hero text-3xl tracking-widest text-white">{tier.name}</h3>
                        <p className="text-xs text-[oklch(0.55_0.02_240)] uppercase tracking-wider">Membership</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="font-hero text-5xl text-[var(--gold)]">{formatPrice(tier.price)}</span>
                      <span className="text-[oklch(0.55_0.02_240)]">{tier.period}</span>
                    </div>
                    {tier.description && (
                      <p className="text-sm text-[oklch(0.65_0.02_240)] mb-7 leading-relaxed">{tier.description}</p>
                    )}
                    {tier.perks.length > 0 && (
                      <ul className="space-y-3 mb-8">
                        {tier.perks.map((perk) => (
                          <li key={perk} className="flex items-start gap-2.5">
                            <CheckCircle className="w-4 h-4 text-[var(--gold)] mt-0.5 shrink-0" />
                            <span className="text-sm text-[oklch(0.75_0.02_240)]">{perk}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {isAuthenticated ? (
                      <button
                        className={`w-full justify-center ${tier.popular ? "btn-gold" : "btn-outline-gold"}`}
                        disabled={initiate.isPending}
                        onClick={() => {
                          setPendingTier(tier.tierKey);
                          initiate.mutate({ tierKey: tier.tierKey });
                        }}
                      >
                        {isSubmitting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                        ) : (
                          tier.cta
                        )}
                      </button>
                    ) : (
                      <a href={getLoginUrl()} className={`w-full justify-center flex items-center gap-2 ${tier.popular ? "btn-gold" : "btn-outline-gold"}`}>
                        Sign In to Subscribe
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-[oklch(0.09_0.012_240)]">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label justify-center mb-4">Side by Side</div>
            <h2 className="font-display text-3xl font-bold text-white">Feature Comparison</h2>
          </div>
          <div className="max-w-3xl mx-auto glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[var(--muted)] px-6 py-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[oklch(0.55_0.02_240)]">Feature</div>
              <div className="text-center text-xs font-bold uppercase tracking-wider text-[oklch(0.75_0.02_240)]">Regular</div>
              <div className="text-center text-xs font-bold uppercase tracking-wider text-[var(--gold)]">VIP</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 px-6 py-4 ${i % 2 === 0 ? "" : "bg-[var(--muted)/30]"}`}>
                <div className="text-sm text-[oklch(0.72_0.02_240)]">{row.feature}</div>
                <div className="text-center">
                  {typeof row.regular === "boolean" ? (
                    row.regular ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <span className="text-[oklch(0.35_0.02_240)]">—</span>
                  ) : (
                    <span className="text-xs text-[oklch(0.72_0.02_240)]">{row.regular}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof row.vip === "boolean" ? (
                    row.vip ? <CheckCircle className="w-4 h-4 text-[var(--gold)] mx-auto" /> : <span className="text-[oklch(0.35_0.02_240)]">—</span>
                  ) : (
                    <span className="text-xs text-[var(--gold)] font-semibold">{row.vip}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <div className="section-label justify-center mb-4">Got Questions?</div>
            <h2 className="font-display text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="glass-card rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
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

      {/* CTA */}
      <section className="py-16 bg-[oklch(0.09_0.012_240)]">
        <div className="container text-center">
          <Mountain className="w-12 h-12 text-[var(--gold)] mx-auto mb-5 animate-float" />
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to Join the Adventure?</h2>
          <p className="text-[oklch(0.62_0.02_240)] mb-8 max-w-md mx-auto">Start your membership today and unlock a world of adventure, community, and unforgettable experiences.</p>
          {isAuthenticated ? (
            <button className="btn-gold px-10 py-4" onClick={scrollToPricing}>Activate Membership Now</button>
          ) : (
            <a href={getLoginUrl()} className="btn-gold px-10 py-4">Create Account & Subscribe</a>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
