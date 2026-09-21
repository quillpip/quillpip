import Link from "next/link";
import ChecklistManager from "@/components/ChecklistManager";

export default function ChecklistPage() {
  return (
    <main className="journal-page">
      <header className="journal-header">
        <h1>Pre-entry checklist</h1>
        <Link href="/journal">Back to journal</Link>
      </header>
      <p className="page-intro">
        Build your own checklist — it'll show up before you log a trade, so
        you confirm you followed your own rules first.
      </p>
      <ChecklistManager />
    </main>
  );
}
