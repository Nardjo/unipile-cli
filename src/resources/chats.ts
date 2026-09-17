import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError, CliError } from "../lib/errors.js";
import { requireAccountId } from "../lib/account.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  accountId?: string;
  limit?: string;
  cursor?: string;
  unread?: boolean;
  attendee?: string;
  attendees?: string;
  text?: string;
}

export const chatsResource = new Command("chats").description(
  "LinkedIn chats: list, get, start",
);

chatsResource
  .command("list")
  .description("List chats")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--limit <n>", "Page size")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--unread", "Unread only")
  .option("--fields <cols>", "Comma-separated columns")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const data = await client.get("/chats", {
        account_id: requireAccountId(opts.accountId),
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
        ...(opts.unread ? { unread: "true" } : {}),
      });
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

chatsResource
  .command("get")
  .description("Get one chat")
  .argument("<chat-id>", "Chat id")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (chatId: string, opts: Opts) => {
    try {
      const data = await client.get(`/chats/${chatId}`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

chatsResource
  .command("start")
  .description("Start a new LinkedIn chat (DM)")
  .option("--account-id <id>", "Unipile LinkedIn account id")
  .option("--attendee <id>", "Single provider id (ACo…)")
  .option("--attendees <ids>", "Comma-separated provider ids")
  .requiredOption("--text <text>", "First message")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (opts: Opts) => {
    try {
      const ids = [
        ...(opts.attendee ? [opts.attendee] : []),
        ...(opts.attendees ? opts.attendees.split(",").map((s) => s.trim()).filter(Boolean) : []),
      ];
      if (ids.length === 0) {
        throw new CliError(2, "Missing attendee", "Pass --attendee ACo… or --attendees id1,id2");
      }
      const form = new FormData();
      form.append("account_id", requireAccountId(opts.accountId));
      form.append("text", opts.text || "");
      for (const id of ids) form.append("attendees_ids", id);
      const data = await client.postForm("/chats", form);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
