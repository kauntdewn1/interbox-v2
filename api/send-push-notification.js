// ============================================================================
// API: SEND PUSH NOTIFICATION - INTERBØX V2
// ============================================================================
// Vercel Function para envio de push notifications
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
      title,
      body,
      target_users,
      target_role,
      target_type = 'all',
      priority = 'normal',
      icon_url,
      image_url,
      action_url,
      scheduled_at
    } = req.body;

    // Validar dados obrigatórios
    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Title and body are required' 
      });
    }

    // Se não for campanha existente, criar nova
    let campaignId = campaign_id;
    if (!campaignId) {
      const { data: campaign, error: campaignError } = await supabase
        .from('push_campaigns')
        .insert({
          title,
          body,
          target_type,
          target_role,
          target_users,
          priority,
          icon_url,
          image_url,
          action_url,
          scheduled_at,
          status: 'draft'
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Error creating campaign:', campaignError);
        return res.status(500).json({ 
          error: 'Failed to create campaign' 
        });
      }

      campaignId = campaign.id;
    }

    // Obter usuários alvo
    let users = [];
    
    if (target_type === 'all') {
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, email')
        .eq('is_active', true);
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return res.status(500).json({ 
          error: 'Failed to fetch users' 
        });
      }
      
      users = allUsers || [];
    } else if (target_type === 'role' && target_role) {
      const { data: roleUsers, error: roleError } = await supabase
        .from('users')
        .select('id, display_name, email')
        .eq('role', target_role)
        .eq('is_active', true);
      
      if (roleError) {
        console.error('Error fetching role users:', roleError);
        return res.status(500).json({ 
          error: 'Failed to fetch role users' 
        });
      }
      
      users = roleUsers || [];
    } else if (target_type === 'specific' && target_users?.length > 0) {
      const { data: specificUsers, error: specificError } = await supabase
        .from('users')
        .select('id, display_name, email')
        .in('id', target_users)
        .eq('is_active', true);
      
      if (specificError) {
        console.error('Error fetching specific users:', specificError);
        return res.status(500).json({ 
          error: 'Failed to fetch specific users' 
        });
      }
      
      users = specificUsers || [];
    }

    if (users.length === 0) {
      return res.status(400).json({ 
        error: 'No users found for the specified criteria' 
      });
    }

    // Obter tokens de dispositivos dos usuários
    const userIds = users.map(user => user.id);
    const { data: devices, error: devicesError } = await supabase
      .from('user_devices')
      .select('user_id, device_token, platform')
      .in('user_id', userIds)
      .eq('is_active', true);

    if (devicesError) {
      console.error('Error fetching devices:', devicesError);
      return res.status(500).json({ 
        error: 'Failed to fetch user devices' 
      });
    }

    const deviceTokens = devices?.map(device => device.device_token) || [];

    if (deviceTokens.length === 0) {
      return res.status(400).json({ 
        error: 'No active devices found for the target users' 
      });
    }

    // Preparar payload da notificação
    const notificationPayload = {
      title,
      body,
      icon: icon_url || '/favicon-192x192.png',
      badge: '/favicon-96x96.png',
      image: image_url,
      tag: `interbox-${campaignId}`,
      data: {
        url: action_url || '/',
        campaign_id: campaignId,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/favicon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ],
      requireInteraction: priority === 'urgent' || priority === 'high',
      vibrate: priority === 'urgent' ? [200, 100, 200, 100, 200] : [200, 100, 200]
    };

    // Enviar notificações via Web Push
    const webPush = require('web-push');
    
    // Configurar VAPID keys (você deve configurar essas variáveis de ambiente)
    const vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
      subject: process.env.VAPID_SUBJECT || 'mailto:contato@interbox.com.br'
    };

    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      console.error('VAPID keys not configured');
      return res.status(500).json({ 
        error: 'Push notification service not configured' 
      });
    }

    webPush.setVapidDetails(
      vapidKeys.subject,
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    // Enviar notificações
    const sendPromises = deviceTokens.map(async (deviceToken) => {
      try {
        await webPush.sendNotification(deviceToken, JSON.stringify(notificationPayload));
        
        // Log de sucesso
        await supabase
          .from('push_logs')
          .insert({
            campaign_id: campaignId,
            device_token: deviceToken,
            status: 'sent',
            sent_at: new Date().toISOString()
          });

        return { success: true, token: deviceToken };
      } catch (error) {
        console.error('Error sending notification:', error);
        
        // Log de erro
        await supabase
          .from('push_logs')
          .insert({
            campaign_id: campaignId,
            device_token: deviceToken,
            status: 'failed',
            error_message: error.message,
            sent_at: new Date().toISOString()
          });

        return { success: false, token: deviceToken, error: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Atualizar estatísticas da campanha
    await supabase
      .from('push_campaigns')
      .update({
        total_recipients: deviceTokens.length,
        delivered_count: successful,
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    return res.status(200).json({
      success: true,
      campaign_id: campaignId,
      total_recipients: deviceTokens.length,
      successful,
      failed,
      message: `Push notifications sent: ${successful}/${deviceTokens.length}`
    });

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
