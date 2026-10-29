'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Download, X } from 'lucide-react';

export const PwaRegister: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('HERPATH PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('HERPATH Service Worker registration failed:', err);
          });
      });
    }

    // 2. Online / Offline Connectivity Detection
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    // 3. PWA Installation Prompt Capture
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('herpath_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismissInstall = () => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem('herpath_pwa_dismissed', 'true');
    } catch {
      // storage unavailable
    }
  };

  return (
    <>
      {/* Honest Offline Notice Banner */}
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-[1100] bg-amber-600 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            You are currently offline. Mapped infrastructure remains viewable, but live pedestrian routing and current weather require an internet connection.
          </span>
        </div>
      )}

      {/* Mobile PWA Install Pill / Banner */}
      {showInstallBanner && installPrompt && (
        <aside
          aria-label="Install HERPATH application"
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[990] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl p-3.5 max-w-sm flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">Install HERPATH App</h4>
              <p className="text-[11px] text-slate-500 line-clamp-1">Fast access & full-screen mobile experience</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Install
            </button>
            <button
              type="button"
              onClick={handleDismissInstall}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              aria-label="Dismiss installation prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
