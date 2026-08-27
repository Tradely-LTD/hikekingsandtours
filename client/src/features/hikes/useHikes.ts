import { trpc } from "@/lib/trpc";

/** Centralized API hook for the hikes feature */
export function useHikes(filters?: { category?: string; difficulty?: string }) {
  return trpc.hikes.list.useQuery(filters ?? {});
}

export function useHikeDetail(slug: string) {
  return trpc.hikes.bySlug.useQuery({ slug }, { enabled: !!slug });
}

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
    },
  });
}
