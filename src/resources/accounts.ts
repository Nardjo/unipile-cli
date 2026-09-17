import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface JsonOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  limit?: string;
  cursor?: string;
}

export const accountsResource = new Command("accounts").description(
  "List and get Unipile connected accounts",
);

accountsResource
  .command("list")
  .description("List connected accounts")
  .option("--limit <n>", "Page size")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: JsonOpts) => {
    try {
      const data = await client.get("/accounts", {
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

accountsResource
  .command("get")
  .description("Get one connected account")
  .argument("<id>", "Unipile account id")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (id: string, opts: JsonOpts) => {
    try {
      const data = await client.get(`/accounts/${id}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
