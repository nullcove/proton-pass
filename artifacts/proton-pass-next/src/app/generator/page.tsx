"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { useGeneratePassword, useGeneratePassphrase } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import PasswordStrength from "@/components/PasswordStrength";

type Mode = "password" | "passphrase";

export default function GeneratorPage() {
  const [mode, setMode] = useState<Mode>("password");
  const [generated, setGenerated] = useState<{ password: string; score: string; entropy: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const [pwLength, setPwLength] = useState(16);
  const [pwUppercase, setPwUppercase] = useState(true);
  const [pwNumbers, setPwNumbers] = useState(true);
  const [pwSymbols, setPwSymbols] = useState(true);

  const [ppWordCount, setPpWordCount] = useState(4);
  const [ppSeparator, setPpSeparator] = useState("hyphen");
  const [ppCapitalize, setPpCapitalize] = useState(true);
  const [ppNumbers, setPpNumbers] = useState(false);

  const genPassword = useGeneratePassword();
  const genPassphrase = useGeneratePassphrase();

  const generate = () => {
    if (mode === "password") {
      genPassword.mutate(
        { length: pwLength, uppercase: pwUppercase, numbers: pwNumbers, symbols: pwSymbols },
        { onSuccess: setGenerated }
      );
    } else {
      genPassphrase.mutate(
        { wordCount: ppWordCount, separator: ppSeparator, capitalize: ppCapitalize, includeNumbers: ppNumbers },
        { onSuccess: setGenerated }
      );
    }
  };

  useEffect(() => { generate(); }, [mode, pwLength, pwUppercase, pwNumbers, pwSymbols, ppWordCount, ppSeparator, ppCapitalize, ppNumbers]);

  const copy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = genPassword.isPending || genPassphrase.isPending;

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Password Generator</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Generate secure passwords and passphrases</p>
          </div>

          <div className="flex gap-2">
            {(["password", "passphrase"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize", mode === m ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent border border-border")}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 font-mono text-lg font-medium text-foreground break-all min-h-[1.75rem]">
                {isLoading ? <span className="text-muted-foreground text-sm">Generating...</span> : (generated?.password ?? "")}
              </div>
              <button onClick={copy} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={generate} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </button>
            </div>
            {generated && <PasswordStrength score={generated.score} entropy={generated.entropy} />}
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-5">
            {mode === "password" ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Length</label>
                    <span className="text-sm font-mono text-primary">{pwLength}</span>
                  </div>
                  <input type="range" min={4} max={128} value={pwLength} onChange={(e) => setPwLength(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                {[
                  { label: "Uppercase (A-Z)", value: pwUppercase, set: setPwUppercase },
                  { label: "Numbers (0-9)", value: pwNumbers, set: setPwNumbers },
                  { label: "Symbols (!@#...)", value: pwSymbols, set: setPwSymbols },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between">
                    <label className="text-sm text-foreground">{label}</label>
                    <button onClick={() => set(!value)} className={cn("w-11 h-6 rounded-full transition-colors relative", value ? "bg-primary" : "bg-muted")}>
                      <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", value ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Word Count</label>
                    <span className="text-sm font-mono text-primary">{ppWordCount}</span>
                  </div>
                  <input type="range" min={2} max={10} value={ppWordCount} onChange={(e) => setPpWordCount(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Separator</label>
                  <div className="flex gap-2 flex-wrap">
                    {["hyphen", "space", "period", "underscore", "numbers"].map((s) => (
                      <button key={s} onClick={() => setPpSeparator(s)} className={cn("px-3 py-1 rounded text-xs font-medium capitalize transition-colors", ppSeparator === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {[
                  { label: "Capitalize", value: ppCapitalize, set: setPpCapitalize },
                  { label: "Include Numbers", value: ppNumbers, set: setPpNumbers },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between">
                    <label className="text-sm text-foreground">{label}</label>
                    <button onClick={() => set(!value)} className={cn("w-11 h-6 rounded-full transition-colors relative", value ? "bg-primary" : "bg-muted")}>
                      <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", value ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
