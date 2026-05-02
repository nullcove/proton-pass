"use client";

import { AlertTriangle, RefreshCw, Key, Shield } from "lucide-react";
import { useGetStats, useGetWeakPasswords, useGetReusedPasswords, type Item } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import PasswordStrength from "@/components/PasswordStrength";

function ItemCard({ item }: { item: Item }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Key className="w-4 h-4 text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
        {item.username && <div className="text-xs text-muted-foreground truncate">{item.username}</div>}
      </div>
      {item.passwordScore && (
        <PasswordStrength score={item.passwordScore} compact />
      )}
    </div>
  );
}

export default function SecurityPage() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: weakItems = [], isLoading: weakLoading } = useGetWeakPasswords();
  const { data: reusedGroups = [], isLoading: reusedLoading } = useGetReusedPasswords();

  const isLoading = statsLoading || weakLoading || reusedLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading security report...</span>
          </div>
        </div>
      </Layout>
    );
  }

  const loginCount = stats?.loginCount ?? 0;
  const strongCount = stats?.strongPasswordCount ?? 0;
  const securityScore = Math.round(
    ((strongCount / Math.max(loginCount, 1)) * 60 +
      (reusedGroups.length === 0 ? 25 : Math.max(0, 25 - reusedGroups.length * 5)) +
      (weakItems.length === 0 ? 15 : Math.max(0, 15 - weakItems.length * 3))) * 100
  ) / 100;

  const scoreGrade = securityScore >= 85 ? "A" : securityScore >= 70 ? "B" : securityScore >= 55 ? "C" : securityScore >= 40 ? "D" : "F";
  const scoreColor = securityScore >= 85 ? "text-emerald-400" : securityScore >= 70 ? "text-sky-400" : securityScore >= 55 ? "text-amber-400" : "text-red-400";

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Security Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Monitor and improve your password security</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-6">
            <div className={cn("text-7xl font-bold leading-none", scoreColor)}>{scoreGrade}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground mb-1">Overall Security Grade</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className={cn("h-full rounded-full transition-all", securityScore >= 85 ? "bg-emerald-400" : securityScore >= 55 ? "bg-amber-400" : "bg-red-400")}
                  style={{ width: `${Math.min(securityScore, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{Math.round(securityScore)}% of passwords are strong</p>
            </div>
            <Shield className="w-8 h-8 text-muted-foreground/30" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Weak Passwords", count: weakItems.length, color: weakItems.length > 0 ? "text-amber-400" : "text-emerald-400", border: weakItems.length > 0 ? "border-amber-500/30" : "border-border" },
              { label: "Reused Passwords", count: reusedGroups.reduce((acc, g) => acc + g.length, 0), color: reusedGroups.length > 0 ? "text-red-400" : "text-emerald-400", border: reusedGroups.length > 0 ? "border-red-500/30" : "border-border" },
              { label: "Strong Passwords", count: strongCount, color: "text-emerald-400", border: "border-emerald-500/20" },
            ].map(({ label, count, color, border }) => (
              <div key={label} className={cn("bg-card border rounded-xl p-4", border)}>
                <div className={cn("text-3xl font-bold", color)}>{count}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>

          {weakItems.length > 0 && (
            <div className="bg-card border border-amber-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-foreground">Weak Passwords ({weakItems.length})</h2>
              </div>
              <div className="space-y-2">
                {weakItems.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {reusedGroups.length > 0 && (
            <div className="bg-card border border-red-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-semibold text-foreground">Reused Passwords ({reusedGroups.length} groups)</h2>
              </div>
              <div className="space-y-4">
                {reusedGroups.map((group, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-xs text-muted-foreground px-1">{group.length} accounts share the same password</div>
                    {group.map((item) => <ItemCard key={item.id} item={item} />)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {weakItems.length === 0 && reusedGroups.length === 0 && (
            <div className="bg-card border border-emerald-500/20 rounded-xl p-8 text-center">
              <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <div className="text-sm font-medium text-foreground mb-1">All passwords look secure!</div>
              <div className="text-xs text-muted-foreground">No weak or reused passwords detected.</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
