"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { CURRENT_INSTANCE } from "@/lib/instance";

const NAV = [
  {
    href: "/dashboard/requests",
    label: "Requests",
    icon: "/request_icon.svg",
  },
  {
    href: "/dashboard/instructions",
    label: "Instructions",
    icon: "/settings_icon.svg",
  },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-4 flex h-[calc(100dvh-2rem)] w-60 shrink-0 flex-col rounded-card border border-black/8 bg-white/70 p-4">
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
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-accent text-black"
                  : "text-black/70 hover:bg-black/5 hover:text-black"
              }`}
            >
              <Image
                src={icon}
                alt=""
                width={16}
                height={16}
                className="size-4 shrink-0 opacity-80"
                aria-hidden
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
