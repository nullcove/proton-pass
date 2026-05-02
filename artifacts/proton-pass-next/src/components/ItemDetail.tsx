"use client";

import { useState } from "react";
import {
  Copy, Check, Eye, EyeOff, Pin, PinOff, Trash2, X,
  Key, CreditCard, StickyNote, User, AtSign, ExternalLink,
} from "lucide-react";
import { type Item, type Vault } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import PasswordStrength from "./PasswordStrength";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function Field({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [show, setShow] = useState(false);
  if (!value) return null;
  const displayed = secret && !show ? "•".repeat(Math.min(value.length, 16)) : value;
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2 border border-border/50">
        <span className="flex-1 text-sm font-mono text-foreground break-all">{displayed}</span>
        {secret && (
          <button onClick={() => setShow(!show)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
        <CopyButton value={value} />
      </div>
    </div>
  );
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  login: Key, card: CreditCard, note: StickyNote, identity: User, alias: AtSign,
};
const TYPE_COLORS: Record<string, string> = {
  login: "text-violet-400", card: "text-sky-400", note: "text-amber-400",
  identity: "text-emerald-400", alias: "text-pink-400",
};
const VAULT_COLORS: Record<string, string> = {
  "#6D4AFF": "bg-violet-500", "#0EA5E9": "bg-sky-500", "#10B981": "bg-emerald-500",
  "#F59E0B": "bg-amber-500", "#EF4444": "bg-red-500", "#EC4899": "bg-pink-500",
};

export default function ItemDetail({
  item,
  vaults,
  onClose,
  onPin,
  onTrash,
}: {
  item: Item;
  vaults: Vault[];
  onClose: () => void;
  onPin: () => void;
  onTrash: () => void;
}) {
  const Icon = TYPE_ICONS[item.type] ?? Key;
  const vault = vaults.find((v) => v.id === item.vaultId);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className={cn("w-5 h-5", TYPE_COLORS[item.type])} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{item.title}</div>
            {vault && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn("w-2 h-2 rounded-full", VAULT_COLORS[vault.color] ?? "bg-violet-500")} />
                <span className="text-xs text-muted-foreground">{vault.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPin}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title={item.pinned ? "Unpin" : "Pin"}
          >
            {item.pinned ? <PinOff className="w-4 h-4 text-primary" /> : <Pin className="w-4 h-4" />}
          </button>
          <button
            onClick={onTrash}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
            title="Move to trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {item.type === "login" && (
          <>
            {item.username && <Field label="Username" value={item.username} />}
            {item.password && (
              <div>
                <Field label="Password" value={item.password} secret />
                {item.passwordScore && (
                  <div className="mt-2">
                    <PasswordStrength score={item.passwordScore} />
                  </div>
                )}
              </div>
            )}
            {item.urls && item.urls.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">URLs</div>
                {item.urls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2 border border-border/50 mb-1">
                    <span className="flex-1 text-sm text-foreground truncate">{url}</span>
                    <a href={url} target="_blank" rel="noreferrer" className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <CopyButton value={url} />
                  </div>
                ))}
              </div>
            )}
            {item.totp && <Field label="TOTP Secret" value={item.totp} secret />}
          </>
        )}

        {item.type === "card" && (
          <>
            {item.cardholderName && <Field label="Cardholder Name" value={item.cardholderName} />}
            {item.cardNumber && <Field label="Card Number" value={item.cardNumber} secret />}
            {item.expirationDate && <Field label="Expiration Date" value={item.expirationDate} />}
            {item.cvv && <Field label="CVV" value={item.cvv} secret />}
            {item.cardType && <Field label="Card Type" value={item.cardType} />}
          </>
        )}

        {item.type === "identity" && (
          <>
            {(item.firstName || item.lastName) && (
              <Field label="Full Name" value={[item.firstName, item.lastName].filter(Boolean).join(" ")} />
            )}
            {item.email && <Field label="Email" value={item.email} />}
            {item.phone && <Field label="Phone" value={item.phone} />}
            {item.address && <Field label="Address" value={item.address} />}
            {item.city && <Field label="City" value={item.city} />}
            {item.country && <Field label="Country" value={item.country} />}
          </>
        )}

        {item.type === "alias" && (
          <>
            {item.aliasEmail && <Field label="Alias Email" value={item.aliasEmail} />}
            {item.email && <Field label="Forward to" value={item.email} />}
          </>
        )}

        {item.note && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Note</div>
            <div className="bg-background/60 rounded-lg p-3 border border-border/50 text-sm text-foreground whitespace-pre-wrap">{item.note}</div>
          </div>
        )}

        <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
          <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
          <div>Updated: {new Date(item.updatedAt).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}
