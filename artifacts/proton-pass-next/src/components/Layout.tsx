"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, LayoutDashboard, Key, Trash2, Wand2, ShieldAlert, Plus, ChevronDown, ChevronRight,
} from "lucide-react";
import { useListVaults } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import NewItemDialog from "./NewItemDialog";
import NewVaultDialog from "./NewVaultDialog";

const VAULT_COLOR_MAP: Record<string, string> = {
  "#6D4AFF": "bg-violet-500",
  "#0EA5E9": "bg-sky-500",
  "#10B981": "bg-emerald-500",
  "#F59E0B": "bg-amber-500",
  "#EF4444": "bg-red-500",
  "#EC4899": "bg-pink-500",
};

function vaultDot(color: string) {
  return VAULT_COLOR_MAP[color] ?? "bg-violet-500";
}

function NavLink({ href, label, icon: Icon, isActive }: {
  href: string; label: string; icon: React.ElementType; isActive: boolean;
}) {
  return (
    <Link href={href}>
      <span className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
      )}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        {label}
      </span>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [vaultsOpen, setVaultsOpen] = useState(true);
  const [showNewItem, setShowNewItem] = useState(false);
  const [showNewVault, setShowNewVault] = useState(false);
  const { data: vaults = [] } = useListVaults();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vault", label: "All Items", icon: Key },
    { href: "/generator", label: "Password Generator", icon: Wand2 },
    { href: "/security", label: "Security Center", icon: ShieldAlert },
    { href: "/trash", label: "Trash", icon: Trash2 },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-60 flex-shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide text-sidebar-foreground">
              Proton Pass
            </span>
          </div>
        </div>

        <div className="px-3 py-3">
          <button
            onClick={() => setShowNewItem(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Item
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {navItems.map(({ href, label, icon }) => (
            <NavLink key={href} href={href} label={label} icon={icon} isActive={isActive(href)} />
          ))}

          <div className="pt-3">
            <div className="flex items-center justify-between px-3 py-1.5">
              <button
                onClick={() => setVaultsOpen(!vaultsOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-sidebar-foreground transition-colors"
              >
                {vaultsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                VAULTS
              </button>
              <button
                onClick={() => setShowNewVault(true)}
                className="p-0.5 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors"
                title="New vault"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {vaultsOpen && (
              <div className="mt-1 space-y-0.5">
                {vaults.map((vault) => (
                  <Link key={vault.id} href={`/vault/${vault.id}`}>
                    <span className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
                      pathname === `/vault/${vault.id}`
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}>
                      <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", vaultDot(vault.color))} />
                      <span className="truncate flex-1">{vault.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{vault.itemCount}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {children}
      </main>

      {showNewItem && <NewItemDialog onClose={() => setShowNewItem(false)} vaults={vaults} />}
      {showNewVault && <NewVaultDialog onClose={() => setShowNewVault(false)} />}
    </div>
  );
}
