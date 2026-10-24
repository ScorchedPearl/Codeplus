"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CalendarDays, LayoutDashboard, PartyPopper, Trophy, Users } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: PartyPopper },
  { href: "/admin/timetable", label: "Timetable & batches", icon: CalendarDays },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin/members", label: "Members", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
              active ? "bg-brand-tint text-brand" : "text-ink-soft hover:bg-surface",
            )}
          >
            <Icon size={16} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
