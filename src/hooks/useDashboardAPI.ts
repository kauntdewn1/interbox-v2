export function useDashboardAPI() {
  return {
    loading: false,
    error: null,
    getDashboardStats: () => ({ users: { total: 0, newToday: 0 }, teams: { total: 0, confirmed: 0 }, financial: { totalRevenue: 0, totalOrders: 0 }, realtime: { onlineUsers: 0, lastUpdate: new Date() } }),
    getUsersData: () => [{ displayName: 'Usuário Exemplo' }],
    getTeamsData: () => [{ nome: 'Equipe Exemplo' }],
    getAudiovisualData: () => [{ nome: 'Audiovisual Exemplo' }],
    useDashboardStats: () => ({ stats: [{ users: { total: 0, newToday: 0 }, teams: { total: 0, confirmed: 0 }, financial: { totalRevenue: 0, totalOrders: 0 }, realtime: { onlineUsers: 0, lastUpdate: new Date() } }] }),
    useUsersData: () => ({ users: [{ displayName: 'Usuário Exemplo' }] }),
    useTeamsData: () => ({ teams: [{ nome: 'Equipe Exemplo' }] }),
    useAudiovisualData: () => ({ audiovisual: [{ nome: 'Audiovisual Exemplo' }] }),
  };
} 