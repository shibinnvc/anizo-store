import { requireAdmin } from "@/lib/auth";
import { getHeroSettings } from "@/lib/firestore";
import { HeroForm } from "@/components/admin/hero-form";
export default async function HeroManagement() { await requireAdmin(); return <HeroForm hero={await getHeroSettings()} />; }
