import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker, Circle } from "leaflet";
import { IoCarOutline } from "react-icons/io5";
import { IoMdMap } from "react-icons/io";

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

      map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false
      }).setView([eventData.location.lat, eventData.location.lng], 8);

      // Adicionar camada de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
      }).addTo(map);

      // Marcador do evento (minimalista, sem popup)
      const eventMarker = L.marker([eventData.location.lat, eventData.location.lng])
        .addTo(map);

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
        }).addTo(map);
        markers.push(userMarker);
      }

      // Adicionar atribuição discreta
      const attribution = L.control.attribution({
        position: 'bottomright'
      });
      attribution.addAttribution('© OpenStreetMap contributors');
      attribution.addTo(map);

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
    <div className={`space-y-6 ${className}`}>
      {/* Card de informações do evento - iOS style */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-3">{eventData.name}</h3>
        <p className="text-gray-300 mb-4 text-lg">{eventData.description}</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-full font-medium">📍 {eventData.city} - {eventData.state}</span>
          <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full font-medium">📅 {eventData.dates.join(', ')}</span>
          <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full font-medium">🎯 {eventData.radius_m / 1000}km de alcance</span>
        </div>
      </div>

      {/* Mapa minimalista */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-80 rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
          style={{ minHeight: '320px' }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-white font-medium">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Card de gamificação - iOS style */}
      {distance !== null && (
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-pink-500/30 shadow-2xl">
          {distance < (eventData.radius_m / 1000) ? (
            <div className="text-center">
              <p className="text-pink-300 font-bold text-xl mb-2">⚡️ Você está dentro do raio!</p>
              <p className="text-gray-300 text-lg">Prepare-se para o maior evento de times da América Latina!</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-blue-300 font-bold text-xl mb-2">🚗 Você está a {distance}km do evento</p>
              <p className="text-gray-300 text-lg">Partiu caravana? Organize sua equipe e venha participar!</p>
            </div>
          )}
        </div>
      )}

      {/* Mensagem quando geolocalização falha */}
      {!userLocation && enableGeolocation && (
        <div className="bg-yellow-500/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30 shadow-2xl">
          <p className="text-yellow-300 text-center text-lg font-medium">
            📍 Não foi possível obter sua localização. Habilite o GPS para calcular distância.
          </p>
        </div>
      )}

      {/* Botões de navegação - iOS style */}
      {showNavigation && (
        <div className="space-y-4">
          {/* Botão principal - My Maps */}
          <div className="text-center">
            <a
              href="https://www.google.com/maps/d/view?mid=1KorHCp0Tgj_WcZ4cOCCHRqu7frhKUrk&usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-pink-500/25 hover:scale-105"
            >
              <span className="text-2xl">📍</span>
              <span>Ver Mapa Completo</span>
            </a>
          </div>

          {/* Botões secundários - iOS style */}
          <div className="flex flex-row gap-3 max-w-md mx-auto">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${eventData.location.lat},${eventData.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500/15 backdrop-blur-xl hover:bg-blue-500/25 text-blue-300 hover:text-blue-100 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-base border border-blue-500/20 hover:border-blue-400/40 shadow-lg hover:shadow-blue-500/15 hover:scale-[1.02] active:scale-[0.98]"
            >
              <IoMdMap className="text-lg" />
              <span>Google Maps</span>
            </a>
            <a
              href={`https://waze.com/ul?ll=${eventData.location.lat},${eventData.location.lng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-purple-500/15 backdrop-blur-xl hover:bg-purple-500/25 text-purple-300 hover:text-purple-100 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-base border border-purple-500/20 hover:border-purple-400/40 shadow-lg hover:shadow-purple-500/15 hover:scale-[1.02] active:scale-[0.98]"
            >
              <IoCarOutline className="text-lg" />
              <span>Waze</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
