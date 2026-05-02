import { cn } from "@/lib/utils";

const SCORES = {
  vulnerable: { label: "Vulnerable", width: "w-1/4", color: "score-bg-vulnerable" },
  weak: { label: "Weak", width: "w-2/4", color: "score-bg-weak" },
  strong: { label: "Strong", width: "w-3/4", color: "score-bg-strong" },
  very_strong: { label: "Very Strong", width: "w-full", color: "score-bg-very_strong" },
};

export default function PasswordStrength({ score }: { score?: string | null }) {
  if (!score) return null;
  const info = SCORES[score as keyof typeof SCORES];
  if (!info) return null;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Strength</span>
        <span className={cn("font-medium", `score-${score}`)}>{info.label}</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", info.width, info.color)} />
      </div>
    </div>
  );
}
