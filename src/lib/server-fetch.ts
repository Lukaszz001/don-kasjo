type ServerFetchInit = RequestInit & {
  timeoutMs?: number
}

export async function serverFetch(input: RequestInfo | URL, init: ServerFetchInit = {}) {
  const { timeoutMs = 15000, signal, ...requestInit } = init
  const controller = new AbortController()
  const abortFromParent = () => controller.abort()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener("abort", abortFromParent, { once: true })
    }
  }

  try {
    return await fetch(input, {
      ...requestInit,
      cache: requestInit.cache ?? "no-store",
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener("abort", abortFromParent)
  }
}
