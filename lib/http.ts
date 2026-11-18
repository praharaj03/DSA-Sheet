import { NextResponse } from "next/server";

export class InputError extends Error {}

export async function readBody(
  request: Request,
  maxBytes = 400_000,
): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw new InputError("Request is too large");
  const reader = request.body?.getReader();
  if (!reader) throw new InputError("A JSON object is required");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new InputError("Request is too large");
    }
    chunks.push(value);
  }
  try {
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new InputError("A valid JSON object is required");
  }
}

export function apiError(error: unknown) {
  if (error instanceof InputError)
    return NextResponse.json({ error: error.message }, { status: 400 });
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  )
    return NextResponse.json(
      { error: "That username is already taken. Try another." },
      { status: 409 },
    );
  console.error(
    "API request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return NextResponse.json(
    { error: "We couldn't connect. Please try again." },
    { status: 503 },
  );
}
