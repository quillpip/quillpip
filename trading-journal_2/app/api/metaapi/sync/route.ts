import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchMt5Deals, dealToTradeRow } from "@/lib/metaapi";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: connection } = await supabase
    .from("broker_connections")
    .select("id, metaapi_account_id, last_synced_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!connection) {
    return NextResponse.json(
      { error: "No MT5 account connected yet." },
      { status: 400 }
    );
  }

  // First sync pulls the last 90 days; later syncs only pull since the
  // last successful sync, to keep this cheap.
  const since =
    connection.last_synced_at ??
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const admin = createAdminClient();

  try {
    const deals = await fetchMt5Deals(connection.metaapi_account_id, since);

    // Only closing deals carry a realized P&L — see dealToTradeRow's note.
    const closingDeals = deals.filter((d) => d.entryType === "DEAL_ENTRY_OUT");
    const rows = closingDeals.map((d) => dealToTradeRow(d, user.id));

    let inserted = 0;
    if (rows.length > 0) {
      // metaapi_deal_id has a unique index, so this is safe to re-run
      // without creating duplicate journal entries.
      const { error, count } = await admin
        .from("trades")
        .upsert(rows, { onConflict: "metaapi_deal_id", ignoreDuplicates: true, count: "exact" });

      if (error) throw error;
      inserted = count ?? rows.length;
    }

    await admin
      .from("broker_connections")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: "ok",
      })
      .eq("id", connection.id);

    return NextResponse.json({ synced: inserted });
  } catch (err: any) {
    await admin
      .from("broker_connections")
      .update({ last_sync_status: `error: ${err.message}` })
      .eq("id", connection.id);

    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
