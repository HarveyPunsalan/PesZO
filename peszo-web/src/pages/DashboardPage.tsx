import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePlayer } from "@/modules/player/usePlayer";
import { useBudgetSummary } from "@/modules/budget/useBudgetSummary";
import { usePortfolio, useTransactions } from "@/modules/portfolio/usePortfolio";
import { useLiabilities } from "@/modules/liabilities/useLiabilities";
import { useQuests } from "@/modules/quests/useQuests";
import { PageHeader } from "@/layouts/PageHeader";
import { ProgressRing } from "@/design-system/components/ProgressRing";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/design-system/components/card";
import { cn } from "@/utils/cn";

function getPreviousMonth(
  month: number,
  year: number
): { month: number; year: number } {
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }
  return { month: month - 1, year };
}

function computeTrend(
  current: number | undefined,
  previous: number | undefined
): { value: number; label: string } | null {
  if (current == null || previous == null || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10;
  return {
    value: rounded,
    label: `${rounded >= 0 ? "+" : ""}${rounded}% vs last month`,
  };
}

function MetricCard({
  label,
  value,
  prefix,
  suffix,
  loading,
  trend,
  invertTrend,
}: {
  label: string;
  value: number | undefined;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
  trend?: { value: number; label: string } | null;
  invertTrend?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <p className="font-body text-xs text-textSecondary uppercase tracking-wider">
          {label}
        </p>
      </CardHeader>
      <CardContent>
        <p className="font-mono text-3xl text-textPrimary">
          {loading
            ? "—"
            : value != null
              ? `${prefix ?? ""}${value.toLocaleString()}${suffix ?? ""}`
              : "—"}
        </p>
        {!loading && trend && (
          <p
            className={cn(
              "font-body text-xs mt-1",
              trend.value === 0
                ? "text-textSecondary"
                : (trend.value > 0) !== invertTrend
                  ? "text-success"
                  : "text-danger"
            )}
          >
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: player, isLoading: playerLoading } = usePlayer();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { data: liabilities, isLoading: liabilitiesLoading } = useLiabilities();
  const { data: quests, isLoading: questsLoading } = useQuests();
  const { data: budgetSummary, isLoading: budgetLoading } = useBudgetSummary(
    player?.simulation_month,
    player?.simulation_year,
  );
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(
    player?.simulation_month,
    player?.simulation_year,
  );

  // Previous month's budget data for trend comparison.
  // Mirrors peszo-api's computeNextMonth logic in reverse:
  // month 1 rolls back to month 12 of the previous year.
  const prev = player
    ? getPreviousMonth(player.simulation_month, player.simulation_year)
    : undefined;
  const { data: prevBudgetSummary } = useBudgetSummary(
    prev?.month,
    prev?.year,
  );

  // Net Worth combines data from two modules (Portfolio + Liabilities).
  // This composition happens here in the page, not inside either
  // module's hook - mirroring the backend's modular monolith rule
  // where modules never combine each other's data internally.
  const netWorth = useMemo(() => {
    const portfolioValue = portfolio?.reduce((sum, h) => sum + h.market_value, 0) ?? 0;
    const totalDebt = liabilities?.reduce((sum, l) => sum + l.balance, 0) ?? 0;
    return portfolioValue - totalDebt;
  }, [portfolio, liabilities]);

  const incomeTrend = computeTrend(
    budgetSummary?.total_income,
    prevBudgetSummary?.total_income,
  );
  const expensesTrend = computeTrend(
    budgetSummary?.total_expenses,
    prevBudgetSummary?.total_expenses,
  );
  const savingsTrend = computeTrend(
    budgetSummary?.savings_rate,
    prevBudgetSummary?.savings_rate,
  );

  const activeQuest = quests?.find((q) => q.status === "active");
  const recentTransactions = transactions?.slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        rightSlot={
          player && (
            <span className="bg-surface2 border border-borderDefault font-body text-sm text-textSecondary px-3 py-1.5 rounded-sm">
              Month {player.simulation_month}, {player.simulation_year}
            </span>
          )
        }
      />

      {/* 4 metric cards - one row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* No trend - no historical Net Worth data exists in the backend */}
        <MetricCard
          label="Net Worth"
          value={netWorth}
          prefix="₱"
          loading={playerLoading || portfolioLoading || liabilitiesLoading}
        />
        <MetricCard
          label="Monthly Income"
          value={budgetSummary?.total_income}
          prefix="₱"
          loading={budgetLoading}
          trend={incomeTrend}
        />
        <MetricCard
          label="Monthly Expenses"
          value={budgetSummary?.total_expenses}
          prefix="₱"
          loading={budgetLoading}
          trend={expensesTrend}
          invertTrend
        />
        <MetricCard
          label="Savings Rate"
          value={budgetSummary?.savings_rate}
          suffix="%"
          loading={budgetLoading}
          trend={savingsTrend}
        />
      </div>

      {/* Quest panel (col-span-3) + Health Score (col-span-2) */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        <div className="col-span-3">
          {questsLoading ? (
            <Card>
              <CardContent>
                <p className="text-sm text-textSecondary">—</p>
              </CardContent>
            </Card>
          ) : activeQuest ? (
            <Card className="border-t-2 border-gold">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="size-1.5 rounded-full bg-gold" />
                  <span className="font-body text-xs text-gold uppercase tracking-wider">
                    Active Quest
                  </span>
                </div>
                <CardTitle>{activeQuest.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-textSecondary line-clamp-2">
                  {activeQuest.scenario_text}
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  to="/quests"
                  className="text-gold text-sm font-body hover:text-goldDefault"
                >
                  Continue →
                </Link>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <p className="text-sm text-textSecondary">
                  No active quest. Visit the Quests screen to start one.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <p className="font-body text-xs text-textSecondary uppercase tracking-wider">
                Health Score
              </p>
            </CardHeader>
            <CardContent className="flex justify-center">
              {playerLoading ? (
                <p className="font-mono text-3xl text-textPrimary">—</p>
              ) : (
                <ProgressRing value={player?.health_score ?? 0} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <p className="text-sm text-textSecondary">—</p>
          ) : recentTransactions && recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-borderSubtle last:border-0"
              >
                <span className="font-body text-sm text-textPrimary">
                  {tx.asset_ticker}
                </span>
                <span className="font-body text-xs text-textSecondary">
                  {tx.type}
                </span>
                <span className="font-mono text-sm text-textPrimary">
                  ₱{tx.total_amount.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-textSecondary">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
