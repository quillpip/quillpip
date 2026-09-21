"use client";

type DayCell = {
  date: string;
  pnl: number;
  winRate: number | null;
  tradeCount: number;
};

export default function PnlCalendarGrid({
  monthLabel,
  weeks,
}: {
  monthLabel: string;
  weeks: (DayCell | null)[][];
}) {
  return (
    <div className="pnl-calendar">
      <h2>{monthLabel}</h2>
      <div className="pnl-calendar-weekdays">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="pnl-calendar-grid">
        {weeks.flat().map((day, i) =>
          day ? (
            <div
              key={day.date}
              className={`pnl-day ${
                day.tradeCount === 0
                  ? "empty"
                  : day.pnl >= 0
                  ? "profit"
                  : "loss"
              }`}
              title={
                day.tradeCount > 0
                  ? `${day.tradeCount} trade${day.tradeCount === 1 ? "" : "s"} · ${
                      day.winRate
                    }% win rate`
                  : undefined
              }
            >
              <span className="pnl-day-number">
                {Number(day.date.slice(-2))}
              </span>
              {day.tradeCount > 0 && (
                <span className="pnl-day-amount">
                  {day.pnl >= 0 ? "+" : ""}
                  {day.pnl.toFixed(0)}
                </span>
              )}
            </div>
          ) : (
            <div key={`blank-${i}`} className="pnl-day blank" />
          )
        )}
      </div>
    </div>
  );
}
