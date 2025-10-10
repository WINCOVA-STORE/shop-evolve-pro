import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UserPresence {
  user_id: string;
  email: string;
  full_name?: string;
  viewing_task?: string;
  online_at: string;
}

export const useRealtimePresence = (roomId: string = 'roadmap-room') => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    let presenceChannel: RealtimeChannel;

    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      presenceChannel = supabase.channel(roomId);

      // Track presence
      presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannel.presenceState();
          // Extract all presence data from all users
          const users: UserPresence[] = [];
          Object.values(state).forEach((presences) => {
            presences.forEach((presence: any) => {
              if (presence.user_id) {
                users.push(presence as UserPresence);
              }
            });
          });
          setOnlineUsers(users);
          console.log('👥 Users online:', users.length);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('✅ User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('❌ User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            const userStatus: UserPresence = {
              user_id: user.id,
              email: profile?.email || user.email || 'Unknown',
              full_name: profile?.full_name || 'Unknown User',
              online_at: new Date().toISOString(),
            };

            await presenceChannel.track(userStatus);
            console.log('🟢 Presence tracked:', userStatus);
          }
        });

      setChannel(presenceChannel);
    };

    setupPresence();

    return () => {
      if (presenceChannel) {
        presenceChannel.unsubscribe();
        console.log('🔴 Unsubscribed from presence');
      }
    };
  }, [roomId]);

  const updateViewingTask = async (taskId?: string) => {
    if (!channel) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const userStatus: UserPresence = {
      user_id: user.id,
      email: profile?.email || user.email || 'Unknown',
      full_name: profile?.full_name || 'Unknown User',
      viewing_task: taskId,
      online_at: new Date().toISOString(),
    };

    await channel.track(userStatus);
  };

  return {
    onlineUsers,
    updateViewingTask,
  };
};
