import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = "/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type Vault = {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Item = {
  id: number;
  vaultId: number;
  type: "login" | "card" | "note" | "identity" | "alias";
  title: string;
  username?: string;
  password?: string;
  urls?: string[];
  note?: string;
  cardholderName?: string;
  cardNumber?: string;
  expirationDate?: string;
  cvv?: string;
  cardType?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  aliasEmail?: string;
  totp?: string;
  pinned: boolean;
  trashed: boolean;
  passwordScore?: "vulnerable" | "weak" | "strong" | "very_strong";
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Stats = {
  totalItems: number;
  totalVaults: number;
  loginCount: number;
  cardCount: number;
  noteCount: number;
  identityCount: number;
  aliasCount: number;
  weakPasswordCount: number;
  reusedPasswordCount: number;
  strongPasswordCount: number;
  trashedCount: number;
  recentActivity: Item[];
};

export function useListVaults() {
  return useQuery<Vault[]>({
    queryKey: ["vaults"],
    queryFn: () => apiFetch("/vaults"),
  });
}

export function useGetStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: () => apiFetch("/stats"),
  });
}

export function useListItems(params?: {
  vaultId?: number;
  type?: string;
  trashed?: boolean;
  search?: string;
  pinned?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.vaultId != null) qs.set("vaultId", String(params.vaultId));
  if (params?.type) qs.set("type", params.type);
  if (params?.trashed != null) qs.set("trashed", String(params.trashed));
  if (params?.search) qs.set("search", params.search);
  if (params?.pinned != null) qs.set("pinned", String(params.pinned));
  const query = qs.toString();

  return useQuery<Item[]>({
    queryKey: ["items", params],
    queryFn: () => apiFetch(`/items${query ? `?${query}` : ""}`),
  });
}

export function useGetWeakPasswords() {
  return useQuery<Item[]>({
    queryKey: ["stats", "weak-passwords"],
    queryFn: () => apiFetch("/stats/weak-passwords"),
  });
}

export function useGetReusedPasswords() {
  return useQuery<Item[][]>({
    queryKey: ["stats", "reused-passwords"],
    queryFn: () => apiFetch("/stats/reused-passwords"),
  });
}

export function useCreateVault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; color: string; icon: string; description?: string }) =>
      apiFetch<Vault>("/vaults", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vaults"] }),
  });
}

export function useDeleteVault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/vaults/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vaults"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Item> & { vaultId: number; type: string; title: string }) =>
      apiFetch<Item>("/items", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["vaults"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Item> & { id: number }) =>
      apiFetch<Item>(`/items/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/items/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["vaults"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useTrashItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<Item>(`/items/${id}/trash`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useRestoreItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<Item>(`/items/${id}/restore`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function usePinItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pinned }: { id: number; pinned: boolean }) =>
      apiFetch<Item>(`/items/${id}/pin`, { method: "POST", body: JSON.stringify({ pinned }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useGeneratePassword() {
  return useMutation({
    mutationFn: (body: { length: number; uppercase: boolean; numbers: boolean; symbols: boolean }) =>
      apiFetch<{ password: string; score: string; entropy: number }>("/generator/password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useGeneratePassphrase() {
  return useMutation({
    mutationFn: (body: {
      wordCount: number;
      separator: string;
      capitalize: boolean;
      includeNumbers: boolean;
    }) =>
      apiFetch<{ password: string; score: string; entropy: number }>("/generator/passphrase", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useScorePassword() {
  return useMutation({
    mutationFn: (password: string) =>
      apiFetch<{ score: string; entropy: number; feedback: string }>("/generator/score", {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
  });
}
