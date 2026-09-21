import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TradeForm from "@/components/TradeForm";

export default async function EditTradePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: trade } = await supabase
    .from("trades")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!trade) notFound();

  return (
    <main className="trade-page">
      <h1>Edit trade</h1>
      <TradeForm
        initial={{
          id: trade.id,
          symbol: trade.symbol,
          direction: trade.direction,
          result: trade.result,
          pnl_amount: String(trade.pnl_amount ?? ""),
          entry_price: String(trade.entry_price ?? ""),
          exit_price: String(trade.exit_price ?? ""),
          size: String(trade.size ?? ""),
          risk_percent: String(trade.risk_percent ?? ""),
          strategy: trade.strategy ?? "",
          emotion: trade.emotion ?? "",
          discipline: String(trade.discipline ?? "3"),
          notes: trade.notes ?? "",
          trade_date: trade.trade_date,
        }}
      />
    </main>
  );
}
