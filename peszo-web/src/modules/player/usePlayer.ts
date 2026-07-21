import { useQuery } from "@tanstack/react-query";
import { getPlayerProfile } from "./player.api";

// This key is shared across every component that calls usePlayer()
// (AppLayout sidebar, DashboardPage, etc.). A mismatched key would
// create duplicate cache entries and show stale data in one location
// while the other refreshes.
export function usePlayer() {
  return useQuery({
    queryKey: ["player-profile"],
    queryFn: getPlayerProfile,
  });
}
