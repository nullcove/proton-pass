"use client";

import { cn } from "@/lib/utils";

const SCORE_CONFIG = {
  vulnerable: { label: "Vulnerable", color: "text-red-400", bar: "bg-red-400", width: "w-1/4" },
  weak: { label: "Weak", color: "text-amber-400", bar: "bg-amber-400", width: "w-2/4" },
  strong: { label: "Strong", color: "text-sky-400", bar: "bg-sky-400", width: "w-3/4" },
  very_strong: { label: "Very Strong", color: "text-emerald-400", bar: "bg-emerald-400", width: "w-full" },
};

export default function PasswordStrength({
  score,
  entropy,
  compact = false,
}: {
  score: string;
  entropy?: number;
  compact?: boolean;
}) {
  const config = SCORE_CONFIG[score as keyof typeof SCORE_CONFIG] ?? SCORE_CONFIG.weak;

  if (compact) {
    return (
      <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
        {entropy !== undefined && (
          <span className="text-xs text-muted-foreground">{entropy} bits</span>
        )}
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", config.bar, config.width)} />
      </div>
    </div>
  );
}
