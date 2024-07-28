import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const usePWAInstallPrompt = (installButtonId: string) => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      const installButton = document.getElementById(installButtonId);
      if (installButton) {
        installButton.removeAttribute('hidden');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, [installButtonId]);

  const handleAppInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      setInstallPrompt(null);
      const installButton = document.getElementById(installButtonId);
      if (installButton) {
        installButton.setAttribute('hidden', '');
      }
    }
  };

  return { handleAppInstall };
};

export default usePWAInstallPrompt;
