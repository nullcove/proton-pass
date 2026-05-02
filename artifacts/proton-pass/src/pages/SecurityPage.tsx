import { useState } from "react";
import { useGetStats, useGetWeakPasswords, useGetReusedPasswords } from "@workspace/api-client-react";
import { AlertTriangle, RefreshCw, CheckCircle, Shield, Key, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Item } from "@workspace/api-client-react";

const SCORE_LABELS: Record<string, string> = {
  vulnerable: "Vulnerable", weak: "Weak", strong: "Strong", very_strong: "Very Strong"
};

function ItemCard({ item }: { item: Item }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Key className="w-4 h-4 text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
        <div className="text-xs text-muted-foreground truncate">{item.username ?? ""}</div>
      </div>
      {item.passwordScore && (
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
          item.passwordScore === "vulnerable" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400")}>
          {SCORE_LABELS[item.passwordScore]}
        </span>
      )}
    </div>
  );
}

export default function SecurityPage() {
  const { data: stats } = useGetStats();
  const { data: weakPasswords = [] } = useGetWeakPasswords();
  const { data: reusedGroups = [] } = useGetReusedPasswords();
  const [activeTab, setActiveTab] = useState<"weak" | "reused">("weak");

  const securityScore = stats
    ? Math.round(
        ((stats.strongPasswordCount / Math.max(stats.loginCount, 1)) * 60 +
          (stats.reusedPasswordCount === 0 ? 25 : Math.max(0, 25 - stats.reusedPasswordCount * 5)) +
          (stats.weakPasswordCount === 0 ? 15 : Math.max(0, 15 - stats.weakPasswordCount * 3))) *
          100
      ) / 100
    : 0;

  const scoreGrade =
    securityScore >= 85 ? "A" : securityScore >= 70 ? "B" : securityScore >= 55 ? "C" : securityScore >= 40 ? "D" : "F";
  const scoreColor =
    securityScore >= 85 ? "text-emerald-400" : securityScore >= 70 ? "text-sky-400" : securityScore >= 55 ? "text-amber-400" : "text-red-400";
  const scoreBarColor =
    securityScore >= 85 ? "bg-emerald-400" : securityScore >= 70 ? "bg-sky-400" : securityScore >= 55 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Security Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor and improve your password security</p>
        </div>

        {/* Score overview */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className={cn("text-7xl font-bold leading-none", scoreColor)}>{scoreGrade}</div>
              <div className="text-xs text-muted-foreground mt-1 text-center">Security Grade</div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground">Overall Security</span>
                  <span className={scoreColor}>{Math.round(securityScore)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", scoreBarColor)} style={{ width: `${Math.min(securityScore, 100)}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{stats?.strongPasswordCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Strong</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">{stats?.weakPasswordCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Weak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{stats?.reusedPasswordCount ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Reused</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 gap-4">
          <div className={cn("bg-card border rounded-xl p-4 flex items-center gap-3",
            (stats?.weakPasswordCount ?? 0) === 0 ? "border-emerald-500/20" : "border-amber-500/30")}>
            {(stats?.weakPasswordCount ?? 0) === 0
              ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              : <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
            <div>
              <div className="text-sm font-medium text-foreground">Weak Passwords</div>
              <div className="text-xs text-muted-foreground">
                {(stats?.weakPasswordCount ?? 0) === 0 ? "All passwords are strong" : `${stats?.weakPasswordCount} passwords need attention`}
              </div>
            </div>
          </div>
          <div className={cn("bg-card border rounded-xl p-4 flex items-center gap-3",
            (stats?.reusedPasswordCount ?? 0) === 0 ? "border-emerald-500/20" : "border-red-500/30")}>
            {(stats?.reusedPasswordCount ?? 0) === 0
              ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              : <RefreshCw className="w-5 h-5 text-red-400 flex-shrink-0" />}
            <div>
              <div className="text-sm font-medium text-foreground">Reused Passwords</div>
              <div className="text-xs text-muted-foreground">
                {(stats?.reusedPasswordCount ?? 0) === 0 ? "No reused passwords found" : `${stats?.reusedPasswordCount} accounts share passwords`}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("weak")}
              className={cn("flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === "weak" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
            >
              Weak Passwords
              {weakPasswords.length > 0 && (
                <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{weakPasswords.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reused")}
              className={cn("flex-1 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === "reused" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
            >
              Reused Passwords
              {reusedGroups.length > 0 && (
                <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{reusedGroups.length}</span>
              )}
            </button>
          </div>

          <div className="divide-y divide-border">
            {activeTab === "weak" && (
              weakPasswords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mb-3" />
                  <p className="text-sm font-medium text-foreground">No weak passwords</p>
                  <p className="text-xs text-muted-foreground mt-1">All your passwords are strong</p>
                </div>
              ) : (
                weakPasswords.map(item => <ItemCard key={item.id} item={item} />)
              )
            )}

            {activeTab === "reused" && (
              reusedGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mb-3" />
                  <p className="text-sm font-medium text-foreground">No reused passwords</p>
                  <p className="text-xs text-muted-foreground mt-1">All passwords are unique</p>
                </div>
              ) : (
                reusedGroups.map((group, i) => (
                  <div key={i} className="p-4">
                    <div className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3" />
                      Shared password — {group.length} accounts
                    </div>
                    <div className="space-y-1 pl-2 border-l-2 border-red-500/30">
                      {group.map(item => <ItemCard key={item.id} item={item} />)}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
