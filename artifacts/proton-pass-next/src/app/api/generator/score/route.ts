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
  let score: string, feedback: string;
  if (len < 8 || variety < 2) {
    score = "vulnerable";
    feedback = "Too short or lacks character variety. Use at least 8 characters with mixed types.";
  } else if (len < 12 || variety < 3) {
    score = "weak";
    feedback = "Could be stronger. Try adding more character types or increasing length.";
  } else if (len < 16 || variety < 4) {
    score = "strong";
    feedback = "Good password. Consider adding symbols for maximum strength.";
  } else {
    score = "very_strong";
    feedback = "Excellent password strength. This password is very secure.";
  }
  return { score, entropy, feedback };
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  return NextResponse.json(scorePassword(password));
}
