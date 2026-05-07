"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Hoy", value: "hoy" },
  { label: "Ayer", value: "ayer" },
  { label: "Esta semana", value: "semana" },
] as const;

interface Props {
  current: "hoy" | "ayer" | "semana";
}

export function PeriodTabs({ current }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-dark-card p-1 w-fit border border-dark-border">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={`/admin/inicio?periodo=${tab.value}`}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            current === tab.value
              ? "bg-gold text-dark"
              : "text-muted hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
