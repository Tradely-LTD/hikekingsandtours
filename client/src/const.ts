export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** In-app sign-in route. */
export const LOGIN_PATH = "/login";

/**
 * Where to send someone who needs to sign in.
 *
 * Authentication is Supabase Auth, served by our own /login page, so this is a
 * local path rather than a third-party redirect. Kept as a function because the
 * call sites across the app already use it this way.
 */
export const getLoginUrl = () => LOGIN_PATH;
