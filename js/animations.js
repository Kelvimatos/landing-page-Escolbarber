(() => {
  'use strict';

  const app = (window.EscolBarber = window.EscolBarber || {});
  let isInitialized = false;

  const initRevealAnimations = () => {
    const revealItems = document.querySelectorAll('.reveal');
    if (!revealItems.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver(
        (entries, io) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }
  };

  const initImageFallbacks = () => {
    const images = document.querySelectorAll('img');
    images.forEach((image) => {
      image.addEventListener(
        'error',
        () => {
          image.classList.add('image-unavailable');
          image.alt = 'Imagem do portfólio indisponível';
        },
        { once: true }
      );
    });
  };

  function initAnimations() {
    if (isInitialized) return;
    isInitialized = true;

    initRevealAnimations();
    initImageFallbacks();
  }

  app.initAnimations = initAnimations;
})();

