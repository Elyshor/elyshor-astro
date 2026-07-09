(() => {
  const hero = document.querySelector('.logo-hero--home');
  const mark = hero?.querySelector('.logo-hero__mark');
  const header = document.querySelector('.site-header');
  if (!hero || !mark) return;

  let ticking = false;
  let targetProgress = 0;
  let currentProgress = 0;
  let metrics = {
    startY: 210,
    targetY: window.innerHeight * 0.48,
    startWidth: Math.min(window.innerWidth * 0.3, 390),
    targetWidth: Math.min(window.innerWidth * 0.36, 440),
  };

  const clamp = (value) => Math.min(1, Math.max(0, value));
  const mix = (from, to, progress) => from + (to - from) * progress;
  const ease = (value) => value * value * (3 - 2 * value);

  const measure = () => {
    const mobile = window.innerWidth < 760;
    const headerRect = header?.getBoundingClientRect();
    const headerBottom = headerRect ? headerRect.bottom : mobile ? 78 : 92;
    const startWidth = Math.min(window.innerWidth * (mobile ? 0.66 : 0.3), mobile ? 286 : 390);
    const targetWidth = Math.min(window.innerWidth * (mobile ? 0.62 : 0.36), mobile ? 282 : 440);
    const startVisualHeight = Math.max(74, startWidth * (mobile ? 0.34 : 0.32));
    const startY = headerBottom + (mobile ? 48 : 84) + startVisualHeight / 2;

    metrics = {
      startY,
      targetY: window.innerHeight * (mobile ? 0.45 : 0.48),
      startWidth,
      targetWidth,
    };
  };

  const update = () => {
    currentProgress += (targetProgress - currentProgress) * 0.13;
    if (Math.abs(targetProgress - currentProgress) < 0.001) {
      currentProgress = targetProgress;
      ticking = false;
    }

    const progress = ease(currentProgress);
    const y = mix(metrics.startY, metrics.targetY, progress);
    const width = mix(metrics.startWidth, metrics.targetWidth, progress);

    document.documentElement.style.setProperty('--hero-scroll-progress', progress.toFixed(3));
    document.documentElement.style.setProperty('--hero-mark-y', `${Math.round(y)}px`);
    document.documentElement.style.setProperty('--hero-mark-width', `${Math.round(width)}px`);

    if (ticking) requestAnimationFrame(update);
  };

  const requestUpdate = () => {
    targetProgress = clamp(window.scrollY / 820);
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  measure();
  requestUpdate();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    requestUpdate();
  });
})();
