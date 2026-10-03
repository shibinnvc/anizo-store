"use client";

import { useEffect, useRef, useState } from "react";

export function ConfirmDialog({ title, description, onConfirm, onCancel }: { title: string; description: string; onConfirm: () => Promise<void>; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="confirm-dialog" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }} aria-labelledby="confirm-title" aria-describedby="confirm-description"><span className="eyebrow">PLEASE CONFIRM</span><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p><div className="form-actions"><button className="button button-outline" disabled={busy} onClick={onCancel} autoFocus>Cancel</button><button className="button button-danger" disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>{busy ? "Deleting…" : "Delete permanently"}</button></div></dialog>;
}
