"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  BarChart2,
  ShoppingBag,
  Calendar,
  CreditCard,
  Tag,
  Users,
  Globe,
  MapPin,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/actions/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    items: [
      { label: "Inicio", href: "/admin/inicio", icon: LayoutDashboard },
    ],
  },
  {
    title: "Estadísticas",
    items: [
      { label: "Visión general", href: "/admin/estadisticas", icon: BarChart2 },
    ],
  },
  {
    title: "Gestión",
    items: [
      { label: "Ventas", href: "/admin/ventas", icon: ShoppingBag },
      { label: "Turnos", href: "/admin/turnos", icon: Calendar },
      { label: "Membresías", href: "/admin/membresias", icon: CreditCard },
      { label: "Descuentos", href: "/admin/descuentos", icon: Tag },
      { label: "Clientes", href: "/admin/clientes", icon: Users },
    ],
  },
  {
    title: "Sitio web",
    items: [
      { label: "Página pública", href: "/", icon: Globe },
      { label: "Sucursales", href: "/admin/sucursales", icon: MapPin },
      { label: "Configuración", href: "/admin/configuracion", icon: Settings },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/admin/inicio" && pathname.startsWith(item.href));
  const Icon = item.icon;

  const isExternal = item.href === "/";

  return (
    <Link
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      className={clsx(
        "flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-gold/10 text-gold font-medium"
          : "text-muted hover:bg-dark-alt hover:text-foreground"
      )}
    >
      <Icon className={clsx("size-4 shrink-0", isActive ? "text-gold" : "text-muted-dark")} />
      {item.label}
    </Link>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-dark-border bg-darker transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-dark-border px-4">
          <div style={{ fontFamily: "var(--font-playfair)" }}>
            <span className="text-sm font-bold italic text-gold">Tatiana</span>
            <span className="ml-1 text-xs text-muted-dark tracking-wide">Admin</span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:text-foreground lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((group, i) => (
            <div key={i} className={i > 0 ? "mt-4" : ""}>
              {group.title && (
                <p className="mb-1 px-3 text-[10px] font-semibold tracking-[0.18em] text-muted-dark uppercase">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-dark-border p-2">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-muted transition-colors hover:bg-dark-alt hover:text-foreground"
            >
              <LogOut className="size-4 text-muted-dark" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
