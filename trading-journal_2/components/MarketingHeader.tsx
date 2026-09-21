import Link from "next/link";

export default function MarketingHeader() {
  return (
    <header className="marketing-header">
      <Link href="/" className="wordmark">
        Quillpip
      </Link>
      <nav className="marketing-nav">
        <Link href="/features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/login">Log in</Link>
        <Link href="/signup" className="button">
          Sign up
        </Link>
      </nav>
    </header>
  );
}
