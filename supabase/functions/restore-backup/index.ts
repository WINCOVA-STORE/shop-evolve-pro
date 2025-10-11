import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { backupId } = await req.json();
    
    console.log('Restoring backup:', backupId);

    // Get backup info
    const { data: backup, error: backupError } = await supabaseClient
      .from('system_backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (backupError || !backup) {
      throw new Error('Backup not found');
    }

    if (backup.status !== 'completed') {
      throw new Error('Can only restore completed backups');
    }

    // Download backup file
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('backups')
      .download(backup.file_path);

    if (downloadError) throw downloadError;

    // Parse backup data
    const backupText = await fileData.text();
    const backupData = JSON.parse(backupText);

    console.log('Backup data parsed successfully');

    // Tables that can be safely restored
    const restorableTables = [
      'products',
      'categories', 
      'shipping_config',
      'rewards_config',
      'rewards_campaigns'
    ];

    let restoredCount = 0;

    // Restore each table
    for (const table of restorableTables) {
      if (!backupData.tables[table]) continue;

      try {
        const records = backupData.tables[table];
        
        if (records.length === 0) continue;

        console.log(`Restoring ${table}: ${records.length} records`);

        // For products and categories, we upsert to avoid conflicts
        const { error: restoreError } = await supabaseClient
          .from(table)
          .upsert(records, { onConflict: 'id' });

        if (restoreError) {
          console.error(`Error restoring ${table}:`, restoreError);
          continue;
        }

        restoredCount += records.length;
        console.log(`Restored ${table} successfully`);
      } catch (error) {
        console.error(`Error restoring ${table}:`, error);
      }
    }

    console.log(`Restoration complete. ${restoredCount} records restored.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        restoredCount,
        message: `Successfully restored ${restoredCount} records`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error restoring backup:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});