import { useQuery } from "@tanstack/react-query";
import { getQuests } from "./quests.api";

// Shared between DashboardPage (active quest preview) and the future
// Quests page. Status is computed server-side, so the frontend just
// renders what it receives - no client-side status logic needed.
export function useQuests() {
  return useQuery({
    queryKey: ["quests"],
    queryFn: getQuests,
  });
}
