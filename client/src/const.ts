export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Standalone deployments may omit the OAuth variables during the first deploy;
// keep the public app renderable and use the Manus application portal as a safe fallback.
const DEFAULT_OAUTH_PORTAL_URL = "https://manus.im";

export const resolveOAuthPortalUrl = (configuredPortalUrl?: string) => {
  try {
    return new URL(
      "/app-auth",
      configuredPortalUrl?.trim() || DEFAULT_OAUTH_PORTAL_URL
    ).toString();
  } catch {
    return new URL("/app-auth", DEFAULT_OAUTH_PORTAL_URL).toString();
  }
};

export const getLoginUrl = () => {
  const appId = import.meta.env.VITE_APP_ID?.trim() ?? "";
  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL || window.location.origin
  ).replace(/\/$/, "");
  const redirectUri = `${apiBaseUrl}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(
    resolveOAuthPortalUrl(import.meta.env.VITE_OAUTH_PORTAL_URL)
  );

  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
