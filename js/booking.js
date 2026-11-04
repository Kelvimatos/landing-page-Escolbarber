(() => {
  'use strict';

  const app = (window.EscolBarber = window.EscolBarber || {});
  let isInitialized = false;

  const applyServiceFilter = (selectedButton, filterButtons, serviceCards) => {
    const filter = selectedButton.dataset.filter;

    filterButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button === selectedButton));
    });

    serviceCards.forEach((card) => {
      const categories = (card.dataset.category || '').split(' ');
      card.hidden = filter !== 'todos' && !categories.includes(filter);
    });

    app.refreshStackCards?.();
  };

  function initBooking() {
    if (isInitialized) return;

    const filterButtons = document.querySelectorAll('.filter-button');
    const serviceCards = document.querySelectorAll('.service-card');
    if (!filterButtons.length || !serviceCards.length) return;

    isInitialized = true;

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        applyServiceFilter(button, filterButtons, serviceCards);
      });
    });
  }

  app.initBooking = initBooking;
})();

