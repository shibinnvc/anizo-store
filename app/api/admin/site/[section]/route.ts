import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebase-admin";
import { requireApiAdmin, verifyOrigin } from "@/lib/auth";
import { apiError, readJson } from "@/lib/api";
import { parseHero, parseSettings, ValidationError } from "@/lib/validation";
import { cleanupReplacedMedia } from "@/lib/media-server";

export async function PUT(request: Request, { params }: { params: Promise<{ section: string }> }) {
  try {
    verifyOrigin(request); await requireApiAdmin();
    const { section } = await params;
    if (!["hero", "settings"].includes(section)) throw new ValidationError("Unknown site section.");
    const body = await readJson(request);
    const input = section === "hero" ? parseHero(body) : parseSettings(body);
    const { db } = getAdmin();
    const updatedAt = new Date().toISOString();
    const before = await db.runTransaction(async tx => {
      const doc = db.doc(`site/${section}`);
      const previous = await tx.get(doc);
      if (previous.exists && body.expectedUpdatedAt !== previous.data()?.updatedAt) throw new ValidationError("These settings were changed in another session. Reload before saving.");
      tx.set(doc, { ...input, updatedAt });
      return previous.data();
    });
    const warning = await cleanupReplacedMedia(before, input);
    return NextResponse.json({ success: true, warning, updatedAt });
  } catch (error) { return apiError(error); }
}
