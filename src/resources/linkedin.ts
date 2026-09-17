import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError, CliError } from "../lib/errors.js";
import { requireAccountId } from "../lib/account.js";

interface Opts {
  json?: boolean;
  format?: string;
  accountId?: string;
  limit?: string;
  cursor?: string;
  jsonBody?: string;
  keywords?: string;
  api?: string;
}

export const linkedinResource = new Command("linkedin").description(
  "LinkedIn Classic search (people / companies / posts)",
);

linkedinResource
  .command("search")
  .description("POST /linkedin/search — pass --json-body or --keywords")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--limit <n>", "Page size (Classic people ≤10)")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--keywords <text>", "People search keywords (classic)")
  .option("--api <api>", "classic | sales_navigator | recruiter", "classic")
  .option("--json-body <json>", "Raw search body (overrides --keywords)")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      let body: Record<string, unknown>;
      if (opts.jsonBody) {
        try {
          body = JSON.parse(opts.jsonBody);
        } catch {
          throw new CliError(2, "--json-body must be valid JSON");
        }
      } else {
        body = {
          api: opts.api || "classic",
          category: "people",
          keywords: opts.keywords || "",
        };
      }
      const data = await client.post("/linkedin/search", body, {
        account_id: requireAccountId(opts.accountId),
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
