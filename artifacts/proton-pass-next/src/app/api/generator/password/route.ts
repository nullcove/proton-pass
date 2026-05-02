import { NextRequest, NextResponse } from "next/server";

function scorePassword(password: string) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const variety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  let charsetSize = 0;
  if (hasUpper) charsetSize += 26;
  if (hasLower) charsetSize += 26;
  if (hasNumber) charsetSize += 10;
  if (hasSymbol) charsetSize += 32;
  if (charsetSize === 0) charsetSize = 26;
  const entropy = Math.round(len * Math.log2(charsetSize) * 10) / 10;
  let score: string;
  if (len < 8 || variety < 2) score = "vulnerable";
  else if (len < 12 || variety < 3) score = "weak";
  else if (len < 16 || variety < 4) score = "strong";
  else score = "very_strong";
  return { score, entropy };
}

export async function POST(req: NextRequest) {
  const { length, uppercase, numbers, symbols } = await req.json();
  let charset = "abcdefghijklmnopqrstuvwxyz";
  if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (numbers) charset += "0123456789";
  if (symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const guarantees: string[] = [];
  if (uppercase) guarantees.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]);
  if (numbers) guarantees.push("0123456789"[Math.floor(Math.random() * 10)]);
  if (symbols) guarantees.push("!@#$%^&*()_+-="[Math.floor(Math.random() * 14)]);
  let password = "";
  const remaining = length - guarantees.length;
  for (let i = 0; i < Math.max(0, remaining); i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  const all = (password + guarantees.join("")).split("").sort(() => Math.random() - 0.5).join("");
  const finalPassword = all.slice(0, length);
  const { score, entropy } = scorePassword(finalPassword);
  return NextResponse.json({ password: finalPassword, score, entropy });
}
