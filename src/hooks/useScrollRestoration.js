import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const useScrollRestoration = (isDataLoaded) => {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Сохраняем позицию при скролле и перед уходом
  useEffect(() => {
    const path = location.pathname;
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${path}`, window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      sessionStorage.setItem(`scroll_${path}`, window.scrollY);
    };
  }, [location.pathname]);

  // Восстанавливаем позицию только при возврате назад/вперёд
  useEffect(() => {
    if (navigationType === 'POP' && isDataLoaded) {
      const saved = sessionStorage.getItem(`scroll_${location.pathname}`);
      if (saved !== null) {
        // Ждём загрузки всех изображений
        const images = document.querySelectorAll('img');
        const promises = Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        });
        Promise.all(promises).then(() => {
          setTimeout(() => {
            window.scrollTo(0, parseInt(saved, 10));
            sessionStorage.removeItem(`scroll_${location.pathname}`);
          }, 100);
        });
      }
    }
  }, [navigationType, isDataLoaded, location.pathname]);
};