"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Home, Library, Radio, Search, Settings, type LucideIcon } from "lucide-react";
import { motion as tokens } from "@learnyou/ui-tokens";
import { cn } from "@/lib/cn";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/channels", label: "Channels", icon: Radio },
  { href: "/search", label: "YouTube search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Floating macOS-style dock with magnetic magnification. */
export function Dock() {
  const mouseX = useMotionValue(Infinity);
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-5 z-40 flex justify-center"
    >
      <motion.ul
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="glass-strong flex items-end gap-2 rounded-[22px] px-3 py-2.5"
      >
        {ITEMS.map((item) => (
          <DockItem key={item.href} {...item} mouseX={mouseX} />
        ))}
      </motion.ul>
    </nav>
  );
}

function DockItem({
  href,
  label,
  icon: Icon,
  mouseX,
}: (typeof ITEMS)[number] & { mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const size = useSpring(useTransform(distance, [-120, 0, 120], [44, 60, 44]), tokens.spring.snappy);

  return (
    <li className="relative">
      <motion.div style={{ width: size, height: size }}>
        <Link
          ref={ref}
          href={href}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group flex size-full items-center justify-center rounded-2xl transition-colors",
            active ? "bg-white/15 text-white light:bg-black/5 light:text-ink-900" : "text-muted hover:text-[var(--fg)]",
          )}
        >
          <Icon className="size-[45%]" strokeWidth={1.75} />
          <span className="glass pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {label}
          </span>
        </Link>
      </motion.div>
      {active && (
        <motion.span
          layoutId="dock-active"
          className="absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[var(--fg)]"
        />
      )}
    </li>
  );
}
