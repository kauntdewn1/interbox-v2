// ============================================================================
// CACHE DE LEADERBOARD - INTERBØX V2
// ============================================================================
// Este arquivo implementa um sistema de cache para o leaderboard,
// melhorando performance e reduzindo carga no banco de dados.
// ============================================================================

import { supabase } from './supabase';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  boxTokens: number;
  level: string;
  rank: number;
  weeklyTokens: number;
  monthlyTokens: number;
  achievements: string[];
  badges: string[];
  lastActive: string;
  isOnline: boolean;
}

export interface LeaderboardCache {
  entries: LeaderboardEntry[];
  totalUsers: number;
  lastUpdated: Date;
  version: string;
  metadata: {
    cacheHit: boolean;
    processingTime: number;
    source: 'cache' | 'database' | 'hybrid';
  };
}

export interface CacheConfig {
  ttl: number; // Time to live em milissegundos
  maxSize: number; // Tamanho máximo do cache
  refreshThreshold: number; // Porcentagem para refresh automático
  enableCompression: boolean; // Habilitar compressão
  enablePersistence: boolean; // Persistir cache no localStorage
}

// ============================================================================
// CLASSE PRINCIPAL DO CACHE
// ============================================================================

export class LeaderboardCacheManager {
  private static instance: LeaderboardCacheManager;
  private cache: Map<string, LeaderboardCache> = new Map();
  private config: CacheConfig;
  private refreshQueue: Set<string> = new Set();
  private isRefreshing = false;

  private constructor() {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutos
      maxSize: 1000, // 1000 entradas
      refreshThreshold: 0.8, // 80% do TTL
      enableCompression: true,
      enablePersistence: true
    };

