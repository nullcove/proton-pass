import { NextRequest, NextResponse } from "next/server";

const WORDS = [
  "apple","brave","cloud","dance","eagle","flame","grace","heart","ivory","jewel",
  "kings","lemon","mango","noble","ocean","pearl","queen","river","stone","tiger",
  "ultra","vivid","water","xenon","yacht","zebra","amber","blaze","crisp","dawn",
  "ember","frost","globe","haven","inlet","judge","karma","lunar","maple","nexus",
  "orbit","prism","quartz","realm","spark","torch","urban","vault","winds","yield",
  "alpha","bloom","coral","delta","eight","force","guard","hyper","image","joint",
  "knack","light","march","night","outer","point","quick","ridge","steel","trend",
  "unity","watch","extra","youth","zones",
];

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
  const { wordCount, separator, capitalize, includeNumbers } = await req.json();
  const sepMap: Record<string, string> = {
    hyphen: "-", space: " ", period: ".", underscore: "_", numbers: "",
  };
  const words = Array.from({ length: wordCount }, () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  });
  let passphrase: string;
  if (separator === "numbers") {
    passphrase = words.join(Math.floor(Math.random() * 10).toString());
  } else {
    passphrase = words.join(sepMap[separator] ?? "-");
  }
  if (includeNumbers && separator !== "numbers") passphrase += Math.floor(Math.random() * 100);
  const { score, entropy } = scorePassword(passphrase);
  return NextResponse.json({ password: passphrase, score, entropy });
}
