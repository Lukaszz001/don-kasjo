type ApiRequestInit = RequestInit & {
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 12000

function withDefaultHeaders(headers?: HeadersInit) {
  const merged = new Headers(headers)

  if (!merged.has("Accept")) {
    merged.set("Accept", "application/json")
  }

  return merged
}

export async function apiRequest(input: RequestInfo | URL, init: ApiRequestInit = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, headers, ...requestInit } = init
  const controller = new AbortController()
  let timeout: ReturnType<typeof setTimeout> | undefined

  const abortFromParent = () => controller.abort()

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener("abort", abortFromParent, { once: true })
    }
  }

  timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...requestInit,
      cache: requestInit.cache ?? "no-store",
      credentials: requestInit.credentials ?? "same-origin",
      headers: withDefaultHeaders(headers),
      signal: controller.signal,
    })
  } finally {
    if (timeout) clearTimeout(timeout)
    signal?.removeEventListener("abort", abortFromParent)
  }
}

export async function apiFetch<T = unknown>(
  input: RequestInfo | URL,
  init: ApiRequestInit = {}
): Promise<T> {
  const response = await apiRequest(input, init)
  const contentType = response.headers.get("content-type") || ""
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "")

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed with status ${response.status}`

    throw new Error(message)
  }

  return data as T
}

export const apiFetcher = (url: string) => apiFetch<any>(url)
