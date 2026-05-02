import { useState } from "react";
import { Trash2, RotateCcw, X, Key, CreditCard, StickyNote, User, AtSign } from "lucide-react";
import { useListItems, useRestoreItem, useDeleteItem, getListItemsQueryKey, getGetStatsQueryKey, useListVaults } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import ItemDetail from "@/components/ItemDetail";
import { cn } from "@/lib/utils";
import type { Item } from "@workspace/api-client-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  login: Key, card: CreditCard, note: StickyNote, identity: User, alias: AtSign
};
const TYPE_COLORS: Record<string, string> = {
  login: "text-violet-400", card: "text-sky-400", note: "text-amber-400", identity: "text-emerald-400", alias: "text-pink-400"
};

export default function TrashPage() {
  const { data: items = [], isLoading } = useListItems({ params: { trashed: true } });
  const { data: vaults = [] } = useListVaults();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const qc = useQueryClient();
  const restoreItem = useRestoreItem();
  const deleteItem = useDeleteItem();

  function invalidate() {
    qc.invalidateQueries({ queryKey: getListItemsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetStatsQueryKey() });
  }

  async function handleRestore(item: Item, e: React.MouseEvent) {
    e.stopPropagation();
    await restoreItem.mutateAsync({ itemId: item.id });
    invalidate();
    if (selectedItem?.id === item.id) setSelectedItem(null);
  }

  async function handleDelete(item: Item, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Permanently delete this item? This cannot be undone.")) return;
    await deleteItem.mutateAsync({ itemId: item.id });
    invalidate();
    if (selectedItem?.id === item.id) setSelectedItem(null);
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-border">
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Trash2 className="w-4 h-4 text-muted-foreground" />
            <h1 className="text-base font-semibold text-foreground">Trash</h1>
            <span className="text-sm text-muted-foreground">({items.length})</span>
          </div>
          <p className="text-xs text-muted-foreground">Items in trash can be restored or permanently deleted.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
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
              <Trash2 className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Trash is empty</p>
              <p className="text-xs text-muted-foreground mt-1">Deleted items will appear here</p>
            </div>
          ) : (
            items.map(item => {
              const Icon = TYPE_ICONS[item.type] ?? Key;
              const iconColor = TYPE_COLORS[item.type] ?? "text-muted-foreground";
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/50 group",
                    selectedItem?.id === item.id && "bg-accent border-l-2 border-l-primary"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 opacity-60">
                    <Icon className={cn("w-4 h-4", iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-muted-foreground truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground/60 truncate">{item.username || item.type}</div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => handleRestore(item, e)}
                      title="Restore"
                      className="p-1 rounded text-muted-foreground hover:text-emerald-400 hover:bg-accent transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => handleDelete(item, e)}
                      title="Delete permanently"
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {selectedItem ? (
          <ItemDetail
            key={selectedItem.id}
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            vaults={vaults}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">Trash</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Select a trashed item to view, restore, or permanently delete it
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
