import React from 'react';
import { useLevelSystem, LevelInfo } from '../hooks/useLevelSystem';

interface LevelDisplayProps {
  boxTokens: number;
  showDescription?: boolean;
  showProgress?: boolean;
  className?: string;
}

export default function LevelDisplay({ 
  boxTokens, 
  showDescription = false, 
  showProgress = true,
  className = '' 
}: LevelDisplayProps) {
  const { currentLevel, nextLevel, progressToNext, tokensToNext } = useLevelSystem(boxTokens);

  return (
    <div className={`level-display ${className}`}>
      {/* Nível Atual */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={currentLevel.image}
            alt={currentLevel.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-pink-500"
          />
          <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs px-1 rounded-full font-bold">
            {currentLevel.level}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{currentLevel.name}</h3>
          <p className="text-sm text-gray-600">{boxTokens} $BØX</p>
          
          {showDescription && (
            <p className="text-xs text-gray-500 mt-1 italic">
              {currentLevel.description}
            </p>
          )}
        </div>
      </div>

      {/* Progresso para próximo nível */}
      {showProgress && nextLevel && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Próximo: {nextLevel.name}</span>
            <span>{tokensToNext} $BØX restantes</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}

      {/* Nível máximo alcançado */}
      {!nextLevel && (
        <div className="mt-3 text-center">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
            🏆 NÍVEL MÁXIMO ALCANÇADO!
          </div>
        </div>
      )}
    </div>
  );
}

// Componente compacto para uso em cards
export function LevelBadge({ boxTokens, className = '' }: { boxTokens: number; className?: string }) {
  const { currentLevel } = useLevelSystem(boxTokens);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img
        src={currentLevel.image}
        alt={currentLevel.name}
        className="w-8 h-8 rounded-full object-cover border border-pink-500"
      />
      <div>
        <div className="text-sm font-bold text-gray-900">{currentLevel.name}</div>
        <div className="text-xs text-gray-600">{boxTokens} $BØX</div>
      </div>
    </div>
  );
}

// Componente para exibir todos os níveis
export function LevelSystemOverview() {
  const { allLevels } = useLevelSystem(0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Sistema de Níveis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allLevels.map((level) => (
          <div
            key={level.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
          >
            <div className="flex items-center space-x-3 mb-2">
              <img
                src={level.image}
                alt={level.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-gray-900">{level.name}</h4>
                <p className="text-sm text-gray-600">
                  {level.minTokens} - {level.maxTokens === Infinity ? '∞' : level.maxTokens} $BØX
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
