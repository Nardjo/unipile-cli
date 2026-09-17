#!/usr/bin/env bun
import { Command } from "commander";
import { globalFlags } from "./lib/config.js";
import { authCommand } from "./commands/auth.js";
import { accountsResource } from "./resources/accounts.js";
import { usersResource } from "./resources/users.js";
import { invitationsResource } from "./resources/invitations.js";
import { linkedinResource } from "./resources/linkedin.js";
import { chatsResource } from "./resources/chats.js";
import { messagesResource } from "./resources/messages.js";
import { rawResource } from "./resources/raw.js";

const program = new Command();

program
  .name("unipile-cli")
  .description(
    "Agent-ready CLI for Unipile LinkedIn API (accounts, relations, invitations, search, chats).",
  )
  .version("0.1.0")
  .option("--json", "Output as JSON", false)
  .option("--format <fmt>", "Output format: text, json, csv, yaml", "text")
  .option("--verbose", "Enable debug logging", false)
  .option("--no-color", "Disable colored output")
  .option("--no-header", "Omit table/csv headers (for piping)")
  .hook("preAction", (_thisCmd, actionCmd) => {
    const root = actionCmd.optsWithGlobals();
    globalFlags.json = root.json ?? false;
    globalFlags.format = root.format ?? "text";
    globalFlags.verbose = root.verbose ?? false;
    globalFlags.noColor = root.color === false;
    globalFlags.noHeader = root.header === false;
  });

program.addCommand(authCommand);
program.addCommand(accountsResource);
program.addCommand(usersResource);
program.addCommand(invitationsResource);
program.addCommand(linkedinResource);
program.addCommand(chatsResource);
program.addCommand(messagesResource);
program.addCommand(rawResource);

program.parse();
