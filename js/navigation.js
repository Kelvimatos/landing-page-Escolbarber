(() => {
  'use strict';

  const app = (window.EscolBarber = window.EscolBarber || {});
  let isInitialized = false;

  const setMenuState = (menuButton, navigation, open) => {
    const isOpen = Boolean(open);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  };

  function initNavigation() {
    if (isInitialized) return;

    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.main-nav');
    if (!menuButton || !navigation) return;

    isInitialized = true;

    menuButton.addEventListener('click', () => {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      setMenuState(menuButton, navigation, !isExpanded);
    });

    const navLinks = navigation.querySelectorAll('a');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => setMenuState(menuButton, navigation, false));
    });

    const homeLinks = document.querySelectorAll('a[href="#inicio"]');
    homeLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setMenuState(menuButton, navigation, false);
      }
    });
  }

  app.initNavigation = initNavigation;
})();

