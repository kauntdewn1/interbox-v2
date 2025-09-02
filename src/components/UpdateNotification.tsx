import React, { useEffect, useState } from 'react';
import { RiRefreshFill } from "react-icons/ri";

interface UpdateNotificationProps {
  onUpdate?: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Verificar se há uma nova versão disponível
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service worker foi atualizado
        setShowUpdate(true);
      });

      // Verificar se há uma nova versão esperando
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          setShowUpdate(true);
        }
      });

      // Escutar mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          setShowUpdate(true);
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Enviar mensagem para o service worker atualizar
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      
      // Recarregar a página após um breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <RiRefreshFill className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                Nova versão disponível!
              </p>
              <p className="text-xs opacity-90">
                Clique para atualizar e obter as últimas funcionalidades
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-xs bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Depois
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-4 py-2 text-sm bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Atualizando...' : 'Atualizar Agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
