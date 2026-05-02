"use client";

import { useState } from "react";
import { use } from "react";
import { Search, Key, CreditCard, StickyNote, User, AtSign, Pin } from "lucide-react";
import { useListItems, useListVaults, usePinItem, useTrashItem, type Item } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";
import ItemDetail from "@/components/ItemDetail";

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

export default function VaultDetailPage({ params }: { params: Promise<{ vaultId: string }> }) {
  const { vaultId } = use(params);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { data: vaults = [] } = useListVaults();
  const { data: items = [], isLoading } = useListItems({
    vaultId: Number(vaultId),
    trashed: false,
    search: search || undefined,
  });

  const pinItem = usePinItem();
  const trashItem = useTrashItem();

  const vault = vaults.find((v) => v.id === Number(vaultId));
  const pinned = items.filter((i) => i.pinned);
  const unpinned = items.filter((i) => !i.pinned);

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-border bg-card/30">
          <div className="p-3 border-b border-border">
            {vault && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className={cn("w-3 h-3 rounded-full", VAULT_COLORS[vault.color] ?? "bg-violet-500")} />
                <span className="text-sm font-medium text-foreground">{vault.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{vault.itemCount} items</span>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No items in this vault</div>
            ) : (
              <>
                {pinned.length > 0 && pinned.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left", selectedItem?.id === item.id && "bg-accent")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {(() => { const Icon = TYPE_ICONS[item.type] ?? Key; return <Icon className={cn("w-4 h-4", TYPE_COLORS[item.type])} />; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1"><span className="text-sm font-medium text-foreground truncate">{item.title}</span><Pin className="w-3 h-3 text-primary flex-shrink-0" /></div>
                      <div className="text-xs text-muted-foreground truncate">{item.username || item.email || item.type}</div>
                    </div>
                  </button>
                ))}
                {unpinned.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left", selectedItem?.id === item.id && "bg-accent")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {(() => { const Icon = TYPE_ICONS[item.type] ?? Key; return <Icon className={cn("w-4 h-4", TYPE_COLORS[item.type])} />; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.username || item.email || item.type}</div>
                    </div>
                  </button>
                ))}
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
              onTrash={() => { trashItem.mutate(selectedItem.id); setSelectedItem(null); }}
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
