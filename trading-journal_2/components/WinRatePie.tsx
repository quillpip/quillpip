"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS: Record<string, string> = {
  Win: "#7fa66b",
  Loss: "#b5453a",
  Breakeven: "#c8a44d",
};

export default function WinRatePie({
  wins,
  losses,
  breakeven,
}: {
  wins: number;
  losses: number;
  breakeven: number;
}) {
  const data = [
    { name: "Win", value: wins },
    { name: "Loss", value: losses },
    { name: "Breakeven", value: breakeven },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="empty-state">Log a trade to see your win rate.</p>;
  }

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} stroke="#0a0906" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#14120d",
              border: "1px solid #2e2812",
              borderRadius: 4,
              color: "#ede6d6",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-legend">
        {data.map((d) => (
          <span key={d.name} className="pie-legend-item">
            <span
              className="pie-legend-dot"
              style={{ background: COLORS[d.name] }}
            />
            {d.name} ({d.value})
          </span>
        ))}
      </div>
    </div>
  );
}
