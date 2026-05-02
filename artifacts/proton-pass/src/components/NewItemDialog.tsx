import { useState } from "react";
import { X, Eye, EyeOff, Plus, Minus } from "lucide-react";
import { useCreateItem, getListItemsQueryKey, getGetStatsQueryKey, useScorePassword } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import PasswordStrength from "./PasswordStrength";
import type { Vault } from "@workspace/api-client-react";

type ItemType = "login" | "card" | "note" | "identity" | "alias";

const TYPES: { value: ItemType; label: string }[] = [
  { value: "login", label: "Login" },
  { value: "card", label: "Credit Card" },
  { value: "note", label: "Note" },
  { value: "identity", label: "Identity" },
  { value: "alias", label: "Alias" },
];

export default function NewItemDialog({ onClose, vaults }: { onClose: () => void; vaults: Vault[] }) {
  const [type, setType] = useState<ItemType>("login");
  const [vaultId, setVaultId] = useState(vaults[0]?.id ?? 1);
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [urls, setUrls] = useState([""]);
  const [note, setNote] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [aliasEmail, setAliasEmail] = useState("");

  const qc = useQueryClient();
  const createItem = useCreateItem();
  const scorePassword = useScorePassword();
  const [pwScore, setPwScore] = useState<string | null>(null);

  async function handlePasswordChange(val: string) {
    setPassword(val);
    if (val.length > 3) {
      const result = await scorePassword.mutateAsync({ data: { password: val } });
      setPwScore(result.score);
    } else {
      setPwScore(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const filteredUrls = urls.filter(u => u.trim());
    await createItem.mutateAsync({
      data: {
        vaultId, type, title,
        ...(type === "login" && { username, password, urls: filteredUrls, note }),
        ...(type === "card" && { cardholderName, cardNumber, expirationDate, cvv, cardType: "visa" }),
        ...(type === "note" && { note }),
        ...(type === "identity" && { firstName, lastName, email, phone }),
        ...(type === "alias" && { aliasEmail, note }),
      }
    });
    qc.invalidateQueries({ queryKey: getListItemsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
    onClose();
  }

  const inputClass = "w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-foreground">New Item</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Type + Vault */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={labelClass}>Type</label>
                <select value={type} onChange={e => setType(e.target.value as ItemType)} className={inputClass}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className={labelClass}>Vault</label>
                <select value={vaultId} onChange={e => setVaultId(Number(e.target.value))} className={inputClass}>
                  {vaults.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={labelClass}>Title</label>
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="Item name" />
            </div>

            {/* Login fields */}
            {type === "login" && (
              <>
                <div>
                  <label className={labelClass}>Username / Email</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} className={inputClass} placeholder="username@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => handlePasswordChange(e.target.value)}
                      className={`${inputClass} pr-10 font-mono`}
                      placeholder="Password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwScore && <div className="mt-2"><PasswordStrength score={pwScore} /></div>}
                </div>
                <div>
                  <label className={labelClass}>URLs</label>
                  <div className="space-y-2">
                    {urls.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={url} onChange={e => { const n = [...urls]; n[i] = e.target.value; setUrls(n); }} className={`${inputClass} flex-1`} placeholder="https://example.com" />
                        {urls.length > 1 && (
                          <button type="button" onClick={() => setUrls(urls.filter((_, j) => j !== i))} className="p-2 text-muted-foreground hover:text-destructive">
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setUrls([...urls, ""])} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
                      <Plus className="w-3 h-3" /> Add URL
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Additional notes..." />
                </div>
              </>
            )}

            {/* Card fields */}
            {type === "card" && (
              <>
                <div>
                  <label className={labelClass}>Cardholder Name</label>
                  <input value={cardholderName} onChange={e => setCardholderName(e.target.value)} className={inputClass} placeholder="John Doe" />
                </div>
                <div>
                  <label className={labelClass}>Card Number</label>
                  <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} className={`${inputClass} font-mono tracking-widest`} placeholder="0000 0000 0000 0000" maxLength={19} />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className={labelClass}>Expiration</label>
                    <input value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className={inputClass} placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>CVV</label>
                    <input type="password" value={cvv} onChange={e => setCvv(e.target.value)} className={`${inputClass} font-mono`} placeholder="•••" maxLength={4} />
                  </div>
                </div>
              </>
            )}

            {/* Note fields */}
            {type === "note" && (
              <div>
                <label className={labelClass}>Content</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={6} className={`${inputClass} resize-none`} placeholder="Write your secure note here..." />
              </div>
            )}

            {/* Identity fields */}
            {type === "identity" && (
              <>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className={labelClass}>First Name</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} placeholder="John" />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Last Name</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="john@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+1 (555) 000-0000" />
                </div>
              </>
            )}

            {/* Alias fields */}
            {type === "alias" && (
              <>
                <div>
                  <label className={labelClass}>Alias Email</label>
                  <input value={aliasEmail} onChange={e => setAliasEmail(e.target.value)} className={inputClass} placeholder="alias@protonmail.com" />
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Where is this alias used?" />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm text-muted-foreground bg-muted hover:bg-accent rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || createItem.isPending}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg transition-colors"
            >
              {createItem.isPending ? "Creating..." : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
