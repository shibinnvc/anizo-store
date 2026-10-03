"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Notice = { message: string; kind: "success" | "error" | "info" };
const Context = createContext<(message: string, kind?: Notice["kind"]) => void>(() => {});

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = useCallback((message: string, kind: Notice["kind"] = "success") => { setNotice({ message, kind }); }, []);
  return <Context.Provider value={notify}>{children}<div className="toast-region" aria-live="polite" aria-atomic="true">{notice && <div className={`toast toast-${notice.kind}`}><span>{notice.message}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>}</div></Context.Provider>;
}
export const useFeedback = () => useContext(Context);
