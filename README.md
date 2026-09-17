# unipile-cli

Agent-ready CLI for the [Unipile](https://www.unipile.com/) LinkedIn API. It exposes accounts, profiles, first-degree relations, invitations, LinkedIn search, chats, messages, and a raw REST escape hatch.

Built with [api2cli](https://api2cli.dev). Requires Bun.

## Install

```bash
npx api2cli install Nardjo/unipile-cli
```

The installer builds the CLI, links `unipile-cli` to your PATH, and installs the bundled Agent Skill.

## Authentication

Get your DSN and API key from the Unipile dashboard, then configure:

```bash
export UNIPILE_DSN="https://apiX.unipile.com:PORT"
export UNIPILE_ACCOUNT_ID="your-linkedin-account-id"
unipile-cli auth set "$UNIPILE_API_KEY"
unipile-cli auth test --json
```

- Authentication header: `X-API-KEY`
- API base: `${UNIPILE_DSN}/api/v1`
- Token file: `~/.config/tokens/unipile-cli.txt`, mode `0600`
- `UNIPILE_BASE_URL` is accepted as an alias for `UNIPILE_DSN`
- `--account-id` overrides `UNIPILE_ACCOUNT_ID` per command

## Commands

| Resource | Commands |
|---|---|
| `auth` | `set`, `show`, `remove`, `test` |
| `accounts` | `list`, `get` |
| `users` | `get`, `me`, `relations` |
| `invitations` | `list` (`sent` alias), `send`, `cancel` |
| `linkedin` | `search` |
| `chats` | `list`, `get`, `start` |
| `messages` | `list`, `send` |
| `raw` | `get`, `post`, `patch`, `delete` |

Run `unipile-cli <resource> --help` or `unipile-cli <resource> <action> --help` for every flag.

## Examples

```bash
# Read-only operations
unipile-cli accounts list --limit 5 --json
unipile-cli users me --json
unipile-cli users relations --limit 20 --json
unipile-cli invitations list --json
unipile-cli linkedin search --keywords "freelance developer" --limit 10 --json
unipile-cli chats list --limit 20 --unread --json
unipile-cli messages list <chat-id> --json

# Mutating operations
unipile-cli invitations send --provider-id <provider-id> --json
unipile-cli chats start --attendee <provider-id> --text "Hello" --json
unipile-cli messages send <chat-id> --text "Hello" --json

# Any Unipile v1 endpoint
unipile-cli raw get accounts --query '{"limit":5}' --json
unipile-cli raw post linkedin/search --json-body '{"api":"classic","category":"people","keywords":"typescript"}' --query '{"account_id":"..."}' --json
```

## Output

Use `--json` for agents and automation.

Success:

```json
{
  "ok": true,
  "data": {}
}
```

Failure:

```json
{
  "ok": false,
  "error": {
    "code": 401,
    "message": "401: Unauthorized",
    "suggestion": "Check your token: unipile-cli auth test"
  }
}
```

Other formats: `--format text|json|csv|yaml`. List commands also support `--fields` where relevant.

## Safety

`invitations send`, `invitations cancel`, `chats start`, `messages send`, and mutating `raw` commands change remote state. Review the target and payload before running them.

## Development

```bash
bun install
bun run build
./dist/index.js --help
```

## License

MIT
