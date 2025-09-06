// ============================================================================
// API: GET VAPID PUBLIC KEY - INTERBØX V2
// ============================================================================
// Vercel Function para obter a chave pública VAPID
// ============================================================================

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      return res.status(500).json({ 
        error: 'VAPID public key not configured' 
      });
    }

    return res.status(200).json({ publicKey });

  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
