"use client";

import { useState, useTransition } from "react";
import { Menu, Power } from "lucide-react";
import { toggleMaintenance } from "@/app/actions/config";

interface TopbarProps {
  onMenuClick: () => void;
  maintenanceMode: boolean;
  userEmail: string;
}

export function Topbar({ onMenuClick, maintenanceMode, userEmail }: TopbarProps) {
  const [isPending, startTransition] = useTransition();
  const [maintenance, setMaintenance] = useState(maintenanceMode);

  function handleToggle() {
    const next = !maintenance;
    setMaintenance(next);
    startTransition(async () => {
      await toggleMaintenance(next);
    });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-dark-border bg-darker px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded p-1.5 text-muted hover:bg-dark-alt hover:text-foreground lg:hidden"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Toggle mantenimiento */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          title={maintenance ? "Sitio en mantenimiento — clic para activar" : "Sitio activo — clic para mantenimiento"}
          className="flex items-center gap-2 rounded border border-dark-border px-2.5 py-1.5 text-xs transition-colors hover:border-gold/30 disabled:opacity-50"
        >
          <Power
            className={`size-3.5 ${maintenance ? "text-red-400" : "text-green-400"}`}
          />
          <span className={maintenance ? "text-red-400" : "text-green-400"}>
            {maintenance ? "Mantenimiento" : "Sitio activo"}
          </span>
        </button>

        {/* User */}
        <span className="hidden text-xs text-muted-dark sm:block">
          {userEmail}
        </span>
      </div>
    </header>
  );
}
