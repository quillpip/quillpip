"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [accountSize, setAccountSize] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_size")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.account_size != null) {
        setAccountSize(String(profile.account_size));
      }
    })();
  }, []);

  async function saveAccountSize(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ account_size: accountSize ? Number(accountSize) : null })
      .eq("id", user.id);

    if (error) setError(error.message);
    else setMessage("Saved.");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else {
      setMessage("Password updated.");
      setNewPassword("");
    }
  }

  return (
    <main className="settings-page">
      <h1>Settings</h1>

      <section>
        <h2>Account</h2>
        <p>Email: {email}</p>
      </section>

      <section>
        <h2>Starting account size</h2>
        <form onSubmit={saveAccountSize}>
          <input
            type="number"
            step="any"
            value={accountSize}
            onChange={(e) => setAccountSize(e.target.value)}
          />
          <button type="submit">Save</button>
        </form>
      </section>

      <section>
        <h2>Change password</h2>
        <form onSubmit={changePassword}>
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit">Update password</button>
        </form>
      </section>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <p>
        <a href="/settings/billing">Manage billing →</a>
      </p>
    </main>
  );
}
