import { DashboardDirtyBanner, DashboardDirtyProvider } from "@/components/dashboard/dashboard-dirty-state";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardDirtyProvider>
      {children}
      <DashboardDirtyBanner />
    </DashboardDirtyProvider>
  );
}
