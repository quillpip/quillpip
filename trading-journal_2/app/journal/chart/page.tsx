"use client";

import { useState } from "react";
import Link from "next/link";

export default function ChartLookupPage() {
  const [symbolInput, setSymbolInput] = useState("EURUSD");
  const [symbol, setSymbol] = useState("EURUSD");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSymbol(symbolInput.trim().toUpperCase());
  }

  // TradingView's free embeddable widget — no API key required. Symbol
  // prefix defaults to FX_IDC for forex pairs; stock/crypto tickers can be
  // typed with their own exchange prefix (e.g. NASDAQ:AAPL, BINANCE:BTCUSDT).
  const tvSymbol = symbol.includes(":") ? symbol : `FX_IDC:${symbol}`;
  const src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
    tvSymbol
  )}&interval=15&theme=dark&style=1&toolbarbg=14120d&hide_top_toolbar=0&hide_legend=0`;

  return (
    <main className="journal-page chart-page">
      <header className="journal-header">
        <h1>Live chart</h1>
        <Link href="/journal">Back to journal</Link>
      </header>

      <form onSubmit={handleSubmit} className="chart-search-form">
        <input
          value={symbolInput}
          onChange={(e) => setSymbolInput(e.target.value)}
          placeholder="EURUSD, NASDAQ:AAPL, BINANCE:BTCUSDT…"
        />
        <button type="submit">Look up</button>
      </form>

      <p className="page-intro">
        Powered by TradingView. Forex pairs default to the FX_IDC feed —
        prefix stocks or crypto with their exchange (e.g. NASDAQ:AAPL,
        BINANCE:BTCUSDT).
      </p>

      <div className="chart-embed">
        <iframe
          key={tvSymbol}
          src={src}
          title="Live chart"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </main>
  );
}
