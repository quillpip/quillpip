"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ChecklistItem = { id: string; label: string };

type TradeFormValues = {
  id?: string;
  symbol: string;
  direction: "Long" | "Short";
  result: "Win" | "Loss" | "Breakeven";
  pnl_amount: string;
  entry_price: string;
  exit_price: string;
  size: string;
  risk_percent: string;
  strategy: string;
  emotion: string;
  discipline: string;
  notes: string;
  trade_date: string;
};

const emptyForm: TradeFormValues = {
  symbol: "",
  direction: "Long",
  result: "Win",
  pnl_amount: "",
  entry_price: "",
  exit_price: "",
  size: "",
  risk_percent: "",
  strategy: "",
  emotion: "",
  discipline: "3",
  notes: "",
  trade_date: new Date().toISOString().slice(0, 10),
};

export default function TradeForm({
  initial,
}: {
  initial?: Partial<TradeFormValues>;
}) {
  const [values, setValues] = useState<TradeFormValues>({
    ...emptyForm,
    ...initial,
  });
  const [entryPhoto, setEntryPhoto] = useState<File | null>(null);
  const [exitPhoto, setExitPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("checklist_items")
        .select("id, label")
        .eq("is_active", true)
        .order("position", { ascending: true });
      setChecklistItems(data ?? []);
    })();
  }, []);

  function update<K extends keyof TradeFormValues>(key: K, val: TradeFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function uploadPhoto(userId: string, file: File, label: string) {
    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${label}-${file.name}`;
    const { error } = await supabase.storage
      .from("trade-photos")
      .upload(path, file, { upsert: false });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("trade-photos").getPublicUrl(path);
    // Bucket is private, so this "public" URL only resolves for signed
    // requests in production setups using signed URLs — swap getPublicUrl
    // for createSignedUrl if you need time-limited links instead.
    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not logged in.");
      setSaving(false);
      return;
    }

    try {
      let entry_photo_url: string | undefined;
      let exit_photo_url: string | undefined;
      if (entryPhoto) entry_photo_url = await uploadPhoto(user.id, entryPhoto, "entry");
      if (exitPhoto) exit_photo_url = await uploadPhoto(user.id, exitPhoto, "exit");

      const payload = {
        user_id: user.id,
        symbol: values.symbol,
        direction: values.direction,
        result: values.result,
        pnl_amount: Number(values.pnl_amount),
        entry_price: values.entry_price ? Number(values.entry_price) : null,
        exit_price: values.exit_price ? Number(values.exit_price) : null,
        size: values.size ? Number(values.size) : null,
        risk_percent: values.risk_percent ? Number(values.risk_percent) : null,
        strategy: values.strategy || null,
        emotion: values.emotion || null,
        discipline: values.discipline ? Number(values.discipline) : null,
        notes: values.notes || null,
        trade_date: values.trade_date,
        checklist_results: checklistItems.length
          ? checklistItems.map((item) => ({
              id: item.id,
              label: item.label,
              checked: !!checked[item.id],
            }))
          : null,
        ...(entry_photo_url ? { entry_photo_url } : {}),
        ...(exit_photo_url ? { exit_photo_url } : {}),
      };

      const { error } = values.id
        ? await supabase.from("trades").update(payload).eq("id", values.id)
        : await supabase.from("trades").insert(payload);

      if (error) throw error;

      router.push("/journal");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save trade.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="trade-form">
      {checklistItems.length > 0 && (
        <div className="full-width pre-entry-checklist">
          <span className="checklist-heading">Pre-entry checklist</span>
          {checklistItems.map((item) => (
            <label key={item.id} className="checklist-checkbox-row">
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={(e) =>
                  setChecked((c) => ({ ...c, [item.id]: e.target.checked }))
                }
              />
              {item.label}
            </label>
          ))}
        </div>
      )}

      <label>
        Symbol
        <input
          required
          value={values.symbol}
          onChange={(e) => update("symbol", e.target.value)}
        />
      </label>

      <label>
        Direction
        <select
          value={values.direction}
          onChange={(e) => update("direction", e.target.value as "Long" | "Short")}
        >
          <option value="Long">Long</option>
          <option value="Short">Short</option>
        </select>
      </label>

      <label>
        Result
        <select
          value={values.result}
          onChange={(e) =>
            update("result", e.target.value as "Win" | "Loss" | "Breakeven")
          }
        >
          <option value="Win">Win</option>
          <option value="Loss">Loss</option>
          <option value="Breakeven">Breakeven</option>
        </select>
      </label>

      <label>
        P&amp;L amount
        <input
          type="number"
          step="0.01"
          required
          value={values.pnl_amount}
          onChange={(e) => update("pnl_amount", e.target.value)}
        />
      </label>

      <label>
        Entry price
        <input
          type="number"
          step="any"
          value={values.entry_price}
          onChange={(e) => update("entry_price", e.target.value)}
        />
      </label>

      <label>
        Exit price
        <input
          type="number"
          step="any"
          value={values.exit_price}
          onChange={(e) => update("exit_price", e.target.value)}
        />
      </label>

      <label>
        Size (lots)
        <input
          type="number"
          step="any"
          value={values.size}
          onChange={(e) => update("size", e.target.value)}
        />
      </label>

      <label>
        Risk %
        <input
          type="number"
          step="any"
          value={values.risk_percent}
          onChange={(e) => update("risk_percent", e.target.value)}
        />
      </label>

      <label>
        Strategy
        <input
          value={values.strategy}
          onChange={(e) => update("strategy", e.target.value)}
        />
      </label>

      <label>
        Emotion
        <input
          value={values.emotion}
          onChange={(e) => update("emotion", e.target.value)}
        />
      </label>

      <label>
        Discipline (1–5)
        <input
          type="number"
          min={1}
          max={5}
          value={values.discipline}
          onChange={(e) => update("discipline", e.target.value)}
        />
      </label>

      <label>
        Trade date
        <input
          type="date"
          required
          value={values.trade_date}
          onChange={(e) => update("trade_date", e.target.value)}
        />
      </label>

      <label className="full-width">
        Notes
        <textarea
          rows={4}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </label>

      <label>
        Entry photo
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setEntryPhoto(e.target.files?.[0] ?? null)}
        />
      </label>

      <label>
        Exit photo
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setExitPhoto(e.target.files?.[0] ?? null)}
        />
      </label>

      {error && <p className="form-error full-width">{error}</p>}

      <button type="submit" disabled={saving} className="full-width">
        {saving ? "Saving…" : values.id ? "Save changes" : "Log trade"}
      </button>
    </form>
  );
}
