"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ChecklistItem = {
  id: string;
  label: string;
  position: number;
  is_active: boolean;
};

export default function ChecklistManager() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("checklist_items")
      .select("id, label, position, is_active")
      .order("position", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("checklist_items").insert({
      user_id: user.id,
      label: newLabel.trim(),
      position: items.length,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setNewLabel("");
    load();
  }

  async function toggleActive(item: ChecklistItem) {
    const supabase = createClient();
    await supabase
      .from("checklist_items")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
    load();
  }

  async function removeItem(id: string) {
    const supabase = createClient();
    await supabase.from("checklist_items").delete().eq("id", id);
    load();
  }

  if (loading) return <p className="empty-state">Loading…</p>;

  return (
    <div className="checklist-manager">
      <form onSubmit={addItem} className="checklist-add-form">
        <input
          placeholder="e.g. Checked news calendar"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {items.length === 0 && (
        <p className="empty-state">
          No checklist items yet — add the rules you want to confirm before
          every trade.
        </p>
      )}

      <ul className="checklist-items">
        {items.map((item) => (
          <li key={item.id} className={item.is_active ? "" : "inactive"}>
            <label>
              <input
                type="checkbox"
                checked={item.is_active}
                onChange={() => toggleActive(item)}
              />
              {item.label}
            </label>
            <button
              type="button"
              className="link-button"
              onClick={() => removeItem(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
