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

    console.log('Checking if automatic backup is needed...');

    // Check if auto backup is enabled
    const { data: settings, error: settingsError } = await supabaseClient
      .from('backup_settings')
      .select('*')
      .single();

    if (settingsError || !settings || !settings.auto_backup_enabled) {
      console.log('Auto backup not enabled or settings not found');
      return new Response(
        JSON.stringify({ message: 'Auto backup not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we need to create a backup based on frequency
    const now = new Date();
    const lastBackup = settings.last_backup_at ? new Date(settings.last_backup_at) : null;
    
    let shouldBackup = false;
    
    if (!lastBackup) {
      shouldBackup = true;
    } else {
      const hoursSinceLastBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
      
      if (settings.frequency === 'daily' && hoursSinceLastBackup >= 24) {
        shouldBackup = true;
      } else if (settings.frequency === 'weekly' && hoursSinceLastBackup >= 168) {
        shouldBackup = true;
      }
    }

    if (!shouldBackup) {
      console.log('Backup not needed yet based on frequency');
      return new Response(
        JSON.stringify({ message: 'Backup not needed yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating automatic backup...');

    // Create backup record
    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = `auto-backup-${timestamp}.json`;

    const { error: insertError } = await supabaseClient
      .from('system_backups')
      .insert({
        id: backupId,
        backup_type: 'automatic',
        file_path: filePath,
        file_size: 0,
        status: 'in_progress',
        created_by: null
      });

    if (insertError) throw insertError;

    // Collect all data to backup
    const backupData: any = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      automatic: true,
      tables: {}
    };

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
          total_records: Object.values(backupData.tables).reduce((sum: number, t: any) => sum + t.length, 0),
          automatic: true
        }
      })
      .eq('id', backupId);

    if (updateError) throw updateError;

    // Update backup settings
    const { error: settingsUpdateError } = await supabaseClient
      .from('backup_settings')
      .update({
        last_backup_at: now.toISOString(),
        next_backup_at: new Date(now.getTime() + (settings.frequency === 'daily' ? 24 : 168) * 60 * 60 * 1000).toISOString()
      })
      .eq('id', settings.id);

    if (settingsUpdateError) {
      console.error('Error updating backup settings:', settingsUpdateError);
    }

    console.log('Automatic backup completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        backupId,
        filePath,
        fileSize,
        message: 'Automatic backup created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in scheduled backup:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});