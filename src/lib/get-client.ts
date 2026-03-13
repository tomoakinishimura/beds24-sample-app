import { Beds24Client } from "./beds24-client";
import {
  getStoredTokens,
  isTokenExpired,
  setStoredTokens,
} from "./token-store";

export async function getClient(): Promise<Beds24Client> {
  const tokens = getStoredTokens();
  if (!tokens) {
    throw new Error("NOT_AUTHENTICATED");
  }

  if (isTokenExpired()) {
    const newToken = await Beds24Client.refreshToken(tokens.refreshToken);
    setStoredTokens({
      token: newToken.token,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: Date.now() + 23 * 60 * 60 * 1000, // 23 hours
    });
    return new Beds24Client(newToken.token);
  }

  return new Beds24Client(tokens.token);
}
