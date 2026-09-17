import { homedir } from "os";
import { join } from "path";

/** Application name (replaced during api2cli create) */
export const APP_NAME = "unipile";

/** CLI binary name (replaced during api2cli create) */
export const APP_CLI = "unipile-cli";

/**
 * REST base URL (no trailing slash), always `…/api/v1`.
 * Override with UNIPILE_DSN or UNIPILE_BASE_URL.
 * Accepts host:port, https://host:port, or already-suffixed /api/v1.
 */
function resolveBaseUrl(): string {
  const raw = (
    process.env.UNIPILE_DSN ||
    process.env.UNIPILE_BASE_URL ||
    "https://api1.unipile.com"
  ).replace(/\/+$/, "");
  const withProto = raw.includes("://") ? raw : `https://${raw}`;
  if (/\/api\/v1$/i.test(withProto)) return withProto;
  return `${withProto}/api/v1`;
}

export const BASE_URL = resolveBaseUrl();

/** Auth type: bearer | api-key | basic | custom */
export const AUTH_TYPE = "api-key";

/** Auth header name (e.g. Authorization, X-Api-Key) */
export const AUTH_HEADER = "X-API-KEY";

/** Path to the token file for this CLI */
export const TOKEN_PATH = join(homedir(), ".config", "tokens", `${APP_NAME}-cli.txt`);

/** LinkedIn account id: --account-id or UNIPILE_ACCOUNT_ID */
export function resolveAccountId(flag?: string): string {
  return (flag || process.env.UNIPILE_ACCOUNT_ID || "").trim();
}

/** Global state for output flags (set by root command) */
export const globalFlags = {
  json: false,
  format: "text" as "text" | "json" | "csv" | "yaml",
  verbose: false,
  noColor: false,
  noHeader: false,
};
