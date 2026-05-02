"use client";

import { Suspense } from "react";
import VaultPageContent from "./VaultContent";

export default function VaultPage() {
  return (
    <Suspense fallback={null}>
      <VaultPageContent />
    </Suspense>
  );
}
