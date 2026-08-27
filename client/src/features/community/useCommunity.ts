import { trpc } from "@/lib/trpc";

/** Centralized API hooks for the community feature */
export function useLeaderboard(limit = 10) {
  return trpc.community.leaderboard.useQuery({ limit });
}

export function useChatMessages(channel = "general") {
  return trpc.community.messages.useQuery({ channel });
}

export function useSendMessage() {
  const utils = trpc.useUtils();
  return trpc.community.sendMessage.useMutation({
    onSuccess: () => {
      utils.community.messages.invalidate();
    },
  });
}

export function useLostItems(type: "lost" | "found" | "all" = "all") {
  return trpc.community.lostFound.list.useQuery({ type });
}

export function useReportLostItem() {
  const utils = trpc.useUtils();
  return trpc.community.lostFound.create.useMutation({
    onSuccess: () => {
      utils.community.lostFound.list.invalidate();
    },
  });
}
