"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { useActiveInstance } from "@/components/ActiveInstanceProvider";

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
  const { instances, activeInstance, activeInstanceId, setActiveInstanceId } =
    useActiveInstance();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <aside className="sticky top-4 flex h-[calc(100dvh-2rem)] w-60 shrink-0 flex-col rounded-card border border-black/8 bg-white/70 p-4">
      <div className="mb-5">
        <Logo size="sm" href="/dashboard" />
      </div>

      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-black/45">
        Instance
      </p>

      <div ref={rootRef} className="relative mb-6">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-left text-sm font-semibold text-black transition-colors hover:bg-black/5"
        >
          <span className="truncate">
            {activeInstance?.name ?? "Select instance"}
          </span>
          <span
            className={`shrink-0 text-black/45 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-lg border border-black/10 bg-white py-1 shadow-card"
          >
            {instances.map((instance) => {
              const selected = instance.id === activeInstanceId;
              return (
                <li key={instance.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInstanceId(instance.id);
                      setOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "bg-accent/60 font-semibold text-black"
                        : "text-black/75 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    {instance.name}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
