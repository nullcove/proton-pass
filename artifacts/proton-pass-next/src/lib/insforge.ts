import { createClient } from "@insforge/sdk";

const BASE_URL = process.env.INSFORGE_BASE_URL || "https://7mr7cxjn.ap-southeast.insforge.app";
const API_KEY = process.env.INSFORGE_API_KEY || "";
const ANON_KEY = process.env.INSFORGE_ANON_KEY || "";

let _adminClient: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient({
      baseUrl: BASE_URL,
      anonKey: ANON_KEY,
      headers: { "x-api-key": API_KEY },
    });
  }
  return _adminClient;
}

export function parseUrls(urls: string | null | undefined): string[] {
  if (!urls) return [];
  try {
    return JSON.parse(urls);
  } catch {
    return [];
  }
}

export function scorePassword(password: string): string {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const variety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  if (len < 8 || variety < 2) return "vulnerable";
  if (len < 12 || variety < 3) return "weak";
  if (len < 16 || variety < 4) return "strong";
  return "very_strong";
}

export function formatItem(item: Record<string, unknown>) {
  return { ...item, urls: parseUrls(item.urls as string) };
}
