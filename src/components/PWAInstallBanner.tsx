import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallBanner() {
  const { isInstallable, showInstallPrompt, installApp, hideInstallPrompt } = usePWA();

  if (!isInstallable || !showInstallPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 shadow-lg"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📱</div>
            <div>
              <h3 className="font-bold text-sm">Instalar INTERBØX</h3>
              <p className="text-xs opacity-90">Acesse mais rápido e offline</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={installApp}
              className="bg-white text-pink-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={hideInstallPrompt}
              className="text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
