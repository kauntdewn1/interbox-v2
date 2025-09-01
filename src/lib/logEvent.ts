import { supabase } from './supabase'

export async function logEvent({
  userId,
  eventName,
  eventData,
  userAgent,
  ipAddress,
}: {
  userId?: string
  eventName: string
  eventData?: boolean
  userAgent?: string
  ipAddress?: string
}) {
  const { error } = await supabase.from('analytics_events').insert ([{
    user_id: userId ?? null,
    event_name: eventName,
    event_data: eventData ?? false,
    user_agent: userAgent ?? null,
    ip_address: ipAddress ?? null,
  }])

  if (error) {
    console.error('Erro ao registrar evento:', error.message)
  }
}
