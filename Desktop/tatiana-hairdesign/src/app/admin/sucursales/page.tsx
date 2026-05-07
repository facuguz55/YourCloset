import { MapPin } from "lucide-react";

export default function SucursalesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center">
        <MapPin className="w-8 h-8 text-gold" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Sucursales</h1>
      <p className="text-muted text-sm max-w-xs">
        La gestión de sucursales se hace desde Configuración.
      </p>
    </div>
  );
}
