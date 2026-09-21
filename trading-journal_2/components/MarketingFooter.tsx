import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <span className="wordmark small">Quillpip</span>
      <nav className="marketing-nav">
        <Link href="/features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">FAQ</Link>
      </nav>
      <span className="footer-note">Trade with discipline. Journal with clarity.</span>
    </footer>
  );
}
