import { useState } from "react";
import { Copy, Eye, EyeOff, ExternalLink, Pin, Trash2, RotateCcw, Check, Edit2, X, Save } from "lucide-react";
import {
  useUpdateItem, useTrashItem, useRestoreItem, usePinItem, useDeleteItem,
  getListItemsQueryKey, getGetStatsQueryKey, getGetWeakPasswordsQueryKey,
  getGetReusedPasswordsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import PasswordStrength from "./PasswordStrength";
import type { Item, Vault } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function SecretField({ label, value, mono = true }: { label: string; value?: string | null; mono?: boolean }) {
  const [show, setShow] = useState(false);
  if (!value) return null;
  return (
    <div className="group">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
        <span className={cn("flex-1 text-sm text-foreground break-all", mono && "font-mono")}>
          {show ? value : "•".repeat(Math.min(value.length, 20))}
        </span>
        <button onClick={() => setShow(!show)} className="text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
        <span className={cn("flex-1 text-sm text-foreground break-all", mono && "font-mono")}>{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  login: "Login", card: "Credit Card", note: "Secure Note", identity: "Identity", alias: "Email Alias"
};

export default function ItemDetail({ item, onClose, vaults }: { item: Item; onClose: () => void; vaults: Vault[] }) {
  const qc = useQueryClient();
  const trashItem = useTrashItem();
  const restoreItem = useRestoreItem();
  const pinItem = usePinItem();
  const deleteItem = useDeleteItem();
  const updateItem = useUpdateItem();

  function invalidate() {
    qc.invalidateQueries({ queryKey: getListItemsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetWeakPasswordsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetReusedPasswordsQueryKey() });
  }

  async function handleTrash() {
    await trashItem.mutateAsync({ itemId: item.id });
    invalidate();
    onClose();
  }

  async function handleRestore() {
    await restoreItem.mutateAsync({ itemId: item.id });
    invalidate();
    onClose();
  }

  async function handlePin() {
    await pinItem.mutateAsync({ itemId: item.id, data: { pinned: !item.pinned } });
    invalidate();
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this item? This cannot be undone.")) return;
    await deleteItem.mutateAsync({ itemId: item.id });
    invalidate();
    onClose();
  }

  const vault = vaults.find(v => v.id === item.vaultId);

  return (
    <div className="h-full flex flex-col border-l border-border bg-card min-w-0">
      {/* Header */}
      <div className="flex items-start gap-3 p-5 border-b border-border flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-muted-foreground">{TYPE_LABELS[item.type]}</span>
            {item.pinned && <span className="text-xs text-primary">Pinned</span>}
            {vault && <span className="text-xs text-muted-foreground">· {vault.name}</span>}
          </div>
          <h2 className="font-semibold text-foreground text-base truncate">{item.title}</h2>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={handlePin} title={item.pinned ? "Unpin" : "Pin"} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-accent transition-colors">
            <Pin className={cn("w-4 h-4", item.pinned && "text-primary fill-primary")} />
          </button>
          {item.trashed ? (
            <>
              <button onClick={handleRestore} title="Restore" className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-400 hover:bg-accent transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} title="Delete permanently" className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={handleTrash} title="Move to trash" className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Login */}
        {item.type === "login" && (
          <>
            <Field label="Username" value={item.username} />
            <SecretField label="Password" value={item.password} />
            {item.passwordScore && (
              <div className="px-3 py-2 bg-muted rounded-lg">
                <PasswordStrength score={item.passwordScore} />
              </div>
            )}
            {item.urls && item.urls.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">URLs</div>
                <div className="space-y-1.5">
                  {item.urls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm text-foreground truncate">{url}</span>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <CopyButton value={url} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Card */}
        {item.type === "card" && (
          <>
            <Field label="Cardholder" value={item.cardholderName} />
            <SecretField label="Card Number" value={item.cardNumber} mono />
            <div className="flex gap-3">
              <div className="flex-1">
                <Field label="Expiration" value={item.expirationDate} />
              </div>
              <div className="flex-1">
                <SecretField label="CVV" value={item.cvv} mono />
              </div>
            </div>
            <Field label="Type" value={item.cardType} />
          </>
        )}

        {/* Note */}
        {item.type === "note" && item.note && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Content</div>
            <div className="bg-muted rounded-lg p-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {item.note}
            </div>
          </div>
        )}

        {/* Identity */}
        {item.type === "identity" && (
          <>
            <Field label="First Name" value={item.firstName} />
            <Field label="Last Name" value={item.lastName} />
            <Field label="Email" value={item.email} />
            <Field label="Phone" value={item.phone} />
            <Field label="Address" value={item.address} />
            <Field label="City" value={item.city} />
            <Field label="Country" value={item.country} />
          </>
        )}

        {/* Alias */}
        {item.type === "alias" && (
          <>
            <Field label="Alias Email" value={item.aliasEmail} />
          </>
        )}

        {/* Note (shared) */}
        {item.type !== "note" && item.note && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Notes</div>
            <div className="bg-muted rounded-lg p-3 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {item.note}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="pt-2 border-t border-border space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Created</span>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Modified</span>
            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
