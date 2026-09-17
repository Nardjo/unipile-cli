import { buildAuthHeaders } from "./auth.js";
import { BASE_URL } from "./config.js";
import { CliError } from "./errors.js";
import { log } from "./logger.js";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];
const TIMEOUT_MS = 60_000;

/** HTTP methods supported by the client */
type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/** Options for an API request */
interface RequestOptions {
  params?: Record<string, string>;
  body?: Record<string, unknown> | FormData;
  timeout?: number;
}

function withQuery(url: string, params?: Record<string, string>): string {
  if (!params) return url;
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );
  if (Object.keys(filtered).length === 0) return url;
  return `${url}?${new URLSearchParams(filtered).toString()}`;
}

/**
 * Make an authenticated API request with retry logic.
 * Retries on 429 (rate limit) and 5xx (server errors).
 */
async function request(method: Method, path: string, opts: RequestOptions = {}): Promise<unknown> {
  const url = withQuery(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, opts.params);
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...buildAuthHeaders(),
  };
  if (!isForm) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOpts: RequestInit = {
    method,
    headers,
    signal: AbortSignal.timeout(opts.timeout ?? TIMEOUT_MS),
  };

  if (opts.body && method !== "GET") {
    fetchOpts.body = isForm ? (opts.body as FormData) : JSON.stringify(opts.body);
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    log.debug(`${method} ${url}${attempt > 0 ? ` (retry ${attempt})` : ""}`);

    const res = await fetch(url, fetchOpts);

    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const delay = RETRY_DELAYS[attempt] ?? 4000;
      log.warn(`${res.status} - retrying in ${delay / 1000}s...`);
      await Bun.sleep(delay);
      continue;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const rec = data as Record<string, unknown> | null;
      const nested = rec?.error as Record<string, unknown> | undefined;
      const msg = rec?.message ?? nested?.message ?? rec?.detail ?? res.statusText;
      throw new CliError(res.status, `${res.status}: ${String(msg)}`);
    }

    return data;
  }

  throw new CliError(500, "Max retries exceeded");
}

/** Typed HTTP client with convenience methods */
export const client = {
  get(path: string, params?: Record<string, string>) {
    return request("GET", path, { params });
  },

  post(path: string, body?: Record<string, unknown>, params?: Record<string, string>) {
    return request("POST", path, { body, params });
  },

  postForm(path: string, body: FormData, params?: Record<string, string>) {
    return request("POST", path, { body, params });
  },

  patch(path: string, body?: Record<string, unknown>, params?: Record<string, string>) {
    return request("PATCH", path, { body, params });
  },

  put(path: string, body?: Record<string, unknown>, params?: Record<string, string>) {
    return request("PUT", path, { body, params });
  },

  delete(path: string, params?: Record<string, string>) {
    return request("DELETE", path, { params });
  },
};
