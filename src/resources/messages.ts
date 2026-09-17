import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface Opts {
  json?: boolean;
  format?: string;
  fields?: string;
  limit?: string;
  cursor?: string;
  text?: string;
}

export const messagesResource = new Command("messages").description(
  "Messages inside a Unipile chat",
);

messagesResource
  .command("list")
  .description("List messages in a chat")
  .argument("<chat-id>", "Chat id")
  .option("--limit <n>", "Page size")
  .option("--cursor <cursor>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (chatId: string, opts: Opts) => {
    try {
      const data = await client.get(`/chats/${chatId}/messages`, {
        ...(opts.limit && { limit: opts.limit }),
        ...(opts.cursor && { cursor: opts.cursor }),
      });
      output(data, { json: opts.json, format: opts.format, fields: opts.fields?.split(",") });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

messagesResource
  .command("send")
  .description("Send a message in an existing chat")
  .argument("<chat-id>", "Chat id")
  .requiredOption("--text <text>", "Message text")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (chatId: string, opts: Opts) => {
    try {
      const form = new FormData();
      form.append("text", opts.text || "");
      const data = await client.postForm(`/chats/${chatId}/messages`, form);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
