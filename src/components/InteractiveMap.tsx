import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker, Circle } from "leaflet";

interface EventData {
  slug: string;
  name: string;
  city: string;
  state: string;
  location: {
    lat: number;
    lng: number;
  };
  dates: string[];
  url: string;
  radius_m: number;
  regions: string[];
  description: string;
  tags: string[];
}

interface InteractiveMapProps {
  className?: string;
  showRadius?: boolean;
  showNavigation?: boolean;
  enableGeolocation?: boolean;
}

export default function InteractiveMap({ 
  className = '',
  showRadius = true,
  showNavigation = true,
  enableGeolocation = true
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados do evento
  useEffect(() => {
    const loadEventData = async () => {
      try {
        const response = await fetch('/events-data.json');
        const data = await response.json();
        setEventData(data.events[0]);
      } catch (error) {
        console.error('Erro ao carregar dados do evento:', error);
      }
    };

    loadEventData();
  }, []);

  // Função para calcular distância usando fórmula de Haversine
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
  };

  // Obter localização do usuário
  useEffect(() => {
    if (!enableGeolocation || !eventData) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });
          
          const dist = haversineDistance(
            userLat,
            userLng,
            eventData.location.lat,
            eventData.location.lng
          );
          setDistance(dist);
        },
        (error) => {
          console.log('Erro ao obter localização:', error);
          setUserLocation(null);
        }
      );
    }
  }, [eventData, enableGeolocation]);

  // Renderizar mapa
  useEffect(() => {
    if (!mapRef.current || !eventData) return;

    let map: LeafletMap | null = null;
    let markers: (Marker | Circle)[] = [];

    // Carregar Leaflet dinamicamente
    const loadLeaflet = async () => {
      setIsLoading(true);
      const L = await import('leaflet');
      
      // Limpar mapa existente se houver
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        map?.remove();
      }
      
      // Configurar ícones do Leaflet
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      map = L.map(mapRef.current!).setView([eventData.location.lat, eventData.location.lng], 8);

      // Adicionar camada de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Marcador do evento
      const eventMarker = L.marker([eventData.location.lat, eventData.location.lng])
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <h3 style="color: #ec4899; margin: 0 0 10px 0;">${eventData.name}</h3>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${eventData.dates.join(', ')}</p>
            <p style="margin: 5px 0;"><strong>Local:</strong> ${eventData.city} - ${eventData.state}</p>
            <p style="margin: 5px 0;"><strong>Alcance:</strong> ${eventData.radius_m / 1000}km</p>
            <a href="${eventData.url}" target="_blank" style="color: #ec4899; text-decoration: none;">Saiba mais</a>
          </div>
        `)
        .openPopup();

      markers.push(eventMarker);

      // Círculo de alcance
      if (showRadius) {
        const circle = L.circle([eventData.location.lat, eventData.location.lng], {
          radius: eventData.radius_m,
          color: '#ec4899',
          fillColor: '#ec4899',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map);
        markers.push(circle);
      }

      // Marcador do usuário se disponível
      if (userLocation) {
        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map).bindPopup('Sua localização');
        markers.push(userMarker);
      }

      setIsLoading(false);
    };

    loadLeaflet();

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [eventData, userLocation, showRadius]);

  if (!eventData) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Informações do evento */}
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-2">{eventData.name}</h3>
        <p className="text-gray-300 mb-2">{eventData.description}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded">📍 {eventData.city} - {eventData.state}</span>
          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">📅 {eventData.dates.join(', ')}</span>
          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">🎯 {eventData.radius_m / 1000}km de alcance</span>
        </div>
      </div>

      {/* Gamificação por distância */}
      {distance !== null && (
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-lg p-4 border border-pink-500/30">
          {distance < (eventData.radius_m / 1000) ? (
            <div className="text-center">
              <p className="text-pink-300 font-semibold mb-2">⚡️ Você está dentro do raio do CERRADO INTERBØX!</p>
              <p className="text-sm text-gray-300">Prepare-se para o maior evento de times da América Latina!</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-blue-300 font-semibold mb-2">🚗 Você está a {distance}km do evento</p>
              <p className="text-sm text-gray-300">Partiu caravana? Organize sua equipe e venha participar!</p>
            </div>
          )}
        </div>
      )}

      {/* Mensagem quando geolocalização falha */}
      {!userLocation && enableGeolocation && (
        <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30">
          <p className="text-yellow-300 text-center text-sm">
            📍 Não foi possível obter sua localização. Habilite o GPS para calcular distância.
          </p>
        </div>
      )}

      {/* Mapa */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border border-white/20"
          style={{ minHeight: '384px' }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-white">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Botões de navegação */}
      {showNavigation && (
        <div className="space-y-4">
          {/* Link para o Google My Maps */}
          <div className="text-center">
            <a
              href="https://www.google.com/maps/d/view?mid=1KorHCp0Tgj_WcZ4cOCCHRqu7frhKUrk&usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-semibold"
            >
              <span>📍</span>
              <span>Ver Mapa Completo no Google My Maps</span>
            </a>
          </div>

          {/* Botões de navegação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${eventData.location.lat},${eventData.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <span>🗺️</span>
              <span>Como chegar (Google Maps)</span>
            </a>
            <a
              href={`https://waze.com/ul?ll=${eventData.location.lat},${eventData.location.lng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <span>🚗</span>
              <span>Navegar com Waze</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
