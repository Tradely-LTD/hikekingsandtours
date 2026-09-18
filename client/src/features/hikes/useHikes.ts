import { trpc } from "@/lib/trpc";

/**
 * Centralized API hooks for the hikes feature.
 *
 * `hikes.list` takes NO input — the server ignores filtering by design, so all
 * filtering is done client-side over the returned rows.
 */
export function useHikes() {
  return trpc.hikes.list.useQuery();
}

export function useFeaturedHikes() {
  return trpc.hikes.featured.useQuery();
}

export function useHikeDetail(slug: string) {
  return trpc.hikes.bySlug.useQuery({ slug }, { enabled: !!slug });
}

/**
 * The Wednesday–Friday 11PM (WAT) window is computed server-side so a device
 * with a skewed clock or a different timezone cannot disagree with the API.
 * Refetching keeps a long-open tab from being frozen at its mount-time answer.
 */
export function useBookingWindow() {
  return trpc.hikes.checkBookingWindow.useQuery(undefined, {
    refetchInterval: 60_000, // refresh every minute
  });
}

export function useCreateBooking() {
  const utils = trpc.useUtils();
  return trpc.bookings.create.useMutation({
    onSuccess: () => {
      utils.hikes.list.invalidate();
      utils.hikes.featured.invalidate();
    },
  });
}