    // Carregar cache persistido
    this.loadPersistedCache();
  }

  static getInstance(): LeaderboardCacheManager {
    if (!LeaderboardCacheManager.instance) {
      LeaderboardCacheManager.instance = new LeaderboardCacheManager();
    }
    return LeaderboardCacheManager.instance;
  }

  // ============================================================================
  // CONFIGURAÇÃO
  // ============================================================================

  /**
   * Atualiza configuração do cache
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  // ============================================================================
  // OPERAÇÕES DE CACHE
  // ============================================================================

  /**
   * Obtém leaderboard do cache ou banco de dados
   */
  async getLeaderboard(
    limit: number = 50,
    offset: number = 0,
    forceRefresh: boolean = false
  ): Promise<LeaderboardCache> {
    const cacheKey = `leaderboard_${limit}_${offset}`;
    const startTime = Date.now();

    // Verificar se deve usar cache
    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          metadata: {
            ...cached.metadata,
            cacheHit: true,
            processingTime: Date.now() - startTime,
            source: 'cache'
          }
        };
      }
    }

    // Buscar do banco de dados
    const leaderboard = await this.fetchFromDatabase(limit, offset);
    
    // Armazenar no cache
    this.setCache(cacheKey, leaderboard);

    return {
      ...leaderboard,
      metadata: {
        ...leaderboard.metadata,
        cacheHit: false,
        processingTime: Date.now() - startTime,
        source: 'database'
      }
    };
  }

  /**
   * Obtém leaderboard de um usuário específico
   */
  async getUserLeaderboard(
    userId: string,
    limit: number = 10
  ): Promise<LeaderboardCache> {
    const cacheKey = `user_leaderboard_${userId}_${limit}`;
    const startTime = Date.now();

    // Verificar cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          cacheHit: true,
          processingTime: Date.now() - startTime,
          source: 'cache'
        }
      };
    }

    // Buscar do banco
    const leaderboard = await this.fetchUserLeaderboardFromDatabase(userId, limit);
    
    // Armazenar no cache
    this.setCache(cacheKey, leaderboard);

    return {
      ...leaderboard,
      metadata: {
        ...leaderboard.metadata,
        cacheHit: false,
        processingTime: Date.now() - startTime,
        source: 'database'
      }
    };
  }

  /**
   * Obtém estatísticas do leaderboard
   */
  async getLeaderboardStats(): Promise<{
    totalUsers: number;
    totalTokens: number;
    averageTokens: number;
    topLevel: string;
    mostCommonLevel: string;
    lastUpdated: Date;
  }> {
    const cacheKey = 'leaderboard_stats';
    const startTime = Date.now();

    // Verificar cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        totalUsers: cached.totalUsers,
        totalTokens: cached.entries.reduce((sum, entry) => sum + entry.boxTokens, 0),
        averageTokens: 0, // Será calculado
        topLevel: cached.entries[0]?.level || 'cindy',
        mostCommonLevel: this.getMostCommonLevel(cached.entries),
        lastUpdated: cached.lastUpdated
      };
    }

    // Buscar do banco
    const stats = await this.fetchStatsFromDatabase();
    
    // Armazenar no cache
    this.setCache(cacheKey, {
      entries: [],
      totalUsers: stats.totalUsers,
      lastUpdated: new Date(),
      version: '1.0.0',
      metadata: {
        cacheHit: false,
        processingTime: Date.now() - startTime,
        source: 'database'
      }
    });

    return stats;
  }

  // ============================================================================
  // OPERAÇÕES DE BANCO DE DADOS
  // ============================================================================

  /**
   * Busca leaderboard do banco de dados
   */
  private async fetchFromDatabase(limit: number, offset: number): Promise<LeaderboardCache> {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select(`
          user_id,
          box_tokens,
          level,
          weekly_tokens,
          monthly_tokens,
          achievements,
          badges,
          last_action_at,
          users!inner(
            id,
            username,
            avatar_url,
            is_online,
            last_seen
          )
        `)
        .order('box_tokens', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Erro ao buscar leaderboard: ${error.message}`);
      }

      const entries: LeaderboardEntry[] = (data || []).map((item: any, index) => ({
        userId: item.user_id,
        username: item.users?.username || 'Usuário',
        avatarUrl: item.users?.avatar_url,
        boxTokens: item.box_tokens,
        level: item.level,
        rank: offset + index + 1,
        weeklyTokens: item.weekly_tokens,
        monthlyTokens: item.monthly_tokens,
        achievements: item.achievements || [],
        badges: item.badges || [],
        lastActive: item.last_action_at,
        isOnline: item.users?.is_online || false
      }));

      return {
        entries,
        totalUsers: entries.length,
        lastUpdated: new Date(),
        version: '1.0.0',
        metadata: {
          cacheHit: false,
          processingTime: 0,
          source: 'database'
        }
      };

    } catch (error) {
      console.error('Erro ao buscar leaderboard:', error);
      return {
        entries: [],
        totalUsers: 0,
        lastUpdated: new Date(),
        version: '1.0.0',
        metadata: {
          cacheHit: false,
          processingTime: 0,
          source: 'database'
        }
      };
    }
  }

  /**
   * Busca leaderboard de um usuário específico
   */
  private async fetchUserLeaderboardFromDatabase(
    userId: string, 
    limit: number
  ): Promise<LeaderboardCache> {
    try {
      // Primeiro, obter posição do usuário
      const { data: userData } = await supabase
        .from('user_gamification')
        .select('box_tokens')
        .eq('user_id', userId)
        .single();

      if (!userData) {
        return {
          entries: [],
          totalUsers: 0,
          lastUpdated: new Date(),
          version: '1.0.0',
          metadata: {
            cacheHit: false,
            processingTime: 0,
            source: 'database'
          }
        };
      }

      // Buscar usuários próximos
      const { data } = await supabase
        .from('user_gamification')
        .select(`
          user_id,
          box_tokens,
          level,
          weekly_tokens,
          monthly_tokens,
          achievements,
          badges,
          last_action_at,
          users!inner(
            id,
            username,
            avatar_url,
            is_online,
            last_seen
          )
        `)
        .order('box_tokens', { ascending: false })
        .limit(limit);

      if (!data) {
        return {
          entries: [],
          totalUsers: 0,
          lastUpdated: new Date(),
          version: '1.0.0',
          metadata: {
            cacheHit: false,
            processingTime: 0,
            source: 'database'
          }
        };
      }

      const entries: LeaderboardEntry[] = data.map((item: any, index) => ({
        userId: item.user_id,
        username: item.users?.username || 'Usuário',
        avatarUrl: item.users?.avatar_url,
        boxTokens: item.box_tokens,
        level: item.level,
        rank: index + 1,
        weeklyTokens: item.weekly_tokens,
        monthlyTokens: item.monthly_tokens,
        achievements: item.achievements || [],
        badges: item.badges || [],
        lastActive: item.last_action_at,
        isOnline: item.users?.is_online || false
      }));

      return {
        entries,
        totalUsers: entries.length,
        lastUpdated: new Date(),
        version: '1.0.0',
        metadata: {
          cacheHit: false,
          processingTime: 0,
          source: 'database'
        }
      };

    } catch (error) {
      console.error('Erro ao buscar leaderboard do usuário:', error);
      return {
        entries: [],
        totalUsers: 0,
        lastUpdated: new Date(),
        version: '1.0.0',
        metadata: {
          cacheHit: false,
          processingTime: 0,
          source: 'database'
        }
      };
    }
  }

  /**
   * Busca estatísticas do banco de dados
   */
  private async fetchStatsFromDatabase(): Promise<{
    totalUsers: number;
    totalTokens: number;
    averageTokens: number;
    topLevel: string;
    mostCommonLevel: string;
    lastUpdated: Date;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('box_tokens, level');

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const totalUsers = data?.length || 0;
      const totalTokens = data?.reduce((sum, item) => sum + item.box_tokens, 0) || 0;
      const averageTokens = totalUsers > 0 ? totalTokens / totalUsers : 0;
      
      const topLevel = data?.[0]?.level || 'cindy';
      const mostCommonLevel = this.getMostCommonLevel(data || []);

      return {
        totalUsers,
        totalTokens,
        averageTokens,
        topLevel,
        mostCommonLevel,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalUsers: 0,
        totalTokens: 0,
        averageTokens: 0,
        topLevel: 'cindy',
        mostCommonLevel: 'cindy',
        lastUpdated: new Date()
      };
    }
  }

  // ============================================================================
  // OPERAÇÕES DE CACHE
  // ============================================================================

  /**
   * Obtém dados do cache
   */
  private getFromCache(key: string): LeaderboardCache | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Verificar se expirou
    const now = Date.now();
    const age = now - cached.lastUpdated.getTime();
    
    if (age > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Verificar se precisa de refresh
    if (age > this.config.ttl * this.config.refreshThreshold) {
      this.scheduleRefresh(key);
    }

    return cached;
  }

  /**
   * Armazena dados no cache
   */
  private setCache(key: string, data: LeaderboardCache): void {
    // Verificar tamanho máximo
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, data);

    // Persistir se habilitado
    if (this.config.enablePersistence) {
      this.persistCache();
    }
  }

  /**
   * Remove entrada mais antiga do cache
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.lastUpdated.getTime() < oldestTime) {
        oldestTime = value.lastUpdated.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Agenda refresh de uma entrada
   */
  private scheduleRefresh(key: string): void {
    if (this.refreshQueue.has(key)) {
      return;
    }

    this.refreshQueue.add(key);
    this.processRefreshQueue();
  }

  /**
   * Processa fila de refresh
   */
  private async processRefreshQueue(): Promise<void> {
    if (this.isRefreshing || this.refreshQueue.size === 0) {
      return;
    }

    this.isRefreshing = true;

    try {
      const keys = Array.from(this.refreshQueue);
      this.refreshQueue.clear();

      for (const key of keys) {
        await this.refreshCacheEntry(key);
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Atualiza entrada específica do cache
   */
  private async refreshCacheEntry(key: string): Promise<void> {
    try {
      // Extrair parâmetros da chave
      const parts = key.split('_');
      if (parts[0] === 'leaderboard') {
        const limit = parseInt(parts[1]) || 50;
        const offset = parseInt(parts[2]) || 0;
        const data = await this.fetchFromDatabase(limit, offset);
        this.setCache(key, data);
      } else if (parts[0] === 'user' && parts[1] === 'leaderboard') {
        const userId = parts[2];
        const limit = parseInt(parts[3]) || 10;
        const data = await this.fetchUserLeaderboardFromDatabase(userId, limit);
        this.setCache(key, data);
      }
    } catch (error) {
      console.error(`Erro ao atualizar cache ${key}:`, error);
    }
  }

  // ============================================================================
  // PERSISTÊNCIA
  // ============================================================================

  /**
   * Carrega cache persistido
   */
  private loadPersistedCache(): void {
    if (!this.config.enablePersistence || typeof window === 'undefined') {
      return;
    }

    try {
      const persisted = localStorage.getItem('leaderboard_cache');
      if (persisted) {
        const data = JSON.parse(persisted);
        this.cache = new Map(data);
      }
    } catch (error) {
      console.error('Erro ao carregar cache persistido:', error);
    }
  }

  /**
   * Persiste cache
   */
  private persistCache(): void {
    if (!this.config.enablePersistence || typeof window === 'undefined') {
      return;
    }

    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem('leaderboard_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao persistir cache:', error);
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  /**
   * Obtém nível mais comum
   */
  private getMostCommonLevel(entries: any[]): string {
    const levelCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      const level = entry.level || 'cindy';
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    return Object.entries(levelCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'cindy';
  }

  /**
   * Limpa cache
   */
  clearCache(): void {
    this.cache.clear();
    this.refreshQueue.clear();
    
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem('leaderboard_cache');
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    let oldestTime = now;
    let newestTime = 0;
    
    entries.forEach(entry => {
      const time = entry.lastUpdated.getTime();
      if (time < oldestTime) oldestTime = time;
      if (time > newestTime) newestTime = time;
    });

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Seria calculado com métricas reais
      oldestEntry: oldestTime < now ? new Date(oldestTime) : null,
      newestEntry: newestTime > 0 ? new Date(newestTime) : null
    };
  }

  /**
   * Força refresh de todas as entradas
   */
  async refreshAll(): Promise<void> {
    const keys = Array.from(this.cache.keys());
    this.refreshQueue = new Set(keys);
    await this.processRefreshQueue();
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const leaderboardCache = LeaderboardCacheManager.getInstance();

// ============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

/**
 * Obtém leaderboard com cache
 */
export async function getCachedLeaderboard(
  limit: number = 50,
  offset: number = 0,
  forceRefresh: boolean = false
): Promise<LeaderboardCache> {
  return leaderboardCache.getLeaderboard(limit, offset, forceRefresh);
}

/**
 * Obtém leaderboard de um usuário com cache
 */
export async function getCachedUserLeaderboard(
  userId: string,
  limit: number = 10
): Promise<LeaderboardCache> {
  return leaderboardCache.getUserLeaderboard(userId, limit);
}

/**
 * Obtém estatísticas do leaderboard com cache
 */
export async function getCachedLeaderboardStats(): Promise<{
  totalUsers: number;
  totalTokens: number;
  averageTokens: number;
  topLevel: string;
  mostCommonLevel: string;
  lastUpdated: Date;
}> {
  return leaderboardCache.getLeaderboardStats();
}

/**
 * Limpa cache do leaderboard
 */
export function clearLeaderboardCache(): void {
  leaderboardCache.clearCache();
}

/**
 * Obtém estatísticas do cache
 */
export function getLeaderboardCacheStats(): {
  size: number;
  maxSize: number;
  hitRate: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
} {
  return leaderboardCache.getCacheStats();
}
