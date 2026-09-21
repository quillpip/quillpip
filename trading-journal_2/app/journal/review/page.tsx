import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Trade = {
  id: string;
  symbol: string;
  result: string;
  pnl_amount: number;
  emotion: string | null;
  strategy: string | null;
  trade_date: string;
};

type RuleStatus = { label: string; followed: boolean };

function currentWeekStart(): string {
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - day);
  return monday.toISOString().slice(0, 10);
}

function weekEndExclusive(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default async function WeeklyReviewPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const weekStart = searchParams.week || currentWeekStart();
  const weekEnd = weekEndExclusive(weekStart);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trades } = await supabase
    .from("trades")
    .select("id, symbol, result, pnl_amount, emotion, strategy, trade_date")
    .gte("trade_date", weekStart)
    .lt("trade_date", weekEnd)
    .order("trade_date", { ascending: true })
    .returns<Trade[]>();

  const rows = trades ?? [];
  const totalPnl = rows.reduce((s, t) => s + Number(t.pnl_amount), 0);
  const wins = rows.filter((t) => t.result === "Win").length;
  const winRate = rows.length ? Math.round((wins / rows.length) * 100) : 0;

  const best = rows.length
    ? rows.reduce((a, b) => (Number(a.pnl_amount) > Number(b.pnl_amount) ? a : b))
    : null;
  const worst = rows.length
    ? rows.reduce((a, b) => (Number(a.pnl_amount) < Number(b.pnl_amount) ? a : b))
    : null;

  // Most common emotion tagged on a losing trade this week — a simple,
  // transparent signal rather than anything inferred.
  const lossEmotionCounts = new Map<string, number>();
  rows
    .filter((t) => t.result === "Loss" && t.emotion)
    .forEach((t) => {
      const key = t.emotion as string;
      lossEmotionCounts.set(key, (lossEmotionCounts.get(key) ?? 0) + 1);
    });
  const topLossEmotion = [...lossEmotionCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  let rulesFollowed: RuleStatus[] = [];
  if (user) {
    const { data: rules } = await supabase
      .from("trading_rules")
      .select("id, label")
      .eq("is_active", true);

    const { data: statuses } = await supabase
      .from("trading_rule_weekly_status")
      .select("rule_id, followed")
      .eq("week_start_date", weekStart);

    const statusMap = new Map(
      (statuses ?? []).map((s: any) => [s.rule_id, s.followed])
    );

    rulesFollowed = (rules ?? []).map((r: any) => ({
      label: r.label,
      followed: statusMap.get(r.id) ?? true,
    }));
  }
  const brokenRules = rulesFollowed.filter((r) => !r.followed);

  // The one thing to focus on: prefer a broken rule (most direct, most
  // actionable), fall back to the emotion behind this week's losses.
  let focus: string | null = null;
  if (brokenRules.length > 0) {
    focus = `You broke "${brokenRules[0].label}" this week — that's the first thing to tighten up.`;
  } else if (topLossEmotion) {
    focus = `${topLossEmotion[0]} showed up on ${topLossEmotion[1]} losing trade${
      topLossEmotion[1] === 1 ? "" : "s"
    } this week — worth watching for next week.`;
  } else if (rows.length === 0) {
    focus = "No trades logged this week.";
  } else {
    focus = "No broken rules and no repeated loss pattern this week — steady week.";
  }

  const prevWeek = new Date(weekStart + "T00:00:00Z");
  prevWeek.setUTCDate(prevWeek.getUTCDate() - 7);
  const nextWeek = new Date(weekStart + "T00:00:00Z");
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  return (
    <main className="journal-page">
      <header className="journal-header">
        <h1>Weekly review</h1>
        <Link href="/journal">Back to journal</Link>
      </header>

      <div className="calendar-nav">
        <Link href={`/journal/review?week=${prevWeek.toISOString().slice(0, 10)}`}>
          &larr; Prev week
        </Link>
        <span className="calendar-month-total">Week of {weekStart}</span>
        <Link href={`/journal/review?week=${nextWeek.toISOString().slice(0, 10)}`}>
          Next week &rarr;
        </Link>
      </div>

      <section className="stats-strip">
        <div className="stat">
          <span className="stat-label">Trades</span>
          <span className="stat-value">{rows.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Win rate</span>
          <span className="stat-value">{winRate}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">P&amp;L</span>
          <span className={`stat-value ${totalPnl >= 0 ? "positive" : "negative"}`}>
            {totalPnl >= 0 ? "+" : ""}
            {totalPnl.toFixed(2)}
          </span>
        </div>
      </section>

      <section className="review-focus">
        <h2>Focus for next week</h2>
        <p>{focus}</p>
      </section>

      <section className="review-grid">
        <div>
          <h3>What worked</h3>
          {best ? (
            <p>
              {best.symbol} on {best.trade_date}:{" "}
              <span className="positive">
                +{Number(best.pnl_amount).toFixed(2)}
              </span>
              {best.strategy ? ` (${best.strategy})` : ""}
            </p>
          ) : (
            <p className="empty-state">No trades this week.</p>
          )}
        </div>
        <div>
          <h3>What didn&rsquo;t</h3>
          {worst ? (
            <p>
              {worst.symbol} on {worst.trade_date}:{" "}
              <span className="negative">
                {Number(worst.pnl_amount).toFixed(2)}
              </span>
              {worst.strategy ? ` (${worst.strategy})` : ""}
            </p>
          ) : (
            <p className="empty-state">No trades this week.</p>
          )}
        </div>
      </section>

      <section>
        <h3>Rules this week</h3>
        {rulesFollowed.length === 0 && (
          <p className="empty-state">
            No rules set up yet — add some on the{" "}
            <Link href="/journal/rules">rules page</Link>.
          </p>
        )}
        <ul className="checklist-items">
          {rulesFollowed.map((r) => (
            <li key={r.label}>
              <span className={r.followed ? "" : "strikethrough"}>
                {r.label}
              </span>
              <span className={r.followed ? "positive" : "negative"}>
                {r.followed ? "Followed" : "Broken"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
