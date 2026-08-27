import { create } from "zustand";

export type BookingDraft = {
  hikeId: number | null;
  hikeTitle: string;
  hikeDate: string;
  price: number;
  guestCount: number;
  specialRequests: string;
};

type BookingStore = {
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft) => void;
  clearDraft: () => void;
  isBookingWindowOpen: () => boolean;
};

/** Booking window: Wednesday (3), Thursday (4), Friday (5) at 23:00 WAT (UTC+1) */
function checkBookingWindow(): boolean {
  const now = new Date();
  // Convert to WAT (UTC+1)
  const watOffset = 1 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const watMinutes = (utcMinutes + watOffset) % (24 * 60);
  const watHour = Math.floor(watMinutes / 60);
  const watDay = new Date(now.getTime() + watOffset * 60000).getUTCDay(); // 0=Sun,3=Wed,4=Thu,5=Fri
  const isValidDay = watDay >= 3 && watDay <= 5;
  const isValidHour = watHour === 23;
  return isValidDay && isValidHour;
}

export const useBookingStore = create<BookingStore>()((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
  isBookingWindowOpen: checkBookingWindow,
}));
