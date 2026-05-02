import { Router } from "express";
import { GeneratePasswordBody, GeneratePassphraseBody, ScorePasswordBody } from "@workspace/api-zod";

const router = Router();

const WORDS = [
  "apple", "brave", "cloud", "dance", "eagle", "flame", "grace", "heart", "ivory", "jewel",
  "kings", "lemon", "mango", "noble", "ocean", "pearl", "queen", "river", "stone", "tiger",
  "ultra", "vivid", "water", "xenon", "yacht", "zebra", "amber", "blaze", "crisp", "dawn",
  "ember", "frost", "globe", "haven", "inlet", "judge", "karma", "lunar", "maple", "nexus",
  "orbit", "prism", "quartz", "realm", "spark", "torch", "urban", "vault", "winds", "xenith",
  "yield", "zephyr", "alpha", "bloom", "coral", "delta", "eight", "force", "guard", "hyper",
  "image", "joint", "knack", "light", "march", "night", "outer", "point", "quick", "ridge",
  "steel", "trend", "unity", "vivid", "watch", "extra", "youth", "zones"
];

function calculateEntropy(password: string): number {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  let charsetSize = 0;
  if (hasUpper) charsetSize += 26;
  if (hasLower) charsetSize += 26;
  if (hasNumber) charsetSize += 10;
  if (hasSymbol) charsetSize += 32;
  if (charsetSize === 0) charsetSize = 26;
  return Math.round(password.length * Math.log2(charsetSize) * 10) / 10;
}

function scorePassword(password: string): { score: string; entropy: number; feedback: string } {
  const entropy = calculateEntropy(password);
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const varietyCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  let score: string;
  let feedback: string;

  if (len < 8 || varietyCount < 2) {
    score = "vulnerable";
    feedback = "Too short or lacks character variety. Use at least 8 characters with mixed types.";
  } else if (len < 12 || varietyCount < 3) {
    score = "weak";
    feedback = "Could be stronger. Try adding more character types or increasing length.";
  } else if (len < 16 || varietyCount < 4) {
    score = "strong";
    feedback = "Good password. Consider adding symbols for maximum strength.";
  } else {
    score = "very_strong";
    feedback = "Excellent password strength. This password is very secure.";
  }

  return { score, entropy, feedback };
}

router.post("/generator/password", (req, res) => {
  const body = GeneratePasswordBody.parse(req.body);
  const { length, uppercase, numbers, symbols } = body;

  let charset = "abcdefghijklmnopqrstuvwxyz";
  if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (numbers) charset += "0123456789";
  if (symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let password = "";
  const guarantees: string[] = [];
  if (uppercase) guarantees.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]);
  if (numbers) guarantees.push("0123456789"[Math.floor(Math.random() * 10)]);
  if (symbols) guarantees.push("!@#$%^&*()_+-="[Math.floor(Math.random() * 14)]);

  const remaining = length - guarantees.length;
  for (let i = 0; i < Math.max(0, remaining); i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  const all = (password + guarantees.join("")).split("").sort(() => Math.random() - 0.5).join("");
  const finalPassword = all.slice(0, length);
  const { score, entropy } = scorePassword(finalPassword);

  res.json({ password: finalPassword, score, entropy });
});

router.post("/generator/passphrase", (req, res) => {
  const body = GeneratePassphraseBody.parse(req.body);
  const { wordCount, separator, capitalize, includeNumbers } = body;

  const separatorMap: Record<string, string> = {
    hyphen: "-",
    space: " ",
    period: ".",
    underscore: "_",
    numbers: "",
  };

  const words = Array.from({ length: wordCount }, () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    return capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
  });

  let passphrase: string;
  if (separator === "numbers") {
    passphrase = words.join(Math.floor(Math.random() * 10).toString());
  } else {
    const sep = separatorMap[separator] ?? "-";
    passphrase = words.join(sep);
  }

  if (includeNumbers && separator !== "numbers") {
    passphrase += Math.floor(Math.random() * 100);
  }

  const { score, entropy } = scorePassword(passphrase);
  res.json({ password: passphrase, score, entropy });
});

router.post("/generator/score", (req, res) => {
  const body = ScorePasswordBody.parse(req.body);
  const result = scorePassword(body.password);
  res.json(result);
});

export default router;
