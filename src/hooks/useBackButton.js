import { useEffect, useRef } from 'react';

export function useBackButton(isOpen, onClose) {
  const onCloseRef = useRef(onClose);

  // Simpan fungsi onClose terbaru tanpa memicu ulang useEffect
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Cegah pushState ganda saat React melakukan re-render
    if (!window.history.state?.modalOrViewOpen) {
      window.history.pushState({ modalOrViewOpen: true }, '');
    }

    const handlePopState = () => {
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen]);
}