import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProjectAuth = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }

        // Check if user has admin or dev role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .in('role', ['admin']);

        if (!roles || roles.length === 0) {
          toast({
            title: "Acceso denegado",
            description: "No tienes permisos para acceder al panel de administración",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  return { isAuthorized, isLoading };
};
