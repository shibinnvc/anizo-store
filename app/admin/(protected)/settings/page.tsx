import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/firestore";
import { SettingsForm } from "@/components/admin/settings-form";
export default async function SettingsPage() { await requireAdmin(); return <SettingsForm settings={await getSiteSettings()} />; }
