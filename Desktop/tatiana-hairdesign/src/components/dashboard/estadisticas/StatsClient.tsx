"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Users, CreditCard, Eye, TrendingUp } from "lucide-react";

type Period = "hoy" | "semana" | "mes" | "trimestre" | "año";

interface Visit {
  date: string;
  unique_visitors: number;
  total_visits: number;
  source: string | null;
}

interface Membership {
  created_at: string;
  status: string;
}

interface Props {
  period: Period;
  visits: Visit[];
  memberships: Membership[];
  totalClients: number;
  activeMemberships: number;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "trimestre", label: "Trimestre" },
  { value: "año", label: "Año" },
];

const COLORS = {
  visitors: "#C9A96E",
  visits: "#dbbf88",
  memberships: "#a8854a",
};

export function StatsClient({ period, visits, memberships, totalClients, activeMemberships }: Props) {
  const [showVisitors, setShowVisitors] = useState(true);
  const [showVisits, setShowVisits] = useState(true);
  const [showMemberships, setShowMemberships] = useState(true);

  const totalVisitors = visits.reduce((s, v) => s + v.unique_visitors, 0);
  const totalVisits = visits.reduce((s, v) => s + v.total_visits, 0);
  const newMemberships = memberships.length;

  // Build chart data: merge visits and memberships by date
  const visitMap = new Map<string, { visitors: number; visits: number }>();
  visits.forEach((v) => visitMap.set(v.date, { visitors: v.unique_visitors, visits: v.total_visits }));

  const memMap = new Map<string, number>();
  memberships.forEach((m) => {
    const d = m.created_at.slice(0, 10);
    memMap.set(d, (memMap.get(d) ?? 0) + 1);
  });

  const allDates = Array.from(new Set([...visitMap.keys(), ...memMap.keys()])).sort();
  const chartData = allDates.map((date) => ({
    date,
    label: format(parseISO(date), period === "hoy" ? "HH:mm" : "d MMM", { locale: es }),
    visitors: visitMap.get(date)?.visitors ?? 0,
    visits: visitMap.get(date)?.visits ?? 0,
    memberships: memMap.get(date) ?? 0,
  }));

  const summaryCards = [
    { label: "Visitantes únicos", value: totalVisitors, icon: Eye, color: "text-gold" },
    { label: "Visitas totales", value: totalVisits, icon: TrendingUp, color: "text-gold" },
    { label: "Clientes totales", value: totalClients, icon: Users, color: "text-gold" },
    { label: "Membresías activas", value: activeMemberships, icon: CreditCard, color: "text-gold" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">Estadísticas</h1>
        {/* Period tabs */}
        <div className="flex gap-1 rounded-lg bg-dark-card border border-dark-border p-1 w-fit">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/admin/estadisticas?periodo=${p.value}`}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                period === p.value ? "bg-gold text-dark" : "text-muted hover:text-foreground"
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-xl bg-dark-card border border-dark-border p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted">{c.label}</p>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className="text-2xl font-semibold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart toggles */}
      <div className="rounded-xl bg-dark-card border border-dark-border p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <p className="text-sm font-semibold text-foreground w-full mb-1">Métricas</p>
          <button
            onClick={() => setShowVisitors((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              showVisitors
                ? "bg-gold/15 border-gold/40 text-gold"
                : "bg-transparent border-dark-border text-muted"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-gold inline-block" />
            Visitantes únicos
          </button>
          <button
            onClick={() => setShowVisits((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              showVisits
                ? "bg-gold-light/15 border-gold-light/40 text-gold-light"
                : "bg-transparent border-dark-border text-muted"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-gold-light inline-block" />
            Visitas totales
          </button>
          <button
            onClick={() => setShowMemberships((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              showMemberships
                ? "bg-gold-dark/15 border-gold-dark/40 text-gold-dark"
                : "bg-transparent border-dark-border text-muted"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-gold-dark inline-block" />
            Nuevas membresías
          </button>
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted text-sm">
            Sin datos para el período seleccionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#888888", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#888888", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#161616",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  color: "#f0f0f0",
                  fontSize: "12px",
                }}
                cursor={{ fill: "#ffffff08" }}
              />
              {showVisitors && (
                <Bar dataKey="visitors" name="Visitantes únicos" fill={COLORS.visitors} radius={[3, 3, 0, 0]} maxBarSize={40} />
              )}
              {showVisits && (
                <Bar dataKey="visits" name="Visitas totales" fill={COLORS.visits} radius={[3, 3, 0, 0]} maxBarSize={40} />
              )}
              {showMemberships && (
                <Bar dataKey="memberships" name="Nuevas membresías" fill={COLORS.memberships} radius={[3, 3, 0, 0]} maxBarSize={40} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* New memberships count */}
      <div className="rounded-xl bg-dark-card border border-dark-border p-4">
        <p className="text-sm text-muted">Nuevas membresías en el período</p>
        <p className="text-3xl font-semibold text-foreground mt-1">{newMemberships}</p>
      </div>
    </div>
  );
}
