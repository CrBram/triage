"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { CURRENT_INSTANCE } from "@/lib/instance";

const NAV = [
  { href: "/dashboard/requests", label: "Requests" },
  { href: "/dashboard/instructions", label: "Instructions" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col rounded-card border border-black/8 bg-white/70 p-4">
      <div className="mb-5">
        <Logo size="sm" href="/dashboard" />
      </div>

      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-black/45">
        Instance
      </p>
      <p className="mb-6 text-sm font-semibold text-black">
        {CURRENT_INSTANCE.name}
      </p>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-black text-background"
                  : "text-black/70 hover:bg-black/5 hover:text-black"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
