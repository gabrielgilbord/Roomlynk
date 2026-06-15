import { getSessionProfile, dashboardPathForRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login");
  redirect(dashboardPathForRole(profile.role));
}
