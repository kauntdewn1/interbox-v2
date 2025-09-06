// ============================================================================
// HOOK DE QR CHECK-IN - INTERBØX V2
// ============================================================================
// Este hook fornece funcionalidades para processar check-ins via QR Code
// com validação de localização e rastreabilidade.
// ============================================================================

import { useState, useCallback } from 'react';
import { 
  processQRCheckin, 
  processSimpleQRCheckin,
  type QRCheckinData, 
  type QRCheckinResult 
} from '../lib/gamification-core';

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useQRCheckin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<QRCheckinResult | null>(null);

  const processCheckin = useCallback(async (data: QRCheckinData): Promise<QRCheckinResult> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await processQRCheckin(data);
      setLastResult(result);
      
      if (!result.success) {
        setError(result.message);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar check-in';
      setError(errorMessage);
      
      const errorResult: QRCheckinResult = {
        success: false,
        tokensAwarded: 0,
        message: errorMessage,
        errors: [errorMessage]
      };
      
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, []);

  const processSimpleCheckin = useCallback(async (
    qrCode: string,
    eventId: string,
    userId: string
  ): Promise<QRCheckinResult> => {
    return processCheckin({
      qrCode,
      eventId,
      userId
    });
  }, [processCheckin]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    processCheckin,
    processSimpleCheckin,
    loading,
    error,
    lastResult,
    clearError,
    clearResult
  };
}

// ============================================================================
// HOOK COM LOCALIZAÇÃO
// ============================================================================

export function useQRCheckinWithLocation() {
  const { processCheckin, loading, error, lastResult, clearError, clearResult } = useQRCheckin();
  const [locationPermission, setLocationPermission] = useState<PermissionState | null>(null);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada');
      }

      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationPermission(permission.state);

      if (permission.state === 'denied') {
        throw new Error('Permissão de localização negada');
      }

      return permission.state === 'granted';
    } catch (err) {
      console.error('Erro ao solicitar permissão de localização:', err);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null> => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (err) {
      console.error('Erro ao obter localização:', err);
      return null;
    }
  }, []);

  const processCheckinWithLocation = useCallback(async (
    qrCode: string,
    eventId: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<QRCheckinResult> => {
    try {
      const location = await getCurrentLocation();
      
      return processCheckin({
        qrCode,
        eventId,
        userId,
        location: location || undefined,
        metadata
      });
    } catch (err) {
      // Se falhar ao obter localização, processar sem ela
      return processCheckin({
        qrCode,
        eventId,
        userId,
        metadata
      });
    }
  }, [processCheckin, getCurrentLocation]);

  return {
    processCheckinWithLocation,
    requestLocationPermission,
    getCurrentLocation,
    loading,
    error,
    lastResult,
    locationPermission,
    clearError,
    clearResult
  };
}

// ============================================================================
// HOOK DE HISTÓRICO DE CHECK-INS
// ============================================================================

export function useQRCheckinHistory(userId: string) {
  const [checkins, setCheckins] = useState<Array<{
    id: string;
    eventId: string;
    eventName: string;
    checkinTime: Date;
    tokensAwarded: number;
    location?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckinHistory = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Simular busca de histórico (implementar com Supabase)
      const mockHistory = [
        {
          id: '1',
          eventId: 'event_1',
          eventName: 'Evento de Exemplo',
          checkinTime: new Date(),
          tokensAwarded: 25,
          location: 'Brasília, DF'
        }
      ];
      
      setCheckins(mockHistory);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar histórico';
      setError(errorMessage);
      console.error('Erro ao carregar histórico de check-ins:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const clearHistory = useCallback(() => {
    setCheckins([]);
  }, []);

  return {
    checkins,
    loading,
    error,
    fetchCheckinHistory,
    clearHistory
  };
}
