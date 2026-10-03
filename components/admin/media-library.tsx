"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "./confirm-dialog";
import { useFeedback } from "./feedback";
import { adminFetch } from "@/lib/client-api";
import { errorMessage } from "@/lib/utils";

export interface LibraryFile { path: string; name: string; size: number; type: string; created: string }
export function MediaLibrary({ files }: { files: LibraryFile[] }) {
  const [selected, setSelected] = useState<LibraryFile | null>(null);
  const notify = useFeedback();
  const router = useRouter();
  async function remove() {
    try { await adminFetch("/api/admin/media", "DELETE", { path: selected!.path }); notify("Unused file removed."); setSelected(null); router.refresh(); }
    catch (error) { setSelected(null); notify(errorMessage(error), "error"); }
  }
  return <><div className="table-scroll"><table className="admin-table"><thead><tr><th>File</th><th>Type</th><th>Size</th><th>Uploaded</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{files.map(file => <tr key={file.path}><td><strong className="media-file-name" title={file.name}>{file.name}</strong><small className="media-file-path">{file.path.split("/").slice(0,-1).join("/")}</small></td><td>{file.type}</td><td>{(file.size / 1024 / 1024).toFixed(2)} MB</td><td>{file.created ? new Date(file.created).toLocaleDateString("en-GB") : "—"}</td><td><button className="delete-text" onClick={() => setSelected(file)}>Delete if unused</button></td></tr>)}</tbody></table></div>{selected && <ConfirmDialog title="Remove this file?" description="Files currently attached to a product or website section are protected. Unused files, including abandoned uploads, will be permanently removed." onCancel={() => setSelected(null)} onConfirm={remove} />}</>;
}
