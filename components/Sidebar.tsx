import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col rounded-card border border-black/8 bg-background p-4">
      <Link href="/" className="text-base font-bold">
        Wecare
      </Link>
    </aside>
  );
}
