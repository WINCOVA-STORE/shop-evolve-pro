import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPresence } from "@/hooks/useRealtimePresence";
import { Users, Eye } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RealtimePresenceIndicatorProps {
  users: UserPresence[];
}

export const RealtimePresenceIndicator = ({ users }: RealtimePresenceIndicatorProps) => {
  const [expanded, setExpanded] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (users.length === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600">
                {users.length} {users.length === 1 ? 'usuario' : 'usuarios'} en línea
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">En vivo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <div className="flex -space-x-2">
                {users.slice(0, expanded ? users.length : 5).map((user) => (
                  <Tooltip key={user.user_id}>
                    <TooltipTrigger>
                      <Avatar className={`w-8 h-8 border-2 border-background ${getAvatarColor(user.user_id)}`}>
                        <AvatarFallback className="text-white text-xs">
                          {getInitials(user.full_name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{user.full_name || user.email}</p>
                        {user.viewing_task && (
                          <div className="flex items-center gap-1 text-xs">
                            <Eye className="h-3 w-3" />
                            <span>Viendo tarea</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Online: {new Date(user.online_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>

            {users.length > 5 && (
              <Badge 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Ver menos' : `+${users.length - 5} más`}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
