---
name: unipile-cli
description: "Use for Unipile LinkedIn accounts, profiles, relations, invitations, search, chats, and messages via CLI."
category: social-media
---

# unipile-cli

Agent-ready CLI for Unipile's LinkedIn API v1. Use it instead of browser automation when a Unipile account is available.

## When to use

- Inspect connected Unipile accounts
- Resolve LinkedIn profiles and list first-degree relations
- List, send, or cancel LinkedIn invitations
- Search LinkedIn people with Classic, Sales Navigator, or Recruiter APIs
- Read chats and messages, start chats, and reply
- Call an uncovered `/api/v1` endpoint through `raw`

## Setup

```bash
npx api2cli install Nardjo/unipile-cli
export UNIPILE_DSN="https://apiX.unipile.com:PORT"
export UNIPILE_ACCOUNT_ID="your-linkedin-account-id"
unipile-cli auth set "$UNIPILE_API_KEY"
unipile-cli auth test --json
```

The CLI sends `X-API-KEY`, appends `/api/v1` to the DSN, and stores the token at `~/.config/tokens/unipile-cli.txt` with mode `0600`.

Use `--account-id` to override `UNIPILE_ACCOUNT_ID` for one command. Use `--json` for agent calls.

## Commands

### Authentication

| Command | Purpose |
|---|---|
| `auth set <token>` | Save the API key |
| `auth show [--raw]` | Show a masked key; avoid `--raw` in agent logs |
| `auth remove` | Delete the saved key |
| `auth test --json` | Validate credentials with `GET /accounts?limit=1` |

### Accounts

| Command | Key flags |
|---|---|
| `accounts list` | `--limit`, `--cursor`, `--fields`, `--json` |
| `accounts get <id>` | `--json` |

### Users

| Command | Key flags |
|---|---|
| `users get <identifier>` | `--account-id`, `--linkedin-sections`, `--json` |
| `users me` | `--account-id`, `--json` |
| `users relations` | `--account-id`, `--limit`, `--cursor`, `--fields`, `--json` |

`<identifier>` can be a public LinkedIn slug or provider ID such as `ACo…`.

### Invitations

| Command | Key flags |
|---|---|
| `invitations list` | `--account-id`, `--limit`, `--cursor`, `--fields`, `--json` |
| `invitations send` | `--provider-id`, `--account-id`, `--message`, `--json` |
| `invitations cancel <invitation-id>` | `--account-id`, `--json` |

`invitations sent` is an alias for `invitations list`. Omit `--message` to send an invitation without a note.

### LinkedIn search

| Command | Key flags |
|---|---|
| `linkedin search` | `--keywords`, `--api`, `--json-body`, `--account-id`, `--limit`, `--cursor`, `--json` |

`--json-body` overrides the simple keyword body. `--api` accepts `classic`, `sales_navigator`, or `recruiter` when the connected account supports it.

### Chats and messages

| Command | Key flags |
|---|---|
| `chats list` | `--account-id`, `--limit`, `--cursor`, `--unread`, `--fields`, `--json` |
| `chats get <chat-id>` | `--json` |
| `chats start` | `--account-id`, `--attendee` or `--attendees`, `--text`, `--json` |
| `messages list <chat-id>` | `--limit`, `--cursor`, `--fields`, `--json` |
| `messages send <chat-id>` | `--text`, `--json` |

### Raw REST

| Command | Key flags |
|---|---|
| `raw get <path>` | `--query`, `--json` |
| `raw post <path>` | `--query`, `--json-body`, `--json` |
| `raw patch <path>` | `--json-body`, `--json` |
| `raw delete <path>` | `--query`, `--json` |

Paths are relative to `/api/v1`. `--query` and `--json-body` accept JSON strings. Never use a `--body` flag.

## Common workflows

```bash
# Identify the account, then set it for later calls
unipile-cli accounts list --limit 5 --json
export UNIPILE_ACCOUNT_ID="..."

# Paginate first-degree relations
unipile-cli users relations --limit 100 --json
unipile-cli users relations --limit 100 --cursor "<cursor-from-previous-response>" --json

# Read unread conversations
unipile-cli chats list --unread --limit 20 --json
unipile-cli messages list "<chat-id>" --json

# Search people
unipile-cli linkedin search --keywords "typescript freelance" --limit 10 --json
```

## Output and errors

Success is wrapped as `{ "ok": true, "data": ... }`. Errors use `{ "ok": false, "error": { "code", "message", "suggestion" } }` and a non-zero exit code. Exit code `1` means API/runtime failure; `2` means invalid usage.

## Safety rules

1. Prefer read-only calls during discovery.
2. Confirm the target before invitations, cancellations, new chats, replies, or mutating raw requests.
3. Never print `auth show --raw` into logs or chat.
4. Paginate with the cursor returned by the previous response.
5. Avoid bulk profile dumps in conversational output; summarize and retain IDs only when needed.

## Verification

```bash
unipile-cli --help
unipile-cli auth test --json
unipile-cli accounts list --limit 1 --json
unipile-cli users me --json
```
