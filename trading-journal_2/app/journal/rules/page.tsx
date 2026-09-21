import Link from "next/link";
import RulesManager from "@/components/RulesManager";

export default function RulesPage() {
  return (
    <main className="journal-page">
      <header className="journal-header">
        <h1>Trading rules</h1>
        <Link href="/journal">Back to journal</Link>
      </header>
      <RulesManager />
    </main>
  );
}
