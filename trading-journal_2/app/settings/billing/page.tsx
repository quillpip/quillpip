"use client";

import { useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <main className="settings-page">
      <h1>Billing</h1>
      <p>Manage your subscription, payment method, and invoices via Stripe.</p>
      {error && <p className="form-error">{error}</p>}
      <button onClick={openPortal} disabled={loading}>
        {loading ? "Opening…" : "Open billing portal"}
      </button>
    </main>
  );
}
