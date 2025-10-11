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

    const { backupType, userId } = await req.json();
    
    console.log('Creating backup:', { backupType, userId });

    // Create backup record
    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `backup-${timestamp}.json`;

    // Insert initial backup record
    const { error: insertError } = await supabaseClient
      .from('system_backups')
      .insert({
        id: backupId,
        backup_type: backupType,
        file_path: filePath,
        file_size: 0,
        status: 'in_progress',
        created_by: userId
      });

    if (insertError) throw insertError;

    // Collect all data to backup
    const backupData: any = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      tables: {}
    };

    // Tables to backup
    const tablesToBackup = [
      'products',
      'categories',
      'orders',
      'order_items',
      'profiles',
      'reviews',
      'rewards',
      'rewards_config',
      'rewards_campaigns',
      'shipping_config',
      'referrals',
      'user_roles'
    ];

    // Fetch data from each table
    for (const table of tablesToBackup) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*');

        if (error) {
          console.error(`Error fetching ${table}:`, error);
          continue;
        }

        backupData.tables[table] = data || [];
        console.log(`Backed up ${table}: ${data?.length || 0} records`);
      } catch (error) {
        console.error(`Error backing up ${table}:`, error);
      }
    }

    // Convert to JSON and calculate size
    const backupJson = JSON.stringify(backupData, null, 2);
    const backupBlob = new Blob([backupJson], { type: 'application/json' });
    const fileSize = backupBlob.size;

    console.log(`Backup size: ${fileSize} bytes`);

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from('backups')
      .upload(filePath, backupBlob, {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Update backup record with completion
    const { error: updateError } = await supabaseClient
      .from('system_backups')
      .update({
        file_size: fileSize,
        status: 'completed',
        metadata: {
          tables_count: tablesToBackup.length,
          total_records: Object.values(backupData.tables).reduce((sum: number, t: any) => sum + t.length, 0)
        }
      })
      .eq('id', backupId);

    if (updateError) throw updateError;

    console.log('Backup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        backupId,
        filePath,
        fileSize 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error creating backup:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});