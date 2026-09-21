"use client";

import { useState } from "react";

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <main className="subscribe-page">
      <h1>Subscribe to keep journaling</h1>
      <p>Get full access to your trading journal, stats, and equity chart.</p>
      {error && <p className="form-error">{error}</p>}
      <button onClick={handleSubscribe} disabled={loading}>
        {loading ? "Redirecting…" : "Subscribe"}
      </button>
    </main>
  );
}
