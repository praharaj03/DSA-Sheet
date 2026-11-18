export async function fetchJSON<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    const timeout = AbortSignal.timeout(15_000);
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
    });
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    throw new Error("The connection couldn't finish. Please try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}
