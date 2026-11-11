/** Accept only same-origin relative paths to avoid open redirects. */
export function safeRedirect(value: unknown, fallback = "/painel"): string {
  if (typeof value !== "string") return fallback;
  try {
    const url = new URL(value, "http://local.invalid");
    if (url.origin !== "http://local.invalid") {
      if (typeof window !== "undefined" && url.origin === window.location.origin) {
        return url.pathname + url.search + url.hash;
      }
      return fallback;
    }
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//") || url.pathname.startsWith("/auth")) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
