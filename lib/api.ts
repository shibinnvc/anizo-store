import { NextResponse } from "next/server";
import { AuthError } from "./auth";
import { ValidationError } from "./validation";

export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ValidationError("Expected JSON data.");
  const reader = request.body?.getReader();
  if (!reader) throw new ValidationError("Request body is required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 150000) { await reader.cancel(); throw new ValidationError("Form data is too large."); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new ValidationError("Invalid JSON data."); }
}

export function apiError(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
  console.error("Admin operation failed", error);
  return NextResponse.json({ error: "The operation could not be completed. Please try again." }, { status: 500 });
}
