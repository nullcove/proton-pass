"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Key, CreditCard, StickyNote, User, AtSign, Pin, Filter } from "lucide-react";
import { useListItems, useListVaults, usePinItem, useTrashItem, type Item, type Vault } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import ItemDetail from "@/components/ItemDetail";

const TYPE_ICONS: Record<string, React.ElementType> = {
  login: Key,
  card: CreditCard,
  note: StickyNote,
  identity: User,
  alias: AtSign,
};

const TYPE_COLORS: Record<string, string> = {
  login: "text-violet-400",
  card: "text-sky-400",
  note: "text-amber-400",
  identity: "text-emerald-400",
  alias: "text-pink-400",
};

const VAULT_COLORS: Record<string, string> = {
  "#6D4AFF": "bg-violet-500",
  "#0EA5E9": "bg-sky-500",
  "#10B981": "bg-emerald-500",
  "#F59E0B": "bg-amber-500",
  "#EF4444": "bg-red-500",
  "#EC4899": "bg-pink-500",
};

type FilterType = "all" | "login" | "card" | "note" | "identity" | "alias";

export default function VaultContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as FilterType) ?? "all";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>(initialType);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { data: vaults = [] } = useListVaults();
  const { data: items = [], isLoading } = useListItems({
    type: typeFilter !== "all" ? typeFilter : undefined,
    trashed: false,
    search: search || undefined,
  });

  const pinItem = usePinItem();
  const trashItem = useTrashItem();

  const pinned = items.filter((i) => i.pinned);
  const unpinned = items.filter((i) => !i.pinned);

  const vaultMap = Object.fromEntries(vaults.map((v) => [v.id, v]));

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "login", label: "Logins" },
    { key: "card", label: "Cards" },
    { key: "note", label: "Notes" },
    { key: "identity", label: "Identities" },
    { key: "alias", label: "Aliases" },
  ];

  function ItemRow({ item }: { item: Item }) {
    const Icon = TYPE_ICONS[item.type] ?? Key;
    const vault = vaultMap[item.vaultId];
    return (
      <button
        onClick={() => setSelectedItem(item)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left",
          selectedItem?.id === item.id && "bg-accent"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className={cn("w-4 h-4", TYPE_COLORS[item.type])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
            {item.pinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {vault && (
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", VAULT_COLORS[vault.color] ?? "bg-violet-500")} />
            )}
            <span className="text-xs text-muted-foreground truncate">
              {item.username || item.email || item.cardholderName || item.type}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-card/30">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key)}
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                    typeFilter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No items found</div>
            ) : (
              <>
                {pinned.length > 0 && (
                  <div>
                    <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground bg-muted/30 flex items-center gap-1.5">
                      <Pin className="w-3 h-3" /> Pinned
                    </div>
                    {pinned.map((item) => <ItemRow key={item.id} item={item} />)}
                  </div>
                )}
                {unpinned.map((item) => <ItemRow key={item.id} item={item} />)}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {selectedItem ? (
            <ItemDetail
              item={selectedItem}
              vaults={vaults}
              onClose={() => setSelectedItem(null)}
              onPin={() => pinItem.mutate({ id: selectedItem.id, pinned: !selectedItem.pinned })}
              onTrash={() => {
                trashItem.mutate(selectedItem.id);
                setSelectedItem(null);
              }}
            />
          ) : (
            <div className="flex-1 h-full flex items-center justify-center">
              <div className="text-center">
                <Key className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select an item to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
