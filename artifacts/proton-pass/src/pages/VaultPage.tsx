import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Search, Key, CreditCard, StickyNote, User, AtSign, Pin, ChevronRight, Filter } from "lucide-react";
import { useListItems, useListVaults } from "@workspace/api-client-react";
import ItemDetail from "@/components/ItemDetail";
import { cn } from "@/lib/utils";
import type { Item, Vault } from "@workspace/api-client-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  login: Key, card: CreditCard, note: StickyNote, identity: User, alias: AtSign
};
const TYPE_COLORS: Record<string, string> = {
  login: "text-violet-400", card: "text-sky-400", note: "text-amber-400", identity: "text-emerald-400", alias: "text-pink-400"
};
const SCORE_COLORS: Record<string, string> = {
  vulnerable: "score-vulnerable", weak: "score-weak", strong: "score-strong", very_strong: "score-very_strong"
};
const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "login", label: "Logins" },
  { value: "card", label: "Cards" },
  { value: "note", label: "Notes" },
  { value: "identity", label: "Identities" },
  { value: "alias", label: "Aliases" },
];

function ItemRow({ item, selected, onSelect }: { item: Item; selected: boolean; onSelect: () => void }) {
  const Icon = TYPE_ICONS[item.type] ?? Key;
  const iconColor = TYPE_COLORS[item.type] ?? "text-muted-foreground";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/50",
        selected && "bg-accent border-l-2 border-l-primary"
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className={cn("w-4 h-4", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {item.pinned && <Pin className="w-3 h-3 text-primary fill-primary flex-shrink-0" />}
          <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {item.username || item.aliasEmail || item.cardholderName || item.firstName || "Secure note"}
        </div>
      </div>
      {item.passwordScore && (
        <span className={cn("text-xs font-medium flex-shrink-0", SCORE_COLORS[item.passwordScore])}>
          {item.passwordScore === "very_strong" ? "VS" : item.passwordScore.charAt(0).toUpperCase()}
        </span>
      )}
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
    </button>
  );
}

export default function VaultPage() {
  const params = useParams<{ vaultId?: string }>();
  const vaultId = params.vaultId ? Number(params.vaultId) : undefined;
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split("?")[1] ?? "");
  const typeFromUrl = urlParams.get("type") ?? "";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(typeFromUrl);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { data: items = [], isLoading } = useListItems({
    params: {
      ...(vaultId && { vaultId }),
      ...(typeFilter && { type: typeFilter as "login" | "card" | "note" | "identity" | "alias" }),
      ...(search && { search }),
    }
  });
  const { data: vaults = [] } = useListVaults();
  const vault = vaultId ? vaults.find(v => v.id === vaultId) : undefined;

  const pinnedItems = items.filter(i => i.pinned);
  const unpinnedItems = items.filter(i => !i.pinned);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Item list */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <h1 className="text-base font-semibold text-foreground mb-3">
            {vault ? vault.name : "All Items"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">({items.length})</span>
          </h1>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-8 pr-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  typeFilter === f.value
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Key className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No items found</p>
            </div>
          ) : (
            <>
              {pinnedItems.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30">Pinned</div>
                  {pinnedItems.map(item => (
                    <ItemRow key={item.id} item={item} selected={selectedItem?.id === item.id} onSelect={() => setSelectedItem(item)} />
                  ))}
                </div>
              )}
              {unpinnedItems.length > 0 && (
                <div>
                  {pinnedItems.length > 0 && (
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30">All Items</div>
                  )}
                  {unpinnedItems.map(item => (
                    <ItemRow key={item.id} item={item} selected={selectedItem?.id === item.id} onSelect={() => setSelectedItem(item)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden">
        {selectedItem ? (
          <ItemDetail
            key={selectedItem.id}
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            vaults={vaults}
          />
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Key className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">Select an item</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Choose an item from the list to view its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
