import type { ReactNode } from "react";

// PageHeader does NOT fetch or compute any badge content itself.
// The month/year shown anywhere in this app must always come from
// Player.simulation_month / simulation_year - it reflects the
// simulation's own internal calendar, which only advances when
// the player clicks Advance Month, and must NEVER be tied to
// the real-world system date. Pages pass real data via rightSlot.
interface PageHeaderProps {
  title: string;
  rightSlot?: ReactNode;
}

export function PageHeader({ title, rightSlot }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6 mb-6 border-b border-borderSubtle">
      <h1 className="font-heading text-xl text-textPrimary">{title}</h1>
      {rightSlot}
    </div>
  );
}
