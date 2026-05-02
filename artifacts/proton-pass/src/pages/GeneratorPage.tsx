import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw, Wand2 } from "lucide-react";
import { useGeneratePassword, useGeneratePassphrase, useScorePassword } from "@workspace/api-client-react";
import PasswordStrength from "@/components/PasswordStrength";
import { cn } from "@/lib/utils";

type Mode = "password" | "passphrase";
const SEPARATORS = [
  { value: "hyphen", label: "Hyphen (-)" },
  { value: "space", label: "Space ( )" },
  { value: "period", label: "Period (.)" },
  { value: "underscore", label: "Underscore (_)" },
  { value: "numbers", label: "Numbers (1)" },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={cn("w-9 h-5 rounded-full transition-colors relative flex-shrink-0", checked ? "bg-primary" : "bg-muted")}
        onClick={() => onChange(!checked)}
      >
        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

export default function GeneratorPage() {
  const [mode, setMode] = useState<Mode>("password");
  const [generated, setGenerated] = useState("");
  const [score, setScore] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Password config
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  // Passphrase config
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("hyphen");
  const [capitalize, setCapitalize] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(false);

  const generatePassword = useGeneratePassword();
  const generatePassphrase = useGeneratePassphrase();
  const scorePassword = useScorePassword();

  async function handleGenerate() {
    let result;
    if (mode === "password") {
      result = await generatePassword.mutateAsync({ data: { length, uppercase, numbers, symbols } });
    } else {
      result = await generatePassphrase.mutateAsync({ data: { wordCount, separator: separator as "hyphen" | "space" | "period" | "underscore" | "numbers", capitalize, includeNumbers } });
    }
    setGenerated(result.password);
    setScore(result.score);
  }

  async function handleCheckCustom(val: string) {
    setGenerated(val);
    if (val.length > 3) {
      const result = await scorePassword.mutateAsync({ data: { password: val } });
      setScore(result.score);
    } else {
      setScore(null);
    }
  }

  function copy() {
    if (!generated) return;
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = generatePassword.isPending || generatePassphrase.isPending;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Password Generator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generate strong, secure passwords and passphrases</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {(["password", "passphrase"] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Generated output */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                readOnly
                value={generated}
                placeholder={mode === "password" ? "Click Generate to create a password" : "Click Generate to create a passphrase"}
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary pr-10"
                onChange={e => handleCheckCustom(e.target.value)}
              />
            </div>
            <button
              onClick={copy}
              disabled={!generated}
              className="px-4 py-3 bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors disabled:opacity-40"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 font-medium text-sm"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Generate
            </button>
          </div>
          {score && <PasswordStrength score={score} />}
        </div>

        {/* Config panel */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <h2 className="text-sm font-medium text-foreground">Configuration</h2>

          {mode === "password" && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-foreground">Length</label>
                  <span className="text-sm font-medium text-primary">{length}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={128}
                  value={length}
                  onChange={e => setLength(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>4</span><span>128</span>
                </div>
              </div>
              <div className="space-y-3">
                <Toggle checked={uppercase} onChange={setUppercase} label="Uppercase letters (A-Z)" />
                <Toggle checked={numbers} onChange={setNumbers} label="Numbers (0-9)" />
                <Toggle checked={symbols} onChange={setSymbols} label="Symbols (!@#$...)" />
              </div>
            </div>
          )}

          {mode === "passphrase" && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-foreground">Word Count</label>
                  <span className="text-sm font-medium text-primary">{wordCount}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={wordCount}
                  onChange={e => setWordCount(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>2</span><span>10</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Separator</label>
                <select
                  value={separator}
                  onChange={e => setSeparator(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {SEPARATORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Toggle checked={capitalize} onChange={setCapitalize} label="Capitalize words" />
                <Toggle checked={includeNumbers} onChange={setIncludeNumbers} label="Append numbers" />
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-foreground mb-3">Password Tips</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span><span>Use at least 16 characters for strong security</span></li>
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span><span>Mix uppercase, lowercase, numbers, and symbols</span></li>
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span><span>Never reuse passwords across different sites</span></li>
            <li className="flex gap-2"><span className="text-primary mt-0.5">•</span><span>Passphrases with 5+ words are both strong and memorable</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
