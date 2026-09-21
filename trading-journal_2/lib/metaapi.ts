// Thin wrapper around MetaApi (metaapi.cloud), the bridge service that
// exposes MT5 account data over a normal REST API — MT5 itself doesn't
// accept inbound connections, so a direct integration isn't possible.
//
// Requires METAAPI_TOKEN (a platform-level API token from your MetaApi
// account) as a server-only env var. Each user's own MT5 account is
// provisioned inside your MetaApi account and referenced here only by its
// metaapi_account_id (stored in broker_connections, see the migration).
//
// NOTE: MetaApi's exact endpoint paths/regions are subject to change on
// their end — verify this against MetaApi's current REST API docs
// (https://metaapi.cloud/docs/client/) before relying on it in production,
// since I can't call their live API from here to confirm request/response
// shapes match today's version.

const METAAPI_BASE = "https://mt-client-api-v1.new-york.agiliumtrade.ai";

export type MetaApiDeal = {
  id: string;
  symbol?: string;
  type?: string; // e.g. "DEAL_TYPE_BUY" / "DEAL_TYPE_SELL"
  entryType?: string; // "DEAL_ENTRY_IN" | "DEAL_ENTRY_OUT" etc.
  profit?: number;
  volume?: number;
  price?: number;
  time?: string;
};

export async function fetchMt5Deals(
  accountId: string,
  sinceIso: string
): Promise<MetaApiDeal[]> {
  const token = process.env.METAAPI_TOKEN;
  if (!token) throw new Error("METAAPI_TOKEN is not set");

  const endTime = new Date().toISOString();
  const url = `${METAAPI_BASE}/users/current/accounts/${accountId}/history-deals/time/${sinceIso}/${endTime}`;

  const res = await fetch(url, {
    headers: { "auth-token": token },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`MetaApi request failed (${res.status}): ${body}`);
  }

  return res.json();
}

// Maps a closing MT5 deal onto our `trades` row shape. Only DEAL_ENTRY_OUT
// deals (position closes) carry a realized profit, so only those become
// journal entries — MT5 records the open and close as separate deals.
export function dealToTradeRow(deal: MetaApiDeal, userId: string) {
  const pnl = deal.profit ?? 0;
  return {
    user_id: userId,
    symbol: deal.symbol ?? "UNKNOWN",
    direction: deal.type === "DEAL_TYPE_SELL" ? "Short" : "Long",
    result: pnl > 0 ? "Win" : pnl < 0 ? "Loss" : "Breakeven",
    pnl_amount: pnl,
    entry_price: null,
    exit_price: deal.price ?? null,
    size: deal.volume ?? null,
    trade_date: (deal.time ?? new Date().toISOString()).slice(0, 10),
    metaapi_deal_id: deal.id,
    notes: "Synced automatically from MT5.",
  };
}
