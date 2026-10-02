const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let disposeVideoMotion = () => {};
function setupVideoMotion() {
  disposeVideoMotion();
  const controller = new AbortController();
  const videos = [...document.querySelectorAll<HTMLVideoElement>('[data-motion-video]')];
  const button = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const host = document.querySelector<HTMLElement>('.hero-bottom, .detail-hero, .page-heading');
  if (button && host) {
    if (host.classList.contains('hero-bottom')) host.insertBefore(button, host.querySelector('.eyebrow'));
    else {
      if (host.classList.contains('detail-hero')) host.classList.add('playback-host');
      host.append(button);
    }
  }
  const visible = new Set<HTMLVideoElement>();
  let paused = false;
  let observer: IntersectionObserver | undefined;
  const updateButton = () => {
    if (!button) return;
    const running = videos.some(video => !video.paused && !video.ended);
    button.hidden = !videos.length || reducedMotion.matches;
    button.textContent = (running ? button.dataset.pauseLabel : button.dataset.playLabel) || '';
    button.setAttribute('aria-pressed', String(paused));
  };
  const play = async (video: HTMLVideoElement) => {
    if (paused || reducedMotion.matches || document.hidden || !visible.has(video) || video.ended) return;
    if (!video.getAttribute('src')) { video.src = video.dataset.src!; video.load(); }
    try {
      video.muted = true;
      await video.play();
      if (paused || reducedMotion.matches || document.hidden || !visible.has(video)) { video.pause(); return; }
      video.closest<HTMLElement>('.animated-visual')?.setAttribute('data-video-ready', '');
    } catch { /* The original image remains visible if loading or autoplay fails. */ }
    updateButton();
  };
  videos.forEach(video => {
    video.addEventListener('ended', updateButton, { signal: controller.signal });
    video.addEventListener('error', () => {
      video.closest('.animated-visual')?.removeAttribute('data-video-ready');
      updateButton();
    }, { signal: controller.signal });
  });
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) { visible.add(video); void play(video); }
        else { visible.delete(video); video.pause(); }
      });
      updateButton();
    }, { threshold: .15 });
    videos.forEach(video => observer!.observe(video));
  }
  button?.addEventListener('click', () => {
    const running = videos.some(video => !video.paused && !video.ended);
    paused = running;
    if (paused) videos.forEach(video => video.pause());
    else visible.forEach(video => { if (video.ended) video.currentTime = 0; void play(video); });
    updateButton();
  }, { signal: controller.signal });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) videos.forEach(video => { video.pause(); video.closest('.animated-visual')?.removeAttribute('data-video-ready'); });
    else visible.forEach(video => void play(video));
    updateButton();
  }, { signal: controller.signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
    else visible.forEach(video => void play(video));
    updateButton();
  }, { signal: controller.signal });
  updateButton();
  disposeVideoMotion = () => { controller.abort(); observer?.disconnect(); videos.forEach(video => video.pause()); };
}
document.addEventListener('astro:before-swap', () => disposeVideoMotion());
document.addEventListener('astro:page-load', setupVideoMotion);
