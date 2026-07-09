(() => {
  const hero = document.querySelector('.logo-hero--home');
  const mark = hero?.querySelector('.logo-hero__mark');
  if (!hero || !mark) return;

  let ticking = false;
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const mix = (from, to, progress) => from + (to - from) * progress;

  const update = () => {
    ticking = false;
    const progress = clamp(window.scrollY / 560);
    const mobile = window.innerWidth < 760;
    const startY = mobile ? 132 : 168;
    const targetY = window.innerHeight * (mobile ? 0.46 : 0.5);
    const startWidth = Math.min(window.innerWidth * (mobile ? 0.72 : 0.34), mobile ? 310 : 460);
    const targetWidth = Math.min(window.innerWidth * (mobile ? 0.68 : 0.42), mobile ? 300 : 520);
    const y = mix(startY, targetY, progress);
    const width = mix(startWidth, targetWidth, progress);

    document.documentElement.style.setProperty('--hero-scroll-progress', progress.toFixed(3));
    document.documentElement.style.setProperty('--hero-mark-y', `${Math.round(y)}px`);
    document.documentElement.style.setProperty('--hero-mark-width', `${Math.round(width)}px`);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
})();
