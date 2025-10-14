import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SyncLog {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  products_synced: number;
  products_created: number;
  products_updated: number;
  products_skipped: number;
  products_deleted: number;
  products_failed: number;
  error_message: string | null;
  sync_type: string;
}

const WooCommerceSync = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchLogs();
  }, []);

  const checkAdminAndFetchLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You need admin privileges to access this page."
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
      await fetchSyncLogs();
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('woocommerce_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load sync logs."
      });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    let syncLogId: string | null = null;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      // Start the sync with a short timeout (the function will continue in background)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await supabase.functions.invoke('sync-woocommerce', {
          body: { syncType: 'manual' },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        clearTimeout(timeoutId);

        if (response.error) {
          throw response.error;
        }

        if (response.data?.syncLogId) {
          syncLogId = response.data.syncLogId;
        }
      } catch (invokeError: any) {
        // If it's a timeout, that's expected - the function is still running
        if (invokeError.name !== 'AbortError' && !invokeError.message?.includes('aborted')) {
          throw invokeError;
        }
        console.log('Function invocation timeout (expected) - sync continues in background');
      }

      toast({
        title: "Sync Started",
        description: "WooCommerce products are being synchronized. This may take a few minutes..."
      });

      // Poll for updates every 3 seconds
      const pollInterval = setInterval(async () => {
        await fetchSyncLogs();
        
        // Check if latest log is completed
        const { data: latestLog } = await supabase
          .from('woocommerce_sync_logs')
          .select('status')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (latestLog && (latestLog.status === 'success' || latestLog.status === 'failed')) {
          clearInterval(pollInterval);
          setSyncing(false);
          
          toast({
            title: latestLog.status === 'success' ? "Sync Completed" : "Sync Failed",
            description: latestLog.status === 'success' 
              ? "All products have been synchronized successfully."
              : "The synchronization encountered an error.",
            variant: latestLog.status === 'failed' ? "destructive" : "default"
          });
        }
      }, 3000);

      // Stop polling after 5 minutes max
      setTimeout(() => {
        clearInterval(pollInterval);
        setSyncing(false);
      }, 300000);

    } catch (error: any) {
      console.error('Error syncing:', error);
      
      // Detectar errores de CAPTCHA
      let errorTitle = "Sync Failed";
      let errorDescription = error.message || "Failed to start synchronization.";
      
      if (error.message?.includes('CAPTCHA') || error.message?.includes('sgcaptcha') || error.message?.includes('403')) {
        errorTitle = "🛡️ Security Block Detected";
        errorDescription = "Tu servidor WooCommerce bloqueó la sincronización con protección anti-bot. Por favor:\n\n1. Desactiva temporalmente plugins de seguridad (SiteGround Security, Wordfence, etc.)\n2. O agrega las IPs de Supabase a tu lista blanca\n3. Vuelve a intentar la sincronización";
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorDescription,
        duration: 10000 // 10 segundos para mensajes importantes
      });
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'running':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Running</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">WooCommerce Synchronization</h1>
              <p className="text-muted-foreground mt-2">
                Sync products from your WooCommerce store to Wincova
              </p>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={syncing}
              size="lg"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent synchronization logs and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync logs yet. Click "Sync Now" to start your first synchronization.
                </div>
              ) : (
                <div className="space-y-4">
                  {syncLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(log.status)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.started_at).toLocaleString()}
                          </span>
                          <Badge variant="outline">{log.sync_type}</Badge>
                        </div>
                        {log.completed_at && (
                          <span className="text-sm text-muted-foreground">
                            Duration: {Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)}s
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Synced:</span>
                          <span className="ml-2 font-semibold">{log.products_synced}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2 font-semibold text-green-600">{log.products_created}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Updated:</span>
                          <span className="ml-2 font-semibold text-blue-600">{log.products_updated}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Unchanged:</span>
                          <span className="ml-2 font-semibold text-gray-600">⚡ {log.products_skipped || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deactivated:</span>
                          <span className="ml-2 font-semibold text-orange-600">{log.products_deleted || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Failed:</span>
                          <span className="ml-2 font-semibold text-red-600">{log.products_failed}</span>
                        </div>
                      </div>

                      {(log.products_skipped > 0 || log.products_updated > 0) && (
                        <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
                          💰 Resources saved: {(log.products_updated * 4) + (log.products_skipped || 0)} operations 
                          ({log.products_updated * 4} AI translations + {log.products_skipped || 0} DB updates)
                        </div>
                      )}

                      {log.error_message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-red-800">Error Details:</p>
                              <p className="text-sm text-red-700 mt-1">{log.error_message}</p>
                              
                              {(log.error_message.includes('CAPTCHA') || 
                                log.error_message.includes('sgcaptcha') || 
                                log.error_message.includes('403') ||
                                log.error_message.includes('Non-JSON response (202)')) && (
                                <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs space-y-1">
                                  <p className="font-semibold text-red-900">🛡️ Security Block - How to Fix:</p>
                                  <ol className="list-decimal list-inside space-y-1 text-red-800">
                                    <li>Go to your WooCommerce hosting panel (SiteGround, Cloudflare, etc.)</li>
                                    <li>Temporarily disable anti-bot protection or CAPTCHA</li>
                                    <li>Alternative: Add Supabase IPs to your firewall whitelist</li>
                                    <li>Try syncing again</li>
                                  </ol>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                WooCommerce integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">WooCommerce URL</div>
                  <div className="text-sm text-muted-foreground">catalog.wincova.com</div>
                </div>
                <Badge variant="outline" className="bg-green-50">Connected</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="font-medium">API Status</div>
                  <div className="text-sm text-muted-foreground">WooCommerce REST API v3</div>
                </div>
                <Badge variant="outline" className="bg-green-50">Active</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Sync Mode</div>
                  <div className="text-sm text-muted-foreground">Manual & Automatic</div>
                </div>
                <Badge variant="outline">Configured</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WooCommerceSync;
