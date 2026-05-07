"use client";

import { useState, useTransition } from "react";
import { updateMultipleConfigs, toggleMaintenance } from "@/app/actions/config";
import type { SiteConfigMap } from "@/types/database";
import { Globe, ShieldAlert, MessageSquare } from "lucide-react";

interface Props {
  config: SiteConfigMap;
}

function Field({
  label,
  name,
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50 resize-none"
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-dark-alt border border-dark-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-gold/50"
        />
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-dark-card border border-dark-border p-4 space-y-4">
      <h2 className="font-semibold text-foreground text-sm border-b border-dark-border pb-2">{title}</h2>
      {children}
    </div>
  );
}

export function ConfigClient({ config }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [maintenance, setMaintenance] = useState(config.maintenance_mode === "true");

  const [fields, setFields] = useState({
    hero_title: config.hero_title ?? "",
    hero_subtitle: config.hero_subtitle ?? "",
    about_text: config.about_text ?? "",
    maintenance_message: config.maintenance_message ?? "",
    instagram_url: config.instagram_url ?? "https://www.instagram.com/tatianamartinezestilista.ok",
    whatsapp_larioja: config.whatsapp_larioja ?? "5493424368868",
    whatsapp_miraflores: config.whatsapp_miraflores ?? "5493424216359",
    whatsapp_moreno: config.whatsapp_moreno ?? "5493424443516",
    branch_larioja_address: config.branch_larioja_address ?? "La Rioja 2718 | Centro",
    branch_miraflores_address: config.branch_miraflores_address ?? "Complejo Miraflores",
    branch_moreno_address: config.branch_moreno_address ?? "Moreno 2599",
  });

  function set(key: keyof typeof fields) {
    return (v: string) => setFields((prev) => ({ ...prev, [key]: v }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateMultipleConfigs(fields);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleToggleMaintenance() {
    setMaintenance((prev) => !prev);
    startTransition(async () => {
      await toggleMaintenance();
    });
  }

  return (
    <div className="space-y-6">
      {/* Mantenimiento */}
      <Section title="Estado del sitio">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${maintenance ? "bg-red-500/15" : "bg-emerald-500/15"}`}>
              {maintenance ? <ShieldAlert className="w-5 h-5 text-red-400" /> : <Globe className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{maintenance ? "Sitio en mantenimiento" : "Sitio activo"}</p>
              <p className="text-xs text-muted">{maintenance ? "El sitio no es visible al público" : "El sitio es visible al público"}</p>
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            disabled={isPending}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
              maintenance ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
            }`}
          >
            {maintenance ? "Publicar sitio" : "Activar mantenimiento"}
          </button>
        </div>
        <Field
          label="Mensaje de mantenimiento"
          name="maintenance_message"
          value={fields.maintenance_message}
          onChange={set("maintenance_message")}
          placeholder="Estamos mejorando el sitio. Volvemos pronto."
        />
      </Section>

      {/* Textos Hero */}
      <Section title="Página principal — Hero">
        <Field label="Título principal" name="hero_title" value={fields.hero_title} onChange={set("hero_title")} placeholder="Tatiana Martinez Hair Design" />
        <Field label="Subtítulo" name="hero_subtitle" value={fields.hero_subtitle} onChange={set("hero_subtitle")} multiline placeholder="Unimos belleza, formación y crecimiento." />
      </Section>

      {/* About */}
      <Section title="Sección Sobre Tatiana">
        <Field label="Texto" name="about_text" value={fields.about_text} onChange={set("about_text")} multiline placeholder="Más de 20 años de experiencia…" />
      </Section>

      {/* Redes */}
      <Section title="Redes sociales">
        <Field label="URL Instagram" name="instagram_url" value={fields.instagram_url} onChange={set("instagram_url")} />
      </Section>

      {/* Sucursales */}
      <Section title="Sucursales — Contacto">
        <div className="space-y-3">
          <p className="text-xs text-muted flex items-center gap-1"><MessageSquare className="w-3 h-3" /> La Rioja 2718</p>
          <Field label="Dirección" name="branch_larioja_address" value={fields.branch_larioja_address} onChange={set("branch_larioja_address")} />
          <Field label="WhatsApp (solo número, sin +)" name="whatsapp_larioja" value={fields.whatsapp_larioja} onChange={set("whatsapp_larioja")} placeholder="5493424368868" />
        </div>
        <div className="space-y-3 pt-3 border-t border-dark-border">
          <p className="text-xs text-muted flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Miraflores</p>
          <Field label="Dirección" name="branch_miraflores_address" value={fields.branch_miraflores_address} onChange={set("branch_miraflores_address")} />
          <Field label="WhatsApp" name="whatsapp_miraflores" value={fields.whatsapp_miraflores} onChange={set("whatsapp_miraflores")} placeholder="5493424216359" />
        </div>
        <div className="space-y-3 pt-3 border-t border-dark-border">
          <p className="text-xs text-muted flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Moreno 2599</p>
          <Field label="Dirección" name="branch_moreno_address" value={fields.branch_moreno_address} onChange={set("branch_moreno_address")} />
          <Field label="WhatsApp" name="whatsapp_moreno" value={fields.whatsapp_moreno} onChange={set("whatsapp_moreno")} placeholder="5493424443516" />
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-gold text-dark px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors disabled:opacity-60"
        >
          {isPending ? "Guardando…" : "Guardar todos los cambios"}
        </button>
        {saved && <p className="text-xs text-emerald-400">Configuración guardada</p>}
      </div>
    </div>
  );
}
