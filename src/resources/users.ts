import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";
import { requireAccountId } from "../lib/account.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  accountId?: string;
  limit?: string;
  cursor?: string;
}

export const usersResource = new Command("users").description(
  "LinkedIn profiles and 1st-degree relations",
);

usersResource
  .command("get")
  .description("Get a LinkedIn profile by public id or ACo… provider id")
  .argument("<identifier>", "Public slug or provider id (ACo…)")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--linkedin-sections <list>", "Comma-separated sections")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (identifier: string, opts: Opts & { linkedinSections?: string }) => {
    try {
      const data = await client.get(`/users/${encodeURIComponent(identifier)}`, {
        account_id: requireAccountId(opts.accountId),
        ...(opts.linkedinSections && { linkedin_sections: opts.linkedinSections }),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

usersResource
  .command("me")
  .description("Get the connected LinkedIn account owner profile")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/users/me", {
        account_id: requireAccountId(opts.accountId),
      });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

usersResource
  .command("relations")
  .description("List 1st-degree relations (paginated, cursor)")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--limit <n>", "Page size")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/users/relations", {
        account_id: requireAccountId(opts.accountId),
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
