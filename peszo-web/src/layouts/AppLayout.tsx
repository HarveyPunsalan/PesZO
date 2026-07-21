import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAdvanceMonth } from "@/hooks/useAdvanceMonth";
import { usePlayer } from "@/modules/player/usePlayer";
import type { AxiosError } from "axios";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Quests", to: "/quests", icon: Target },
  { label: "Budget", to: "/budget", icon: Wallet },
  { label: "Portfolio", to: "/portfolio", icon: TrendingUp },
  { label: "Liabilities", to: "/liabilities", icon: TrendingDown },
  { label: "Simulation", to: "/simulation", icon: RefreshCw },
];

export function AppLayout() {
  const { mutate: advance, isPending, error } = useAdvanceMonth();
  const { data: player, isLoading: playerLoading } = usePlayer();

  return (
    <div className="h-screen overflow-hidden flex">
      <aside className="w-60 bg-surface1 border-r border-borderSubtle flex flex-col justify-between">
        <div>
          <div className="px-4 py-6 font-heading text-xl text-textPrimary">
            Pes<span className="text-gold">Z</span>O
          </div>

          <nav className="overflow-y-auto">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 h-11 text-sm font-body transition-colors",
                    isActive
                      ? "bg-surface2 border-l-[3px] border-gold text-textPrimary"
                      : "text-textSecondary hover:text-textPrimary hover:bg-surface2/50"
                  )
                }
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-borderSubtle p-4">
          <button
            onClick={() => advance()}
            disabled={isPending}
            className="mx-4 w-[calc(100%-2rem)] bg-gold text-base font-bold uppercase h-11 rounded-sm font-body text-sm disabled:opacity-50"
          >
            {isPending ? "Advancing..." : "Advance Month"}
          </button>
          {error && (
            <p className="mx-4 mt-2 text-danger text-xs">
              {/* Backend error handler returns { success: false, error: string, timestamp: string }
               * - the key is "error", not "message". Asymmetric with the success shape
               * ({ success: true, data: T, timestamp: string }) by design: the error-handler
               * middleware in peszo-api/src/middleware/error-handler.ts serializes AppError
               * messages into the "error" key, while controllers use successResponse() which
               * wraps payloads in "data". */}
              {(error as AxiosError<{ success: boolean; error: string }>).response?.data?.error
                ?? "Failed to advance month"}
            </p>
          )}

          <div className="flex justify-between px-4 py-2 font-body text-xs text-textSecondary">
            <span>{playerLoading ? "..." : player?.name ?? "Player"}</span>
            <span>
              {playerLoading ? "..." : player ? `Month ${player.simulation_month}` : "—"}
            </span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-base p-8">
        <Outlet />
      </main>
    </div>
  );
}
