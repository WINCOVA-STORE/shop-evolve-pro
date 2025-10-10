import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  id: string;
  type: 'task_updated' | 'task_completed' | 'task_blocked' | 'task_assigned';
  title: string;
  description: string;
  task_id?: string;
  user_email?: string;
  timestamp: string;
}

export const useRealtimeNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Listen to roadmap changes
    const channel = supabase
      .channel('roadmap-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ecommerce_roadmap_items'
        },
        async (payload) => {
          console.log('🔔 Roadmap change detected:', payload);

          let notification: RealtimeNotification | null = null;

          if (payload.eventType === 'UPDATE') {
            const oldData = payload.old as any;
            const newData = payload.new as any;

            // Task completed
            if (oldData.status !== 'done' && newData.status === 'done') {
              notification = {
                id: `${Date.now()}-completed`,
                type: 'task_completed',
                title: '✅ Tarea completada',
                description: `"${newData.feature_name}" ha sido marcada como completada`,
                task_id: newData.id,
                timestamp: new Date().toISOString(),
              };
            }
            // Task blocked
            else if (oldData.status !== 'blocked' && newData.status === 'blocked') {
              notification = {
                id: `${Date.now()}-blocked`,
                type: 'task_blocked',
                title: '🚫 Tarea bloqueada',
                description: `"${newData.feature_name}" está bloqueada: ${newData.blocked_reason || 'Sin razón'}`,
                task_id: newData.id,
                timestamp: new Date().toISOString(),
              };
            }
            // Task assigned
            else if (oldData.assigned_to !== newData.assigned_to && newData.assigned_to) {
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user && newData.assigned_to === user.id) {
                notification = {
                  id: `${Date.now()}-assigned`,
                  type: 'task_assigned',
                  title: '👤 Nueva asignación',
                  description: `Se te ha asignado: "${newData.feature_name}"`,
                  task_id: newData.id,
                  timestamp: new Date().toISOString(),
                };
              }
            }
            // Status updated
            else if (oldData.status !== newData.status) {
              const statusLabels: Record<string, string> = {
                todo: 'Pendiente',
                in_progress: 'En Progreso',
                done: 'Completada',
                blocked: 'Bloqueada',
              };

              notification = {
                id: `${Date.now()}-updated`,
                type: 'task_updated',
                title: '📝 Estado actualizado',
                description: `"${newData.feature_name}": ${statusLabels[oldData.status]} → ${statusLabels[newData.status]}`,
                task_id: newData.id,
                timestamp: new Date().toISOString(),
              };
            }
          }

          if (notification) {
            setNotifications((prev) => [notification!, ...prev].slice(0, 50));
            setUnreadCount((prev) => prev + 1);

            // Show toast notification
            toast({
              title: notification.title,
              description: notification.description,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
  };
};
