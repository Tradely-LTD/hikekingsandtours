import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Mountain, Mail, Lock, User as UserIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured, getEnabledSocialProviders } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, refresh } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [socialProviders, setSocialProviders] = useState<string[]>([]);

  // Already signed in (or just finished signing in) — nothing to do here.
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  // Only offer social buttons the project has actually enabled.
  useEffect(() => {
    let active = true;
    getEnabledSocialProviders().then((providers) => {
      if (active) setSocialProviders(providers);
    });
    return () => {
      active = false;
    };
  }, []);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            // Send the confirmation link back to the site the person signed up
            // on. Without this Supabase falls back to the project's Site URL,
            // which points at localhost by default.
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) throw error;

        // With email confirmation on, Supabase returns a user but no session,
        // so there is nothing to sign in with yet. Hand the form back in
        // sign-in mode with the password cleared, keeping the email filled in.
        if (!data.session) {
          setMode("signin");
          setPassword("");
          setFullName("");
          setNotice(
            `Account created. We sent a confirmation link to ${email} — open it, then sign in below.`
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      await refresh();
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (!supabase) return;
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Mountain className="w-10 h-10 mx-auto mb-4 text-[var(--gold)]" />
            <h1 className="text-3xl font-bold mb-2">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to book hikes, manage trips and join the community."
                : "Join thousands exploring Nigeria's best trails."}
            </p>
          </div>

          {!isSupabaseConfigured ? (
            <div
              role="alert"
              className="glass-card rounded-xl p-6 text-center border border-amber-500/40"
            >
              <AlertCircle className="w-6 h-6 mx-auto mb-3 text-amber-400" />
              <p className="font-semibold mb-1">Sign-in is not configured yet</p>
              <p className="text-sm text-muted-foreground">
                Set <code>VITE_SUPABASE_URL</code> and{" "}
                <code>VITE_SUPABASE_ANON_KEY</code>, then redeploy.
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider mb-2">
                      Full name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--gold)] focus:outline-none transition-colors"
                        placeholder="Ada Okafor"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--gold)] focus:outline-none transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-black/20 border border-white/10 focus:border-[var(--gold)] focus:outline-none transition-colors"
                      placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                    />
                  </div>
                </div>

                {error && (
                  <p role="alert" className="flex items-start gap-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </p>
                )}
                {notice && (
                  <p role="status" className="flex items-start gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{notice}</span>
                  </p>
                )}

                <button type="submit" disabled={busy} className="btn-gold w-full justify-center disabled:opacity-60">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              {socialProviders.includes("google") && (
                <>
                  <div className="flex items-center gap-3 my-5">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>

                  <button type="button" onClick={handleGoogle} className="btn-outline-gold w-full justify-center">
                    Continue with Google
                  </button>
                </>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === "signin" ? "New to Hike Kings?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                  className="text-[var(--gold)] font-semibold hover:underline"
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
