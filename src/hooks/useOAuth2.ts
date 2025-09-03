import { useState, useEffect } from 'react';

// 🔒 HOOK PARA GERENCIAR FLUXO OAUTH2 COM CLERK COMO IDP
export default function useOAuth2() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Configurações OAuth2
  const config = {
    discoveryUrl: 'https://clerk.cerradointerbox.com.br/.well-known/openid-configuration',
    authorizeUrl: 'https://clerk.cerradointerbox.com.br/oauth/authorize',
    tokenUrl: 'https://clerk.cerradointerbox.com.br/oauth/token',
    userInfoUrl: 'https://clerk.cerradointerbox.com.br/oauth/userinfo',
    clientId: import.meta.env.VITE_CLERK_CLIENT_ID,
    redirectUri: import.meta.env.VITE_CLERK_REDIRECT_URI || window.location.origin + '/auth/callback',
    scope: 'openid profile email',
  };

  // Iniciar fluxo de autorização
  const initiateAuth = () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope,
      state: Math.random().toString(36).substring(7), // CSRF protection
    });

    const authUrl = `${config.authorizeUrl}?${params.toString()}`;
    window.location.href = authUrl;
  };

  // Trocar authorization code por tokens
  const exchangeCodeForTokens = async (code: string, state: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.clientId,
          client_secret: import.meta.env.VITE_CLERK_CLIENT_SECRET,
          code: code,
          redirect_uri: config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao trocar código por tokens');
      }

      const tokens = await response.json();
      return tokens;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Obter informações do usuário
  const getUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(config.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao obter informações do usuário');
      }

      const userInfo = await response.json();
      setUser(userInfo);
      return userInfo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter dados do usuário');
      throw err;
    }
  };

  // Validar token
  const validateToken = async (accessToken: string) => {
    try {
      const response = await fetch('https://clerk.cerradointerbox.com.br/oauth/token_info', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao validar token');
      throw err;
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
  };

  // Verificar se há tokens salvos
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      getUserInfo(accessToken).catch(() => {
        // Se falhar, limpar tokens inválidos
        logout();
      });
    }
  }, []);

  return {
    isLoading,
    error,
    user,
    initiateAuth,
    exchangeCodeForTokens,
    getUserInfo,
    validateToken,
    logout,
    config,
  };
}
