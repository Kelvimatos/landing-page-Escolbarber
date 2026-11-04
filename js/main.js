(() => {
  'use strict';

  const app = (window.EscolBarber = window.EscolBarber || {});
  let hasStarted = false;

  const bootstrap = () => {
    if (hasStarted) return;
    hasStarted = true;

    app.initNavigation?.();
    app.initScrollEffects?.();
    app.initChairScrub?.();
    app.initAnimations?.();
    app.initBooking?.();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();

