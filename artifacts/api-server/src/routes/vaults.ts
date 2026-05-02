import { Router } from "express";
import { db, vaultsTable, itemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateVaultBody, UpdateVaultBody, GetVaultParams, UpdateVaultParams, DeleteVaultParams } from "@workspace/api-zod";

const router = Router();

router.get("/vaults", async (req, res) => {
  const vaults = await db.select().from(vaultsTable).orderBy(vaultsTable.createdAt);
  const withCounts = await Promise.all(
    vaults.map(async (vault) => {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(itemsTable)
        .where(eq(itemsTable.vaultId, vault.id));
      return { ...vault, itemCount: row?.count ?? 0 };
    }),
  );
  res.json(withCounts);
});

router.post("/vaults", async (req, res) => {
  const body = CreateVaultBody.parse(req.body);
  const [vault] = await db.insert(vaultsTable).values(body).returning();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(itemsTable)
    .where(eq(itemsTable.vaultId, vault.id));
  res.status(201).json({ ...vault, itemCount: row?.count ?? 0 });
});

router.get("/vaults/:vaultId", async (req, res) => {
  const { vaultId } = GetVaultParams.parse(req.params);
  const [vault] = await db.select().from(vaultsTable).where(eq(vaultsTable.id, vaultId));
  if (!vault) return res.status(404).json({ error: "Vault not found" });
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(itemsTable)
    .where(eq(itemsTable.vaultId, vault.id));
  res.json({ ...vault, itemCount: row?.count ?? 0 });
});

router.patch("/vaults/:vaultId", async (req, res) => {
  const { vaultId } = UpdateVaultParams.parse(req.params);
  const body = UpdateVaultBody.parse(req.body);
  const [vault] = await db
    .update(vaultsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(vaultsTable.id, vaultId))
    .returning();
  if (!vault) return res.status(404).json({ error: "Vault not found" });
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(itemsTable)
    .where(eq(itemsTable.vaultId, vault.id));
  res.json({ ...vault, itemCount: row?.count ?? 0 });
});

router.delete("/vaults/:vaultId", async (req, res) => {
  const { vaultId } = DeleteVaultParams.parse(req.params);
  await db.delete(itemsTable).where(eq(itemsTable.vaultId, vaultId));
  await db.delete(vaultsTable).where(eq(vaultsTable.id, vaultId));
  res.status(204).send();
});

export default router;
