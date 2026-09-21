"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Rule = { id: string; label: string; is_active: boolean };
type WeeklyStatus = { rule_id: string; followed: boolean };

// Returns the Monday of the current week as YYYY-MM-DD (UTC).
function currentWeekStart(): string {
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - day);
  return monday.toISOString().slice(0, 10);
}

export default function RulesManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [statusByRule, setStatusByRule] = useState<Record<string, boolean>>({});
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const weekStart = currentWeekStart();

  async function load() {
    const supabase = createClient();
    const { data: ruleRows } = await supabase
      .from("trading_rules")
      .select("id, label, is_active")
      .order("position", { ascending: true });

    const { data: statusRows } = await supabase
      .from("trading_rule_weekly_status")
      .select("rule_id, followed")
      .eq("week_start_date", weekStart)
      .returns<WeeklyStatus[]>();

    setRules(ruleRows ?? []);
    const map: Record<string, boolean> = {};
    (statusRows ?? []).forEach((s) => {
      map[s.rule_id] = s.followed;
    });
    setStatusByRule(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("trading_rules").insert({
      user_id: user.id,
      label: newLabel.trim(),
      position: rules.length,
    });

    if (error) {
      setError(error.message);
      return;
    }
    setNewLabel("");
    load();
  }

  async function removeRule(id: string) {
    const supabase = createClient();
    await supabase.from("trading_rules").delete().eq("id", id);
    load();
  }

  // followed defaults to true until a rule is explicitly marked broken.
  function isFollowed(ruleId: string) {
    return statusByRule[ruleId] ?? true;
  }

  async function toggleFollowed(ruleId: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const nextFollowed = !isFollowed(ruleId);

    await supabase.from("trading_rule_weekly_status").upsert(
      {
        user_id: user.id,
        rule_id: ruleId,
        week_start_date: weekStart,
        followed: nextFollowed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "rule_id,week_start_date" }
    );

    setStatusByRule((s) => ({ ...s, [ruleId]: nextFollowed }));
  }

  if (loading) return <p className="empty-state">Loading…</p>;

  return (
    <div className="checklist-manager">
      <form onSubmit={addRule} className="checklist-add-form">
        <input
          placeholder="e.g. No trading in the first 15 minutes"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <button type="submit">Add rule</button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {rules.length === 0 && (
        <p className="empty-state">
          No rules yet — add the ones you're holding yourself to this week.
        </p>
      )}

      <p className="page-intro">
        Week of {weekStart}. Cross off a rule the moment you break it — retick
        it once you're back on track. Past weeks stay in your history.
      </p>

      <ul className="checklist-items">
        {rules.map((rule) => {
          const followed = isFollowed(rule.id);
          return (
            <li key={rule.id} className={followed ? "" : "rule-broken"}>
              <label>
                <input
                  type="checkbox"
                  checked={followed}
                  onChange={() => toggleFollowed(rule.id)}
                />
                <span className={followed ? "" : "strikethrough"}>
                  {rule.label}
                </span>
              </label>
              <button
                type="button"
                className="link-button"
                onClick={() => removeRule(rule.id)}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
