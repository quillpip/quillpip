import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";

const features = [
  {
    title: "Trade logging",
    body: "Log every trade in seconds: instrument, entry, exit, size, result, and your reasoning, all in one clean entry, so nothing gets left to memory.",
  },
  {
    title: "Emotion and rule tagging",
    body: "Tag how you felt and which rule you followed or broke on every trade. That's where the real pattern lives, not just in the numbers.",
  },
  {
    title: "Visual analytics",
    body: "See your win rate by instrument, by session, by emotion, broken down in clear pie charts, so you know exactly where your edge is and where it's leaking.",
  },
  {
    title: "Multiple accounts",
    tag: "Add-on",
    body: "Track a prop firm account, a personal account, and a demo, all under one login. View them separately or combine them for the full picture.",
  },
  {
    title: "Weekly review dashboard",
    body: "A clean summary of the week: what worked, what didn't, and the one thing to focus on next.",
  },
  {
    title: "Profit & loss calendar",
    body: "Your month, at a glance. A calendar that turns green on your profitable days and red on the rest, with the exact amount made or lost sitting right on the date, so you can spot a rough patch or a hot streak without digging through a single trade.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <MarketingHeader />
      <main className="marketing-page">
        <section className="page-hero">
          <h1>Everything your trading needs, nothing it doesn&rsquo;t.</h1>
        </section>

        <section className="feature-list">
          {features.map((f) => (
            <div className="feature-row" key={f.title}>
              <h3>
                {f.title}
                {f.tag && <span className="tag">{f.tag}</span>}
              </h3>
              <p>{f.body}</p>
            </div>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
