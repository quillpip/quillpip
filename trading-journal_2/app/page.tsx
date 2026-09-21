import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";

const problems = [
  "You take another trade to chase back a loss.",
  "You size up when it's personal, not when the setup earns it.",
  "You tell yourself you'll log it later, then the details are gone.",
];

const beforeAfter = [
  {
    before:
      "Trades scattered across screenshots, notes apps, and a spreadsheet you update once a week if you're lucky.",
    after:
      "Every trade in one place, tagged and timestamped, ready to review the moment the market closes.",
  },
  {
    before: "You remember how a trade felt for about a day, then it blurs into the rest.",
    after:
      "Your emotions and reasoning captured trade by trade, so the pattern's still visible weeks later.",
  },
  {
    before: "Reviewing means scrolling back through weeks of mess.",
    after: "Clean analytics that show your real edge, not just your win rate.",
  },
];

const teasers = [
  {
    title: "Discipline tracking",
    body: "See exactly where your rules break down, not just where the trade lost.",
  },
  {
    title: "Visual analytics",
    body: "Turn a month of scattered trades into charts that show your actual edge.",
  },
  {
    title: "Multiple accounts",
    body: "Prop firm account, personal account, demo, all organized under one login.",
  },
];

export default function LandingPage() {
  return (
    <>
      <MarketingHeader />
      <main className="marketing-page">
        <section className="hero">
          <p className="kicker">Built for traders who break their own rules.</p>
          <h1>
            Trade with discipline.
            <br />
            Journal with clarity.
          </h1>
          <p className="subheading">
            Quillpip is the trading journal built for traders who take their edge
            seriously. Log every trade, track your discipline, and see the
            patterns your emotions have been hiding from you.
          </p>
          <div className="cta-row">
            <Link href="/signup" className="button">
              Sign up
            </Link>
            <Link href="/features">See how it works</Link>
          </div>
        </section>

        <section className="problem-callout">
          {problems.map((line) => (
            <p key={line} className="problem-line">
              {line}
            </p>
          ))}
        </section>

        <section className="ledger-compare">
          <div className="ledger-compare-head">
            <span>Old way</span>
            <span className="gold">With Quillpip</span>
          </div>
          {beforeAfter.map((row) => (
            <div className="ledger-compare-row" key={row.before}>
              <p className="old-way">{row.before}</p>
              <p className="with-quillpip">{row.after}</p>
            </div>
          ))}
        </section>

        <section className="teaser-grid">
          {teasers.map((t) => (
            <div className="teaser-card" key={t.title}>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
