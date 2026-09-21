import Link from "next/link";
import MarketingHeader from "@/components/MarketingHeader";
import MarketingFooter from "@/components/MarketingFooter";

export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <main className="marketing-page">
        <section className="page-hero">
          <h1>Simple pricing. Serious tools.</h1>
        </section>

        <section className="pricing-grid">
          <div className="price-card">
            <h2>Standard plan</h2>
            <p className="price">
              &pound;12.99<span>/month</span>
            </p>
            <p>
              Every core feature, unlimited trade logging, full analytics, and
              your complete trading history.
            </p>
            <Link href="/signup" className="button">
              Sign up
            </Link>
          </div>

          <div className="price-card addon">
            <h2>Multi-account add-on</h2>
            <p className="price">
              +&pound;14.99<span>/month</span>
            </p>
            <p>
              Trading more than one account? Add multi-account tracking for an
              extra &pound;14.99 a month, on top of your Quillpip plan.
            </p>
            <p className="price-total">Total for both: &pound;27.98/month</p>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
