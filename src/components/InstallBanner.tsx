import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If already installed, don't show
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 lg:left-auto lg:w-96 z-[100]"
        >
          <div className="bg-primary-950 rounded-3xl p-6 shadow-2xl border border-primary-800 text-white relative overflow-hidden">
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary-700 p-3 rounded-2xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="pr-6">
                <h3 className="font-black text-lg leading-tight mb-1">Instalar ROSSIAGRO</h3>
                <p className="text-primary-200 text-sm font-medium">Acesse o sistema offline e direto da sua tela inicial como um aplicativo.</p>
              </div>
            </div>

            <button 
              onClick={handleInstall}
              className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors"
            >
              <Download className="w-5 h-5" /> Instalar Agora
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
