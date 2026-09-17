import { Command } from "commander";
import { getToken, setToken, removeToken, hasToken, maskToken } from "../lib/auth.js";
import { client } from "../lib/client.js";
import { log } from "../lib/logger.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

export const authCommand = new Command("auth").description("Manage API authentication");

authCommand
  .command("set")
  .description("Save your API token")
  .argument("<token>", "Your API token")
  .addHelpText("after", "\nExample:\n  unipile-cli auth set api-key-example")
  .action((token: string) => {
    setToken(token);
    log.success("Token saved securely");
  });

authCommand
  .command("show")
  .description("Display current token (masked by default)")
  .option("--raw", "Show the full unmasked token")
  .addHelpText("after", "\nExample:\n  unipile-cli auth show\n  unipile-cli auth show --raw")
  .action((opts: { raw?: boolean }) => {
    if (!hasToken()) {
      log.warn("No token configured. Run: unipile-cli auth set <token>");
      return;
    }
    const token = getToken();
    console.log(opts.raw ? token : `Token: ${maskToken(token)}`);
  });

authCommand
  .command("remove")
  .description("Delete the saved token")
  .addHelpText("after", "\nExample:\n  unipile-cli auth remove")
  .action(() => {
    removeToken();
    log.success("Token removed");
  });

authCommand
  .command("test")
  .description("Verify your token works by making a test API call")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  unipile-cli auth test --json")
  .action(async (opts: { json?: boolean; format?: string }) => {
    try {
      await client.get("/accounts", { limit: "1" });
      output({ authenticated: true }, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
