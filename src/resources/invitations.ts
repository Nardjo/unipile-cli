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
  providerId?: string;
  message?: string;
}

export const invitationsResource = new Command("invitations").description(
  "LinkedIn connection invitations (sent / send / cancel)",
);

invitationsResource
  .command("list")
  .alias("sent")
  .description("List sent (pending) invitations")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--limit <n>", "Page size")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/users/invite/sent", {
        account_id: requireAccountId(opts.accountId),
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

invitationsResource
  .command("send")
  .description("Send a connection request (empty message unless --message)")
  .requiredOption("--provider-id <id>", "LinkedIn provider id (ACo…)")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--message <text>", "Optional invite note (LinkedIn monthly cap)")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const body: Record<string, unknown> = {
        account_id: requireAccountId(opts.accountId),
        provider_id: opts.providerId,
      };
      if (opts.message) body.message = opts.message;
      const data = await client.post("/users/invite", body);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

invitationsResource
  .command("cancel")
  .description("Cancel a sent invitation")
  .argument("<invitation-id>", "Invitation id")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (invitationId: string, opts: Opts) => {
    try {
      const data = await client.delete(`/users/invite/sent/${invitationId}`, {
        account_id: requireAccountId(opts.accountId),
      });
      output(data ?? { cancelled: true, invitation_id: invitationId }, {
        json: opts.json,
        format: opts.format,
      });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
