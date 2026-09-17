import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError, CliError } from "../lib/errors.js";

/** Escape hatch for any path under /api/v1. */
export const rawResource = new Command("raw").description(
  "Raw REST against /api/v1 (path without domain)",
);

function parseQuery(q?: string): Record<string, string> | undefined {
  if (!q) return undefined;
  try {
    const obj = JSON.parse(q);
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v)]));
  } catch {
    throw new CliError(2, "--query must be a JSON object of stringable values");
  }
}

rawResource
  .command("get")
  .description("GET /api/v1/<path>")
  .argument("<path>", "Path e.g. accounts or users/relations")
  .option("--query <json>", 'Query params JSON e.g. \'{"account_id":"…"}\'')
  .option("--json", "Output as JSON")
  .action(async (path: string, opts: { query?: string; json?: boolean }) => {
    try {
      const p = path.startsWith("/") ? path : `/${path}`;
      const data = await client.get(p, parseQuery(opts.query));
      output(data, { json: opts.json ?? true });
    } catch (err) {
      handleError(err, opts.json ?? true);
    }
  });

rawResource
  .command("post")
  .description("POST /api/v1/<path>")
  .argument("<path>", "Path e.g. users/invite")
  .option("--json-body <json>", "JSON body", "{}")
  .option("--query <json>", "Query params JSON")
  .option("--json", "Output as JSON")
  .action(async (path: string, opts: { jsonBody?: string; query?: string; json?: boolean }) => {
    try {
      const p = path.startsWith("/") ? path : `/${path}`;
      const body = JSON.parse(opts.jsonBody || "{}");
      const data = await client.post(p, body, parseQuery(opts.query));
      output(data, { json: opts.json ?? true });
    } catch (err) {
      handleError(err, opts.json ?? true);
    }
  });

rawResource
  .command("patch")
  .description("PATCH /api/v1/<path>")
  .argument("<path>", "Path")
  .option("--json-body <json>", "JSON body", "{}")
  .option("--json", "Output as JSON")
  .action(async (path: string, opts: { jsonBody?: string; json?: boolean }) => {
    try {
      const p = path.startsWith("/") ? path : `/${path}`;
      const body = JSON.parse(opts.jsonBody || "{}");
      const data = await client.patch(p, body);
      output(data, { json: opts.json ?? true });
    } catch (err) {
      handleError(err, opts.json ?? true);
    }
  });

rawResource
  .command("delete")
  .description("DELETE /api/v1/<path>")
  .argument("<path>", "Path")
  .option("--query <json>", "Query params JSON")
  .option("--json", "Output as JSON")
  .action(async (path: string, opts: { query?: string; json?: boolean }) => {
    try {
      const p = path.startsWith("/") ? path : `/${path}`;
      const data = await client.delete(p, parseQuery(opts.query));
      output(data ?? { deleted: true, path: p }, { json: opts.json ?? true });
    } catch (err) {
      handleError(err, opts.json ?? true);
    }
  });
