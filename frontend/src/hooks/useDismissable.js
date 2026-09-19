import { useEffect } from 'react';

/**
 * Escape-to-close + background scroll lock for overlays.
 *
 * The Sheet primitive has this built in. ClusterMapModal and
 * SoundboxDeviceModal keep their own bespoke chrome (a map canvas and a device
 * mock), so they take the behaviour from here instead of being restructured.
 */
export function useDismissable(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);
}
