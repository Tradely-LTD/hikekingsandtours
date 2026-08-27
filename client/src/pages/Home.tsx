/**
 * Thin re-export wrapper — canonical implementation lives in:
 * client/src/features/landing/LandingPage.tsx
 *
 * This file exists only for backwards-compatibility with any direct imports.
 * App.tsx routes directly to the feature module.
 */
export { default } from "@/features/landing/LandingPage";
