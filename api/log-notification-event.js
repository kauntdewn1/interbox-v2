// ============================================================================
// API: LOG NOTIFICATION EVENT - INTERBØX V2
// ============================================================================
// Vercel Function para log de eventos de notificação
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      campaign_id,
      event,
      error,
      timestamp,
      user_id,
      device_token
    } = req.body;

    // Validar dados obrigatórios
    if (!campaign_id || !event) {
      return res.status(400).json({ 
        error: 'Campaign ID and event are required' 
      });
    }

    // Mapear eventos para status
    const eventStatusMap = {
      'shown': 'delivered',
      'clicked': 'clicked',
      'closed': 'closed',
      'error': 'failed'
    };

    const status = eventStatusMap[event] || event;

    // Preparar dados do log
    const logData = {
      campaign_id,
      status,
      error_message: error || null,
      sent_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
    };

    // Adicionar user_id se disponível
    if (user_id) {
      logData.user_id = user_id;
    }

    // Adicionar device_token se disponível
    if (device_token) {
      logData.device_token = device_token;
    }

    // Inserir log
    const { data: log, error: logError } = await supabase
      .from('push_logs')
      .insert(logData)
      .select()
      .single();

    if (logError) {
      console.error('Error creating log:', logError);
      return res.status(500).json({ 
        error: 'Failed to create log' 
      });
    }

    // Atualizar estatísticas da campanha se necessário
    if (event === 'clicked') {
      await supabase.rpc('increment_campaign_clicked', {
        campaign_id: campaign_id
      });
    } else if (event === 'shown') {
      await supabase.rpc('increment_campaign_delivered', {
        campaign_id: campaign_id
      });
    }

    return res.status(200).json({
      success: true,
      log_id: log.id,
      message: 'Event logged successfully'
    });

  } catch (error) {
    console.error('Error in log-notification-event:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
