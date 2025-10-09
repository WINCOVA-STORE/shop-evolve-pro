import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProjectOverview } from "@/pages/admin/ProjectOverview";
import { ProjectPhases } from "@/pages/admin/ProjectPhases";
import { ProjectTasks } from "@/pages/admin/ProjectTasks";
import { ProjectMetrics } from "@/pages/admin/ProjectMetrics";
import { useProjectAuth } from "@/hooks/useProjectAuth";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminProject() {
  const { isAuthorized, isLoading } = useProjectAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Verificando permisos...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b flex items-center px-6 gap-4">
            <SidebarTrigger />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la tienda
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              Panel de Administración
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route index element={<ProjectOverview />} />
              <Route path="phases" element={<ProjectPhases />} />
              <Route path="tasks" element={<ProjectTasks />} />
              <Route path="metrics" element={<ProjectMetrics />} />
              <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
              <Route path="*" element={<Navigate to="/admin/project" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
