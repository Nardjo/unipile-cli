import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, chmodSync } from "fs";
import { dirname } from "path";
import { TOKEN_PATH, AUTH_HEADER, APP_CLI } from "./config.js";
import { CliError } from "./errors.js";

/** Check if a token is configured */
export function hasToken(): boolean {
  return existsSync(TOKEN_PATH);
}

/** Read the stored token. Throws if not configured. */
export function getToken(): string {
  if (!hasToken()) {
    throw new CliError(2, "No token configured.", `Run: ${APP_CLI} auth set <token>`);
  }
  return readFileSync(TOKEN_PATH, "utf-8").trim();
}

/** Save a token to disk with restricted permissions (chmod 600). */
export function setToken(token: string): void {
  mkdirSync(dirname(TOKEN_PATH), { recursive: true });
  writeFileSync(TOKEN_PATH, token.trim(), { mode: 0o600 });
  // Ensure permissions even if file existed
  chmodSync(TOKEN_PATH, 0o600);
}

/** Delete the stored token. */
export function removeToken(): void {
  if (existsSync(TOKEN_PATH)) {
    unlinkSync(TOKEN_PATH);
  }
}

/** Mask a token for display: "abcd...wxyz" */
export function maskToken(token: string): string {
  if (token.length <= 8) return "****";
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/** Build the Unipile API key header. */
export function buildAuthHeaders(): Record<string, string> {
  return { [AUTH_HEADER]: getToken() };
}
