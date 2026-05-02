import { useGetStats, useListVaults } from "@workspace/api-client-react";
import { Shield, Key, CreditCard, StickyNote, User, AtSign, AlertTriangle, RefreshCw, CheckCircle, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const VAULT_COLORS: Record<string, string> = {
  "#6D4AFF": "bg-violet-500",
  "#0EA5E9": "bg-sky-500",
  "#10B981": "bg-emerald-500",
  "#F59E0B": "bg-amber-500",
  "#EF4444": "bg-red-500",
  "#EC4899": "bg-pink-500",
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats();
  const { data: vaults = [] } = useListVaults();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const loginCount = stats?.loginCount ?? 0;
  const strongCount = stats?.strongPasswordCount ?? 0;
  const weakCount = stats?.weakPasswordCount ?? 0;
  const reusedCount = stats?.reusedPasswordCount ?? 0;

  const securityScore = Math.round(
    ((strongCount / Math.max(loginCount, 1)) * 60 +
      (reusedCount === 0 ? 25 : Math.max(0, 25 - reusedCount * 5)) +
      (weakCount === 0 ? 15 : Math.max(0, 15 - weakCount * 3))) * 100
  ) / 100;

  const scoreGrade = securityScore >= 85 ? "A" : securityScore >= 70 ? "B" : securityScore >= 55 ? "C" : securityScore >= 40 ? "D" : "F";
  const scoreColor = securityScore >= 85 ? "text-emerald-400" : securityScore >= 70 ? "text-sky-400" : securityScore >= 55 ? "text-amber-400" : "text-red-400";
  const scoreBarColor = securityScore >= 85 ? "bg-emerald-400" : securityScore >= 55 ? "bg-amber-400" : "bg-red-400";

  const typeStats = [
    { label: "Logins", count: stats?.loginCount ?? 0, icon: Key, color: "text-violet-400", href: "/vault?type=login" },
    { label: "Cards", count: stats?.cardCount ?? 0, icon: CreditCard, color: "text-sky-400", href: "/vault?type=card" },
    { label: "Notes", count: stats?.noteCount ?? 0, icon: StickyNote, color: "text-amber-400", href: "/vault?type=note" },
    { label: "Identities", count: stats?.identityCount ?? 0, icon: User, color: "text-emerald-400", href: "/vault?type=identity" },
    { label: "Aliases", count: stats?.aliasCount ?? 0, icon: AtSign, color: "text-pink-400", href: "/vault?type=alias" },
    { label: "Trashed", count: stats?.trashedCount ?? 0, icon: Trash2, color: "text-muted-foreground", href: "/trash" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{stats?.totalItems ?? 0} items across {stats?.totalVaults ?? 0} vaults</p>
        </div>

        {/* Top row */}
        <div className="grid grid-cols-5 gap-4">
          {/* Security score */}
          <div className="col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Security Score</span>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className={cn("text-6xl font-bold leading-none", scoreColor)}>{scoreGrade}</div>
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", scoreBarColor)} style={{ width: `${Math.min(securityScore, 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(securityScore)}% security health</p>
            </div>
          </div>

          {/* Type counts */}
          <div className="col-span-3 grid grid-cols-3 gap-3">
            {typeStats.map(({ label, count, icon: Icon, color, href }) => (
              <Link key={label} href={href}>
                <span className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:bg-card/80 transition-all cursor-pointer block">
                  <Icon className={cn("w-5 h-5 mb-3", color)} />
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Security alerts */}
        <div className="grid grid-cols-3 gap-4">
          <Link href="/security">
            <span className={cn("bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors block",
              weakCount > 0 ? "border-amber-500/30" : "border-border")}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Weak Passwords</span>
                <AlertTriangle className={cn("w-4 h-4", weakCount > 0 ? "text-amber-400" : "text-muted-foreground")} />
              </div>
              <div className={cn("text-3xl font-bold", weakCount > 0 ? "text-amber-400" : "text-foreground")}>{weakCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">need attention</div>
            </span>
          </Link>

          <Link href="/security">
            <span className={cn("bg-card border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors block",
              reusedCount > 0 ? "border-red-500/30" : "border-border")}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Reused Passwords</span>
                <RefreshCw className={cn("w-4 h-4", reusedCount > 0 ? "text-red-400" : "text-muted-foreground")} />
              </div>
              <div className={cn("text-3xl font-bold", reusedCount > 0 ? "text-red-400" : "text-foreground")}>{reusedCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">accounts at risk</div>
            </span>
          </Link>

          <div className={cn("bg-card border rounded-xl p-4", strongCount === loginCount && loginCount > 0 ? "border-emerald-500/20" : "border-border")}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">Strong Passwords</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400">{strongCount}</div>
            <div className="text-xs text-muted-foreground mt-0.5">of {loginCount} logins</div>
          </div>
        </div>

        {/* Vaults + Recent */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-foreground mb-4">Your Vaults</h2>
            <div className="space-y-2.5">
              {vaults.map(vault => (
                <Link key={vault.id} href={`/vault/${vault.id}`}>
                  <span className="flex items-center gap-3 hover:bg-accent rounded-lg px-2 py-1.5 -mx-2 transition-colors cursor-pointer">
                    <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", VAULT_COLORS[vault.color] ?? "bg-violet-500")} />
                    <span className="text-sm text-foreground flex-1">{vault.name}</span>
                    <span className="text-xs text-muted-foreground">{vault.itemCount} items</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-medium text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-2.5">
              {(stats?.recentActivity ?? []).slice(0, 6).map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {item.type === "login" && <Key className="w-3.5 h-3.5 text-violet-400" />}
                    {item.type === "card" && <CreditCard className="w-3.5 h-3.5 text-sky-400" />}
                    {item.type === "note" && <StickyNote className="w-3.5 h-3.5 text-amber-400" />}
                    {item.type === "identity" && <User className="w-3.5 h-3.5 text-emerald-400" />}
                    {item.type === "alias" && <AtSign className="w-3.5 h-3.5 text-pink-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {!stats?.recentActivity?.length && (
                <div className="text-sm text-muted-foreground text-center py-4">No items yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
