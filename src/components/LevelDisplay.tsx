import React from 'react';
import { useLevelSystem, LevelInfo } from '../hooks/useLevelSystem';
import { useGamificationPreload } from '../hooks/useGamificationPreload';
import { calculateLevelProgress, getLevelConfig } from '../config/gamification';

interface LevelDisplayProps {
  boxTokens: number;
  showProgress?: boolean;
  showDescription?: boolean;
  className?: string;
}

export default function LevelDisplay({ 
  boxTokens, 
  showProgress = true, 
  showDescription = false,
  className = '' 
}: LevelDisplayProps) {
  const { currentLevel, nextLevel, progressToNext, tokensToNext } = useLevelSystem(boxTokens);
  
  // Preload imagens de gamificação quando o componente é renderizado
  useGamificationPreload(true);

  return (
    <div className={`level-display ${className}`}>
      {/* Nível Atual */}
      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700">
        <div className="relative">
          <img
            src={currentLevel.image}
            alt={currentLevel.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-pink-500"
          />
          <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {currentLevel.level}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{currentLevel.name}</h3>
          <p className="text-gray-300 text-sm">{currentLevel.level}</p>
          {showDescription && (
            <p className="text-gray-400 text-xs mt-1">{currentLevel.description}</p>
          )}
          
          {showProgress && nextLevel && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progresso para {nextLevel.name}</span>
                <span>{tokensToNext} $BØX restantes</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-pink-500">{boxTokens}</div>
          <div className="text-xs text-gray-400">$BØX</div>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar todos os níveis disponíveis
export function LevelSystemOverview() {
  const { allLevels } = useLevelSystem(0);
  
  // Preload imagens de gamificação quando o componente é renderizado
  useGamificationPreload(true);

  return (
    <div className="level-system-overview">
      <h3 className="text-lg font-bold text-white mb-4">Sistema de Níveis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allLevels.map((level, index) => (
          <div
            key={level.id}
            className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-pink-500 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-2">
              <img
                src={level.image}
                alt={level.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-white">{level.name}</h4>
                <p className="text-sm text-gray-400">{level.level}</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 mb-2">{level.description}</p>
            <div className="text-xs text-pink-400 font-mono">
              {level.minTokens} - {level.maxTokens === Infinity ? '∞' : level.maxTokens} $BØX
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
