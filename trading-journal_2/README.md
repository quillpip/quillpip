# Quillpip (Trading Journal)

## What's already done (Supabase project `journal`, ref `xhbuaerxplgzopijunhx`)

- `profiles`, `subscriptions`, `trades` tables, all with RLS enabled and
  per-user policies (`user_id = auth.uid()`).
- `checklist_items` — editable per-user pre-entry checklist. `trades.checklist_results`
  stores a snapshot of what was ticked at the time each trade was logged, so
  editing the checklist later doesn't rewrite journal history.
- `trading_rules` + `trading_rule_weekly_status` — each user's own list of
  rules, with a followed/broken status per rule per week. Defaults to
  followed; breaking a rule flips it for that week only, and it can be
  reticked. History persists week over week rather than resetting in place.
- A Postgres trigger creates a `profiles` row automatically on signup.
- A private `trade-photos` storage bucket with per-user-folder access
  policies (`trade-photos/{user_id}/...`).
- Subscriptions table has no client insert/update/delete policy — only the
  Stripe webhook route, using the service role key, can write to it.

## What you need to do

1. **Install dependencies**: `npm install`
2. **Fill in `.env.local`** (copy from `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
     already filled in for the `journal` project.
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase dashboard → Project Settings →
     API → service_role key. Not retrievable via tooling for security
     reasons — copy it yourself, and never commit it or expose it to the
     client.
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`,
     `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: from your Stripe dashboard. Create
     the subscription Product + Price first (£12.99/month standard, and a
     second Price for the £14.99/month multi-account add-on if you want it
     as a separate line item), then the webhook endpoint (pointing at
     `/api/stripe/webhook`) to get the signing secret.
   - `NEXT_PUBLIC_SITE_URL`: your deployed URL (or `http://localhost:3000`
     for local dev) — used to build Stripe redirect URLs.
3. **Email templates / confirm email setting**: In Supabase dashboard →
   Authentication → Providers → Email, confirm "Confirm email" is on (it is
   by default).
4. **Stripe webhook**: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   for local testing; in production, add a webhook endpoint in the Stripe
   dashboard pointed at your deployed `/api/stripe/webhook` listening for
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`.
5. **Domain + trademark**: informal web search turned up no existing
   "Quillpip" trading journal, domain, or trademark — but that's not a
   substitute for an actual purchase-time domain check and a formal UK IPO
   trademark search before you commit to the name.
6. **Run it**: `npm run dev`

## Structure

- `middleware.ts` — refreshes the Supabase session on every request and
  gates `/journal/*` on an active/trialing subscription, `/settings` and
  `/subscribe` on being logged in.
- `lib/supabase/client.ts` / `server.ts` / `admin.ts` — browser, server
  component, and service-role clients respectively. `admin.ts` is only ever
  imported by the Stripe webhook route.
- `app/api/stripe/*` — checkout, webhook (source of truth for
  `subscriptions.status`), and billing portal routes.
- `app/(marketing pages)` — `/`, `/features`, `/pricing`, `/faq`: the
  Quillpip copy, black-and-gold theme (Fraunces display type, brass-gold
  accent, ledger-style comparison rows).
- `components/TradeForm.tsx` — trade log/edit form, including the pre-entry
  checklist (pulled from `checklist_items`, snapshotted onto the trade) and
  photo upload to `trade-photos`.
- `components/WinRatePie.tsx` — win/loss/breakeven pie chart on the journal
  dashboard, via recharts.
- `app/journal/calendar` — P&L calendar, month grid colored green/red per
  day with the day's amount shown, aggregated server-side from `trades`.
- `app/journal/checklist`, `app/journal/rules` — management screens for the
  editable checklist and the weekly rules tracker.

## Not yet built

- **MetaTrader 5 auto-sync** — deliberately left out of this pass. MT5
  doesn't accept inbound connections, so this needs a bridge service (e.g.
  MetaApi) rather than a direct integration — worth scoping separately
  before building.
- **Weekly review dashboard** — described in the Features copy ("what
  worked, what didn't, and the one thing to focus on next") but not
  designed or built yet; it likely wants some editorial/summary logic, not
  just a data pull.
- **Live chart lookup** (`/journal/chart`, from the original spec) — no
  data source specified yet.
- Porting the *original* prototype's exact visual layout — no prototype
  file was ever provided, so these screens are fresh builds in the new
  theme rather than a port of specific existing markup.

