(() => {
  'use strict';

  const app = (window.EscolBarber = window.EscolBarber || {});
  let isInitialized = false;

  const clamp01 = (value) => Math.max(0, Math.min(1, value));
  const limitar = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (value) => value * value * (3 - 2 * value);

  const progressoNaTela = (el) => {
    const r = el.getBoundingClientRect();
    const alt = window.innerHeight || 800;
    return limitar((alt - r.top) / (alt + r.height), 0, 1);
  };

  const laco = (card, passo) => {
    let id = null;
    let vivo = false;
    let respondeu = false;

    const rodar = () => {
      passo();
      id = window.requestAnimationFrame(rodar);
    };
    const ligar = () => {
      if (!vivo) {
        vivo = true;
        rodar();
      }
    };
    const desligar = () => {
      if (vivo) {
        vivo = false;
        window.cancelAnimationFrame(id);
      }
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          respondeu = true;
          if (entries[0].isIntersecting) {
            ligar();
          } else {
            desligar();
          }
        },
        { threshold: 0 }
      );
      obs.observe(card);
      const espera = window.setTimeout(() => {
        if (!respondeu) ligar();
      }, 1500);
      return () => {
        window.clearTimeout(espera);
        window.cancelAnimationFrame(id);
        obs.disconnect();
      };
    }

    ligar();
    return () => window.cancelAnimationFrame(id);
  };

  const initStackingCards = (root = document) => {
    const pilha = root.querySelector('.js-pilha') || document.querySelector('.js-pilha');
    if (!pilha) return null;

    const todasFolhas = Array.from(pilha.querySelectorAll('.folha'));
    if (!todasFolhas.length) return null;

    let folhasVisiveis = [];
    let naturais = [];
    let frameAgendado = false;

    const obterTopoBase = () => (window.innerWidth <= 640 ? 84 : 96);

    const medirNaturais = () => {
      folhasVisiveis = todasFolhas.filter((f) => !f.hidden);
      const topoBase = obterTopoBase();

      naturais = folhasVisiveis.map((f, i) => {
        const antesPos = f.style.position;
        const antesTrans = f.style.transform;
        f.style.position = 'static';
        f.style.transform = 'none';
        const y = f.offsetTop;
        f.style.position = antesPos;
        f.style.transform = antesTrans;
        f.style.top = `${topoBase + i * 8}px`;
        return y;
      });
    };

    const atualizarPilha = () => {
      frameAgendado = false;
      if (!folhasVisiveis.length) return;

      const topoBase = obterTopoBase();
      const scrollTopNaPilha = -pilha.getBoundingClientRect().top;
      const total = folhasVisiveis.length;

      folhasVisiveis.forEach((f, i) => {
        const topoCard = topoBase + i * 8;
        const vao = f.offsetHeight + 16;
        const ehUltimo = i === total - 1;
        const preso = ehUltimo
          ? 0
          : limitar((scrollTopNaPilha + topoCard - naturais[i]) / vao, 0, 1);

        const reducaoEscala = Math.max(0.05, 0.1 - i * 0.01);
        f.style.transform = `scale(${(1 - preso * reducaoEscala).toFixed(4)})`;
        f.style.filter = `brightness(${(1 - preso * 0.5).toFixed(4)})`;
        f.style.zIndex = String(i + 1);
      });
    };

    const agendarAtualizacao = () => {
      if (frameAgendado) return;
      frameAgendado = true;
      window.requestAnimationFrame(atualizarPilha);
    };

    const recalcular = () => {
      medirNaturais();
      atualizarPilha();
    };

    medirNaturais();
    atualizarPilha();

    window.addEventListener('scroll', agendarAtualizacao, { passive: true });
    window.addEventListener('resize', recalcular, { passive: true });

    app.refreshStackCards = recalcular;
    return recalcular;
  };

  window.FX = window.FX || {};
  window.FX.j01 = initStackingCards;
  window.FX.lerp = lerp;
  window.FX.limitar = limitar;
  window.FX.progressoNaTela = progressoNaTela;
  window.FX.laco = laco;

  const splitIntoWords = (element) => {
    const originalText = element.textContent.trim().replace(/\s+/g, ' ');
    const words = originalText.split(' ');
    element.textContent = '';

    const wordElements = words.map((word, index) => {
      const span = document.createElement('span');
      span.className = 'essence-word';
      span.textContent = word + (index < words.length - 1 ? ' ' : '');
      element.appendChild(span);
      return span;
    });

    element.setAttribute('aria-label', originalText);
    return wordElements;
  };

  function initScrollEffects() {
    if (isInitialized) return;

    const heroSection = document.querySelector('.hero');
    const essenceSection = document.querySelector('[data-text-fill-section]');
    const essenceCopy = essenceSection?.querySelector('[data-text-fill]');
    if (!essenceSection || !essenceCopy) return;

    isInitialized = true;

    const wordElements = splitIntoWords(essenceCopy);
    essenceSection.classList.add('essence-ready');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsIntersectionObserver = 'IntersectionObserver' in window;
    const featherWords = 3;
    let isNearViewport = true;
    let framePending = false;

    const updateEssenceFill = () => {
      framePending = false;

      const rect = essenceSection.getBoundingClientRect();
      const scrollableDistance = Math.max(1, rect.height - window.innerHeight);
      const rawProgress = clamp01(-rect.top / scrollableDistance);

      // Aparece suavemente em cima do Hero assim que começa a rolagem
      const alpha = reducedMotion
        ? rawProgress > 0.02
          ? 1
          : 0
        : smoothstep(clamp01((rawProgress - 0.008) / 0.16));

      const heroContentAlpha = clamp01(1 - alpha * 1.4);

      essenceSection.style.setProperty('--essence-alpha', alpha.toFixed(3));
      essenceSection.classList.toggle('is-active', alpha > 0.15);
      heroSection?.style.setProperty('--hero-content-alpha', heroContentAlpha.toFixed(3));

      if (reducedMotion) {
        wordElements.forEach((word) => word.style.setProperty('--fill', '100%'));
        return;
      }

      const textProgress = clamp01((rawProgress - 0.08) / 0.8);
      const leadingEdge = textProgress * (wordElements.length + featherWords) - featherWords;

      wordElements.forEach((word, index) => {
        const fill = smoothstep(clamp01((leadingEdge - index + featherWords) / featherWords));
        word.style.setProperty('--fill', `${(fill * 100).toFixed(2)}%`);
      });
    };

    const scheduleEssenceFill = () => {
      if (framePending) return;

      if (!supportsIntersectionObserver) {
        const rect = essenceSection.getBoundingClientRect();
        isNearViewport = rect.top < window.innerHeight * 2 && rect.bottom > -window.innerHeight * 2;
      }

      if (!isNearViewport) return;
      framePending = true;
      window.requestAnimationFrame(updateEssenceFill);
    };

    window.addEventListener('scroll', scheduleEssenceFill, { passive: true });
    window.addEventListener('resize', scheduleEssenceFill, { passive: true });

    if (supportsIntersectionObserver) {
      const essenceObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isNearViewport = entry.isIntersecting;
            updateEssenceFill();
          });
        },
        { rootMargin: '100% 0px 100% 0px' }
      );
      essenceObserver.observe(essenceSection);
    }

    updateEssenceFill();
    initStackingCards(document);

    // Efeito 3D Parallax & Profundidade estereoscópica na foto do Lucas no Hero
    const heroPhoto = heroSection?.querySelector('.hero-photo');
    const heroLogo = heroSection?.querySelector('.hero-logo');
    if (heroSection && heroPhoto && !reducedMotion) {
      let targetX = 0;
      let targetY = 0;
      let curX = 0;
      let curY = 0;

      heroSection.addEventListener(
        'pointermove',
        (ev) => {
          const r = heroSection.getBoundingClientRect();
          const nx = ((ev.clientX - r.left) / Math.max(1, r.width) - 0.5) * 2;
          const ny = ((ev.clientY - r.top) / Math.max(1, r.height) - 0.5) * 2;
          targetX = limitar(nx, -1, 1);
          targetY = limitar(ny, -1, 1);
        },
        { passive: true }
      );

      heroSection.addEventListener(
        'pointerleave',
        () => {
          targetX = 0;
          targetY = 0;
        },
        { passive: true }
      );

      const tickHero3D = (now) => {
        // Respiração 3D autônoma sutil + resposta ao cursor
        const idleX = Math.sin(now * 0.0014) * 0.22;
        const idleY = Math.cos(now * 0.0011) * 0.16;
        const goalX = targetX + idleX;
        const goalY = targetY + idleY;

        curX += (goalX - curX) * 0.08;
        curY += (goalY - curY) * 0.08;

        heroPhoto.style.setProperty('--lucas-tilt-y', `${(curX * 4.5).toFixed(2)}deg`);
        heroPhoto.style.setProperty('--lucas-tilt-x', `${(-curY * 3.2).toFixed(2)}deg`);
        heroPhoto.style.setProperty('--lucas-shift-x', `${(curX * 10).toFixed(1)}px`);
        heroPhoto.style.setProperty('--lucas-shift-y', `${(curY * 6).toFixed(1)}px`);

        if (heroLogo) {
          heroLogo.style.setProperty('--logo-shift-x', `${(-curX * 14).toFixed(1)}px`);
          heroLogo.style.setProperty('--logo-shift-y', `${(-curY * 9).toFixed(1)}px`);
        }

        window.requestAnimationFrame(tickHero3D);
      };

      window.requestAnimationFrame(tickHero3D);
    }
  }

  app.initScrollEffects = initScrollEffects;
})();
