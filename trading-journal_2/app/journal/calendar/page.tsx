import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PnlCalendarGrid from "@/components/PnlCalendarGrid";

type Trade = {
  trade_date: string;
  pnl_amount: number;
  result: string;
};

function buildMonthGrid(
  year: number,
  month: number, // 0-indexed
  byDay: Map<string, { pnl: number; wins: number; count: number }>
) {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  // Monday-first weekday index (0 = Mon .. 6 = Sun)
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7;

  const cells: ({ date: string; pnl: number; winRate: number | null; tradeCount: number } | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const agg = byDay.get(dateStr);
    cells.push({
      date: dateStr,
      pnl: agg?.pnl ?? 0,
      tradeCount: agg?.count ?? 0,
      winRate: agg && agg.count > 0 ? Math.round((agg.wins / agg.count) * 100) : null,
    });
  }

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return weeks;
}

export default async function PnlCalendarPage({
  searchParams,
}: {
  searchParams: { y?: string; m?: string };
}) {
  const now = new Date();
  const year = searchParams.y ? Number(searchParams.y) : now.getUTCFullYear();
  const month = searchParams.m ? Number(searchParams.m) - 1 : now.getUTCMonth();

  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const nextMonth = month === 11 ? { y: year + 1, m: 1 } : { y: year, m: month + 2 };
  const monthEnd = `${nextMonth.y}-${String(nextMonth.m).padStart(2, "0")}-01`;

  const supabase = createClient();
  const { data: trades } = await supabase
    .from("trades")
    .select("trade_date, pnl_amount, result")
    .gte("trade_date", monthStart)
    .lt("trade_date", monthEnd)
    .returns<Trade[]>();

  const byDay = new Map<string, { pnl: number; wins: number; count: number }>();
  for (const t of trades ?? []) {
    const existing = byDay.get(t.trade_date) ?? { pnl: 0, wins: 0, count: 0 };
    existing.pnl += Number(t.pnl_amount);
    existing.count += 1;
    if (t.result === "Win") existing.wins += 1;
    byDay.set(t.trade_date, existing);
  }

  const weeks = buildMonthGrid(year, month, byDay);
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const prev = month === 0 ? { y: year - 1, m: 12 } : { y: year, m: month };
  const next = month === 11 ? { y: year + 1, m: 1 } : { y: year, m: month + 2 };

  const monthTotal = Array.from(byDay.values()).reduce((sum, d) => sum + d.pnl, 0);

  return (
    <main className="journal-page">
      <header className="journal-header">
        <h1>P&amp;L calendar</h1>
        <Link href="/journal">Back to journal</Link>
      </header>

      <div className="calendar-nav">
        <Link href={`/journal/calendar?y=${prev.y}&m=${prev.m}`}>&larr; Prev</Link>
        <span
          className={`calendar-month-total ${
            monthTotal >= 0 ? "positive" : "negative"
          }`}
        >
          {monthTotal >= 0 ? "+" : ""}
          {monthTotal.toFixed(2)}
        </span>
        <Link href={`/journal/calendar?y=${next.y}&m=${next.m}`}>Next &rarr;</Link>
      </div>

      <PnlCalendarGrid monthLabel={monthLabel} weeks={weeks} />
    </main>
  );
}
