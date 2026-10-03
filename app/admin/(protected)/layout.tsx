import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) { const session = await requireAdmin(); return <AdminShell email={session.email}>{children}</AdminShell>; }
