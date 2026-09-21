import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WinRatePie from "@/components/WinRatePie";

type Trade = {
  id: string;
  symbol: string;
  direction: string;
  result: string;
  pnl_amount: number;
  trade_date: string;
};

export default async function JournalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trades } = await supabase
    .from("trades")
    .select("id, symbol, direction, result, pnl_amount, trade_date")
    .order("trade_date", { ascending: false })
    .returns<Trade[]>();

  const rows = trades ?? [];
  const totalPnl = rows.reduce((sum, t) => sum + Number(t.pnl_amount), 0);
  const wins = rows.filter((t) => t.result === "Win").length;
  const losses = rows.filter((t) => t.result === "Loss").length;
  const breakeven = rows.filter((t) => t.result === "Breakeven").length;
  const winRate = rows.length ? Math.round((wins / rows.length) * 100) : 0;

  return (
    <main className="journal-page">
      <header className="journal-header">
        <h1>Journal</h1>
        <div className="journal-header-actions">
          <Link href="/journal/calendar">Calendar</Link>
          <Link href="/journal/review">Review</Link>
          <Link href="/journal/chart">Chart</Link>
          <Link href="/journal/checklist">Checklist</Link>
          <Link href="/journal/rules">Rules</Link>
          <Link href="/journal/trade/new" className="button">
            + Log trade
          </Link>
        </div>
      </header>

      <section className="stats-strip">
        <div className="stat">
          <span className="stat-label">Total trades</span>
          <span className="stat-value">{rows.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Win rate</span>
          <span className="stat-value">{winRate}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total P&L</span>
          <span className={`stat-value ${totalPnl >= 0 ? "positive" : "negative"}`}>
            {totalPnl >= 0 ? "+" : ""}
            {totalPnl.toFixed(2)}
          </span>
        </div>
      </section>

      <section className="win-rate-section">
        <h2>Win rate</h2>
        <WinRatePie wins={wins} losses={losses} breakeven={breakeven} />
      </section>

      <section className="trade-list">
        {rows.length === 0 && (
          <p className="empty-state">
            No trades yet. <Link href="/journal/trade/new">Log your first one</Link>.
          </p>
        )}
        {rows.map((trade) => (
          <Link
            key={trade.id}
            href={`/journal/trade/${trade.id}`}
            className="trade-row"
          >
            <span className="trade-symbol">{trade.symbol}</span>
            <span className="trade-direction">{trade.direction}</span>
            <span className="trade-date">{trade.trade_date}</span>
            <span
              className={`trade-pnl ${
                Number(trade.pnl_amount) >= 0 ? "positive" : "negative"
              }`}
            >
              {Number(trade.pnl_amount) >= 0 ? "+" : ""}
              {Number(trade.pnl_amount).toFixed(2)}
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
