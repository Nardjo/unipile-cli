import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let home = "";
let server: ReturnType<typeof Bun.serve>;

async function run(args: string[]) {
  const proc = Bun.spawn({
    cmd: [process.execPath, "run", "src/index.ts", ...args],
    cwd: import.meta.dir.replace(/\/test$/, ""),
    env: {
      ...process.env,
      HOME: home,
      UNIPILE_DSN: server.url.origin,
      UNIPILE_ACCOUNT_ID: "account-1",
      NO_COLOR: "1",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { exitCode, stdout, stderr };
}

beforeAll(async () => {
  home = mkdtempSync(join(tmpdir(), "unipile-cli-test-"));
  server = Bun.serve({
    port: 0,
    fetch(request) {
      const url = new URL(request.url);
      if (request.headers.get("x-api-key") !== "test-api-key") {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
      if (request.method === "GET" && url.pathname === "/api/v1/accounts") {
        return Response.json({ items: [{ id: "account-1", type: "LINKEDIN" }] });
      }
      return Response.json({ message: "Not found" }, { status: 404 });
    },
  });

  const auth = await run(["auth", "set", "test-api-key"]);
  expect(auth.exitCode).toBe(0);
});

afterAll(() => {
  server.stop(true);
  rmSync(home, { recursive: true, force: true });
});

describe("unipile-cli", () => {
  test("auth test returns a machine-readable success envelope", async () => {
    const result = await run(["auth", "test", "--json"]);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      ok: true,
      data: { authenticated: true },
    });
  });

  test("accounts list sends the API key and returns JSON", async () => {
    const result = await run(["accounts", "list", "--limit", "1", "--json"]);
    expect(result.exitCode).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.data.items[0]).toEqual({ id: "account-1", type: "LINKEDIN" });
  });
});
