import { Calendar } from "lucide-react";

export default function TurnosPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center">
        <Calendar className="w-8 h-8 text-gold" />
      </div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Turnos</h1>
      <p className="text-muted text-sm max-w-xs">
        El módulo de turnos estará disponible próximamente.
      </p>
    </div>
  );
}
