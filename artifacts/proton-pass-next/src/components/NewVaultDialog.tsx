"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCreateVault } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const COLORS = [
  { hex: "#6D4AFF", label: "Violet" },
  { hex: "#0EA5E9", label: "Sky" },
  { hex: "#10B981", label: "Emerald" },
  { hex: "#F59E0B", label: "Amber" },
  { hex: "#EF4444", label: "Red" },
  { hex: "#EC4899", label: "Pink" },
];

const COLOR_DOT: Record<string, string> = {
  "#6D4AFF": "bg-violet-500",
  "#0EA5E9": "bg-sky-500",
  "#10B981": "bg-emerald-500",
  "#F59E0B": "bg-amber-500",
  "#EF4444": "bg-red-500",
  "#EC4899": "bg-pink-500",
};

export default function NewVaultDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6D4AFF");

  const createVault = useCreateVault();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createVault.mutateAsync({ name: name.trim(), description: description.trim() || undefined, color, icon: "shield" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">New Vault</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Vault"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map(({ hex }) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColor(hex)}
                  className={cn(
                    "w-7 h-7 rounded-full transition-transform",
                    COLOR_DOT[hex],
                    color === hex && "ring-2 ring-white ring-offset-2 ring-offset-card scale-110"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createVault.isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createVault.isPending ? "Creating..." : "Create Vault"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
