import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { Profile } from "@/types/database";

interface DashboardShellProps {
  children: React.ReactNode;
  profile: Profile;
  activePath: string;
}

export function DashboardShell({ children, profile, activePath }: DashboardShellProps) {
  return (
    <DashboardLayout profile={profile} activePath={activePath}>
      {children}
    </DashboardLayout>
  );
}
