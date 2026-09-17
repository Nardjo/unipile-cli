import { resolveAccountId } from "./config.js";
import { CliError } from "./errors.js";

/** Require a Unipile LinkedIn account id. */
export function requireAccountId(flag?: string): string {
  const id = resolveAccountId(flag);
  if (!id) {
    throw new CliError(
      2,
      "Missing account id",
      "Pass --account-id or set UNIPILE_ACCOUNT_ID",
    );
  }
  return id;
}
