"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCreateItem, type Vault } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type ItemType = "login" | "card" | "note" | "identity" | "alias";

const TYPES: { key: ItemType; label: string }[] = [
  { key: "login", label: "Login" },
  { key: "card", label: "Credit Card" },
  { key: "note", label: "Secure Note" },
  { key: "identity", label: "Identity" },
  { key: "alias", label: "Email Alias" },
];

export default function NewItemDialog({
  onClose,
  vaults,
}: {
  onClose: () => void;
  vaults: Vault[];
}) {
  const [type, setType] = useState<ItemType>("login");
  const [title, setTitle] = useState("");
  const [vaultId, setVaultId] = useState(vaults[0]?.id ?? 0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [aliasEmail, setAliasEmail] = useState("");

  const createItem = useCreateItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !vaultId) return;

    const base = { vaultId, type, title: title.trim(), note: note || undefined };

    let extra: Record<string, unknown> = {};
    if (type === "login") {
      extra = { username: username || undefined, password: password || undefined, urls: url ? [url] : undefined };
    } else if (type === "card") {
      extra = { cardholderName: cardholderName || undefined, cardNumber: cardNumber || undefined, expirationDate: expirationDate || undefined, cvv: cvv || undefined };
    } else if (type === "identity") {
      extra = { firstName: firstName || undefined, lastName: lastName || undefined, email: email || undefined, phone: phone || undefined, address: address || undefined, city: city || undefined, country: country || undefined };
    } else if (type === "alias") {
      extra = { aliasEmail: aliasEmail || undefined, email: email || undefined };
    }

    await createItem.mutateAsync({ ...base, ...extra } as Parameters<typeof createItem.mutateAsync>[0]);
    onClose();
  };

  const Field = ({ label, value, onChange, type: inputType = "text", placeholder }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-foreground">New Item</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-border flex-shrink-0 flex-wrap">
          {TYPES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className={cn("px-3 py-1 rounded text-xs font-medium transition-colors", type === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Vault</label>
              <select
                value={vaultId}
                onChange={(e) => setVaultId(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {vaults.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <Field label="Title *" value={title} onChange={setTitle} placeholder="Item name" />

            {type === "login" && (
              <>
                <Field label="Username / Email" value={username} onChange={setUsername} placeholder="user@example.com" />
                <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
                <Field label="Website URL" value={url} onChange={setUrl} placeholder="https://example.com" />
              </>
            )}

            {type === "card" && (
              <>
                <Field label="Cardholder Name" value={cardholderName} onChange={setCardholderName} placeholder="John Doe" />
                <Field label="Card Number" value={cardNumber} onChange={setCardNumber} placeholder="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiration Date" value={expirationDate} onChange={setExpirationDate} placeholder="MM/YY" />
                  <Field label="CVV" value={cvv} onChange={setCvv} placeholder="123" />
                </div>
              </>
            )}

            {type === "identity" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="John" />
                  <Field label="Last Name" value={lastName} onChange={setLastName} placeholder="Doe" />
                </div>
                <Field label="Email" value={email} onChange={setEmail} placeholder="john@example.com" />
                <Field label="Phone" value={phone} onChange={setPhone} placeholder="+1 234 567 890" />
                <Field label="Address" value={address} onChange={setAddress} placeholder="123 Main St" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" value={city} onChange={setCity} placeholder="New York" />
                  <Field label="Country" value={country} onChange={setCountry} placeholder="United States" />
                </div>
              </>
            )}

            {type === "alias" && (
              <>
                <Field label="Alias Email" value={aliasEmail} onChange={setAliasEmail} placeholder="alias@pm.me" />
                <Field label="Forward to Email" value={email} onChange={setEmail} placeholder="real@example.com" />
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={!title.trim() || !vaultId || createItem.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createItem.isPending ? "Saving..." : "Save Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
