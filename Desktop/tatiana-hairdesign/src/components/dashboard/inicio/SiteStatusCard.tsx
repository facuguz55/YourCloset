import { toggleMaintenance } from "@/app/actions/config";
import { Globe, ShieldAlert } from "lucide-react";

interface Props {
  maintenance: boolean;
  maintenanceMsg: string;
}

export function SiteStatusCard({ maintenance, maintenanceMsg }: Props) {
  return (
    <div className="rounded-xl bg-dark-card border border-dark-border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              maintenance ? "bg-red-500/15" : "bg-emerald-500/15"
            }`}
          >
            {maintenance ? (
              <ShieldAlert className="w-5 h-5 text-red-400" />
            ) : (
              <Globe className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              Estado del sitio
            </p>
            <p className="text-xs text-muted mt-0.5">
              {maintenance
                ? `En mantenimiento${maintenanceMsg ? `: "${maintenanceMsg}"` : ""}`
                : "El sitio está en línea y visible al público"}
            </p>
          </div>
        </div>

        <form action={toggleMaintenance}>
          <button
            type="submit"
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              maintenance
                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
            }`}
          >
            {maintenance ? "Publicar sitio" : "Activar mantenimiento"}
          </button>
        </form>
      </div>
    </div>
  );
}
