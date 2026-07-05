(() => {
  if (window.__elyMediaActionsReady) return;
  window.__elyMediaActionsReady = true;

  const CONSENT_KEYS = ['elyshor-external-media-consent', 'elyshor-consent-external-media', 'ely_media_consent'];

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const getExternalMediaConsent = () => {
    try {
      if (CONSENT_KEYS.some((key) => localStorage.getItem(key) === 'true')) return true;
      const storedConsent = localStorage.getItem('ely_consent');
      return storedConsent ? JSON.parse(storedConsent).externalMedia === true : false;
    } catch {
      return false;
    }
  };

  const allowExternalMedia = () => {
    try {
      CONSENT_KEYS.forEach((key) => localStorage.setItem(key, 'true'));
      localStorage.setItem(
        'ely_consent',
        JSON.stringify({ necessary: true, externalMedia: true, decidedAt: new Date().toISOString() }),
      );
    } catch {
      // Storage can fail in private modes. The current user gesture still loads the player.
    }

    window.dispatchEvent(new CustomEvent('ely-consent-updated'));
    document.dispatchEvent(new CustomEvent('ely-consent-updated'));
  };

  const extractSpotifyTrackId = (value = '') => {
    if (!value) return '';
    if (value.startsWith('spotify:track:')) return value.split(':')[2]?.split('?')[0] || '';

    try {
      const parsed = new URL(value);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const trackIndex = parts.indexOf('track');
      return trackIndex >= 0 ? parts[trackIndex + 1] || '' : '';
    } catch {
      return '';
    }
  };

  const extractYouTubeId = (value = '') => {
    if (!value) return '';

    try {
      const parsed = new URL(value);
      const host = parsed.hostname.replace(/^www\./, '');
      const parts = parsed.pathname.split('/').filter(Boolean);

      if (host === 'youtu.be') return parts[0] || '';
      if (parts[0] === 'embed' || parts[0] === 'shorts') return parts[1] || '';

      return parsed.searchParams.get('v') || '';
    } catch {
      return '';
    }
  };

  const getCard = (element) =>
    element.closest('[data-media-card]') || element.closest('.music-card') || element.closest('article');

  const getStatus = (card) => {
    if (!card) return undefined;
    let status = card.querySelector('[data-media-status]');
    if (!status) {
      status = document.createElement('div');
      status.className = 'media-inline-status';
      status.dataset.mediaStatus = '';
      const actions = card.querySelector('.button-row');
      actions?.insertAdjacentElement('afterend', status);
    }
    return status;
  };

  const hideStatus = (card) => {
    const status = card?.querySelector('[data-media-status]');
    if (!status) return;
    status.hidden = true;
    status.innerHTML = '';
  };

  const showStatus = (card, html) => {
    const status = getStatus(card);
    if (!status) return;
    status.innerHTML = html;
    status.hidden = false;
  };

  const closeYouTubePlayer = (player) => {
    if (!player) return;
    player.hidden = true;
    player.innerHTML = '';
    const card = getCard(player);
    card?.querySelector('.media-action--youtube')?.setAttribute('aria-expanded', 'false');
  };

  const renderYouTubeError = (player) => {
    if (!player) return;
    player.hidden = false;
    player.innerHTML = '<div class="media-inline-consent"><p>YouTube-Video konnte nicht geladen werden.</p></div>';
  };

  const renderYouTubeConsent = (player) => {
    if (!player) return;
    player.hidden = false;
    player.innerHTML = `
      <div class="media-inline-consent">
        <p>YouTube wird erst nach Zustimmung zu externen Medien geladen.</p>
        <button type="button" data-youtube-consent>Externe Medien erlauben</button>
      </div>
    `;
  };

  const renderYouTubePlayer = (player, videoId) => {
    if (!player) return;
    const title = player.dataset.youtubeTitle || 'YouTube';
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;

    player.hidden = false;
    player.innerHTML = `
      <div class="media-inline-frame">
        <iframe
          src="${src}"
          title="${escapeHtml(title)}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
      <button class="media-inline-close" type="button" data-youtube-close>Schlie&szlig;en</button>
    `;
  };

  const handleSpotifyClick = (event, button) => {
    event.preventDefault();
    event.stopPropagation();

    const card = getCard(button);
    hideStatus(card);

    const trackId = button.dataset.spotifyTrackId || extractSpotifyTrackId(button.dataset.spotifyUrl || '');
    if (!trackId) {
      const fallbackUrl = button.dataset.spotifyUrl || '';
      if (fallbackUrl) {
        showStatus(
          card,
          `Spotify-App nicht ge&ouml;ffnet? <a class="media-action-fallback-link" href="${escapeHtml(
            fallbackUrl,
          )}" target="_blank" rel="noopener noreferrer">Spotify Web &ouml;ffnen</a>`,
        );
      }
      return;
    }

    const appUrl = `spotify:track:${trackId}`;
    const webUrl = `https://open.spotify.com/track/${encodeURIComponent(trackId)}`;

    window.location.href = appUrl;

    window.setTimeout(() => {
      if (document.visibilityState !== 'visible') return;
      showStatus(
        card,
        `Spotify-App nicht ge&ouml;ffnet? <a class="media-action-fallback-link" href="${webUrl}" target="_blank" rel="noopener noreferrer">Spotify Web &ouml;ffnen</a>`,
      );
    }, 1500);
  };

  const handleYouTubeClick = (event, button) => {
    event.preventDefault();
    event.stopPropagation();

    const card = getCard(button);
    const player = card?.querySelector('[data-youtube-player]') || card?.querySelector('[data-youtube-panel]');
    if (!player) return;

    hideStatus(card);

    if (!player.hidden) {
      closeYouTubePlayer(player);
      return;
    }

    const videoId =
      button.dataset.youtubeId ||
      player.dataset.youtubeId ||
      extractYouTubeId(button.dataset.youtubeUrl || player.dataset.youtubeUrl || '');

    button.setAttribute('aria-expanded', 'true');

    if (!videoId) {
      renderYouTubeError(player);
      return;
    }

    getExternalMediaConsent() ? renderYouTubePlayer(player, videoId) : renderYouTubeConsent(player);
  };

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const spotifyButton = target.closest('.media-action--spotify');
    if (spotifyButton) {
      handleSpotifyClick(event, spotifyButton);
      return;
    }

    const youtubeClose = target.closest('[data-youtube-close]');
    if (youtubeClose) {
      event.preventDefault();
      event.stopPropagation();
      closeYouTubePlayer(youtubeClose.closest('[data-youtube-player]') || youtubeClose.closest('[data-youtube-panel]'));
      return;
    }

    const youtubeConsent = target.closest('[data-youtube-consent]');
    if (youtubeConsent) {
      event.preventDefault();
      event.stopPropagation();
      const player = youtubeConsent.closest('[data-youtube-player]') || youtubeConsent.closest('[data-youtube-panel]');
      const card = getCard(player);
      const button = card?.querySelector('.media-action--youtube');
      const videoId =
        player?.dataset.youtubeId ||
        button?.dataset.youtubeId ||
        extractYouTubeId(button?.dataset.youtubeUrl || player?.dataset.youtubeUrl || '');

      allowExternalMedia();
      videoId ? renderYouTubePlayer(player, videoId) : renderYouTubeError(player);
      return;
    }

    const youtubeButton = target.closest('.media-action--youtube');
    if (youtubeButton) {
      handleYouTubeClick(event, youtubeButton);
    }
  });
})();
