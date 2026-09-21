import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";

const faqs = [
  {
    q: "What is Quillpip?",
    a: "Quillpip is a trading journal built to help you log every trade, track your discipline, and spot the patterns behind your results.",
  },
  {
    q: "How much does it cost?",
    a: "£12.99 a month for the standard plan, with an optional multi-account add-on at an extra £14.99.",
  },
  {
    q: "Is my data private?",
    a: "Yes, your trades and account data are kept private to your account and protected at the database level.",
  },
  {
    q: "Do I need to be an experienced trader to use it?",
    a: "Not at all — Quillpip works whether you're just starting to build discipline or refining an edge you've had for years.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, cancel anytime from your account settings, no long-term contract, and you'll keep access until the end of your current billing period.",
  },
];

export default function FaqPage() {
  return (
    <>
      <MarketingHeader />
      <main className="marketing-page">
        <section className="page-hero">
          <h1>Questions, answered.</h1>
        </section>

        <section className="faq-list">
          {faqs.map((item) => (
            <div className="faq-row" key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
