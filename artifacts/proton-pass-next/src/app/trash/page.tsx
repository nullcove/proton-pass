"use client";

import { useState } from "react";
import { Trash2, RefreshCw, RotateCcw, Key, CreditCard, StickyNote, User, AtSign, AlertTriangle } from "lucide-react";
import { useListItems, useRestoreItem, useDeleteItem, type Item } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Layout from "@/components/Layout";

const TYPE_ICONS: Record<string, React.ElementType> = {
  login: Key, card: CreditCard, note: StickyNote, identity: User, alias: AtSign,
};
const TYPE_COLORS: Record<string, string> = {
  login: "text-violet-400", card: "text-sky-400", note: "text-amber-400",
  identity: "text-emerald-400", alias: "text-pink-400",
};

export default function TrashPage() {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const { data: items = [], isLoading } = useListItems({ trashed: true });
  const restoreItem = useRestoreItem();
  const deleteItem = useDeleteItem();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Trash</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""} in trash</p>
          </div>

          {items.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Trash2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <div className="text-sm text-muted-foreground">Trash is empty</div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-400">Items in trash can be permanently deleted. Restore items you want to keep.</p>
              </div>

              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {items.map((item) => {
                  const Icon = TYPE_ICONS[item.type] ?? Key;
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className={cn("w-4 h-4", TYPE_COLORS[item.type])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{item.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => restoreItem.mutate(item.id)}
                          disabled={restoreItem.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                        {confirmId === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Sure?</span>
                            <button
                              onClick={() => { deleteItem.mutate(item.id); setConfirmId(null); }}
                              className="px-2 py-1 rounded text-xs font-medium bg-destructive text-destructive-foreground"
                            >
                              Yes
                            </button>
                            <button onClick={() => setConfirmId(null)} className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(item.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
