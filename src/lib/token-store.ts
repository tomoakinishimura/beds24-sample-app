import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";

interface StoredTokens {
  token: string;
  refreshToken: string;
  tokenExpiresAt: number;
}

const TOKEN_FILE = join(process.cwd(), ".beds24-tokens.json");

export function getStoredTokens(): StoredTokens | null {
  try {
    if (!existsSync(TOKEN_FILE)) return null;
    const data = readFileSync(TOKEN_FILE, "utf-8");
    return JSON.parse(data) as StoredTokens;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: StoredTokens): void {
  writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

export function clearStoredTokens(): void {
  try {
    if (existsSync(TOKEN_FILE)) unlinkSync(TOKEN_FILE);
  } catch {
    // ignore
  }
}

export function isTokenExpired(): boolean {
  const tokens = getStoredTokens();
  if (!tokens) return true;
  return Date.now() > tokens.tokenExpiresAt;
}
