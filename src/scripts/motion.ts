import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine)');
let dispose = () => {};
let sharedImage = false;

function setupMotion() {
  dispose();
  const controller = new AbortController();
  let observer: IntersectionObserver | undefined;
  let frame = 0;
  let active: HTMLImageElement[] = [];
  let visible = new Set<HTMLImageElement>();
  let parallaxObserver: IntersectionObserver | undefined;
  const items = new Set<HTMLElement>();
  const mark = (selector: string, kind = 'text', delay = 0) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
      if (element.closest('dialog')) return;
      element.dataset.reveal ??= kind;
      element.style.setProperty('--reveal-delay', `${delay ? (index % 4) * delay : 0}ms`);
      items.add(element);
    });
  };
  mark('[data-reveal]');
  mark('.hero h1, .hero-index, .hero-topline > span, .hero-signature > span, .hero-image-caption > span', 'text', 70);
  document.querySelector<HTMLElement>('.hero h1')?.style.setProperty('--reveal-delay', '0ms');
  document.querySelector<HTMLElement>('.hero-index')?.style.setProperty('--reveal-delay', '70ms');
  mark('.cover-line > *', 'cover', 100);
  mark('.hero-visual > picture, .hero-visual .animated-visual', 'mask');
  document.querySelector<HTMLElement>('.hero-visual > picture, .hero-visual .animated-visual')?.style.setProperty('--reveal-delay', '180ms');
  document.querySelectorAll<HTMLElement>('.hero-image-caption > span').forEach((el, index) => el.style.setProperty('--reveal-delay', `${520 + index * 90}ms`));
  mark('.section-heading .chapter-number, .project-title > .chapter-number', 'number');
  mark('.section-heading h2, .gallery-heading h2', 'text');
  document.querySelectorAll<HTMLElement>('.section-heading h2, .gallery-heading h2').forEach(el => el.style.setProperty('--reveal-delay', '90ms'));
  mark('.section-heading > .eyebrow, .project-meta > div', 'text', 80);
  mark('.introduction > div, .section-intro > *, .drawing-text, .about-preview-text, .page-heading > *, .project-title > div > *, .project-story > *, .project-concept > *, .problematic, .contact-page > h1, .contact-page > p, .contact-line > *, .timeline article, .qualifications-grid article', 'text', 70);
  mark('.project-image, .detail-hero', 'mask');
  mark('.project-caption > *, .gallery-heading > .eyebrow', 'fade', 60);
  mark('.drawing-first, .drawing-last', 'plan');
  mark('.portrait', 'fade');
  document.querySelectorAll<HTMLElement>('.gallery-section').forEach(section => {
    const title = section.querySelector('h2')?.textContent || '';
    const figure = section.querySelector<HTMLElement>('figure');
    if (!figure) return;
    figure.dataset.reveal = /plan|coupe|dessin|croquis|étude|axo|anatom|section|draw|sketch|stud|elevation/i.test(title) ? 'plan-mask' : 'mask';
    items.add(figure);
  });
  document.querySelectorAll<HTMLElement>('.section-heading, .gallery-heading, .project-meta, .project-concept, .next-project, .hero-signature, .hero-bottom, .project-caption, .contact-details > a').forEach(element => {
    element.dataset.motionLine = ['hero-bottom', 'project-caption'].some(c => element.classList.contains(c)) ? 'bottom' : 'top';
    items.add(element);
  });

  function revealAll() {
    observer?.disconnect();
    items.forEach(element => element.classList.add('is-visible'));
  }
  function startReveals() {
    if (reduced.matches || !('IntersectionObserver' in window)) { revealAll(); return; }
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer!.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    items.forEach(element => {
      if (element.classList.contains('is-visible')) return;
      // Visible content must never disappear after its first paint or restored navigation.
      if (element.getBoundingClientRect().top < innerHeight) element.classList.add('is-visible');
      else observer!.observe(element);
    });
    document.documentElement.classList.add('motion-ready');
  }
  function updateParallax() {
    frame = 0;
    if (document.hidden) return;
    const height = innerHeight;
    const offsets = [...visible].map(image => {
      const rect = image.closest('a')!.getBoundingClientRect();
      const limit = Math.min(10, rect.height * .009);
      const offset = ((height / 2 - rect.top - rect.height / 2) / height) * 20;
      return [image, Math.max(-limit, Math.min(limit, offset))] as const;
    });
    offsets.forEach(([image, offset]) => image.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`));
  }
  function scheduleParallax() {
    if (!frame && visible.size && !document.hidden) frame = requestAnimationFrame(updateParallax);
  }
  function stopParallax() {
    parallaxObserver?.disconnect();
    cancelAnimationFrame(frame); frame = 0;
    active.forEach(image => { image.classList.remove('subtle-parallax'); image.style.removeProperty('--parallax-y'); });
    active = []; visible.clear();
  }
  function startParallax() {
    stopParallax();
    if (reduced.matches || !desktop.matches || !('IntersectionObserver' in window)) return;
    active = [...document.querySelectorAll<HTMLImageElement>('.hero-visual img, .selected-projects .project-preview:first-child .project-image img')].filter(image => !image.closest('.animated-visual'));
    parallaxObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const image = entry.target as HTMLImageElement;
        if (entry.isIntersecting) visible.add(image);
        else visible.delete(image);
      });
      scheduleParallax();
    });
    active.forEach(image => {
      image.style.setProperty('--parallax-y', '0px');
      image.classList.add('subtle-parallax');
      parallaxObserver!.observe(image);
    });
  }
  reduced.addEventListener('change', () => { if (reduced.matches) revealAll(); startParallax(); }, { signal: controller.signal });
  desktop.addEventListener('change', startParallax, { signal: controller.signal });
  window.addEventListener('scroll', scheduleParallax, { passive: true, signal: controller.signal });
  window.addEventListener('resize', scheduleParallax, { passive: true, signal: controller.signal });
  document.addEventListener('visibilitychange', scheduleParallax, { signal: controller.signal });
  startReveals(); startParallax();
  dispose = () => { controller.abort(); observer?.disconnect(); stopParallax(); };
}

// Use the selected image for continuity even when the same project also appears
// elsewhere on the homepage. Set matching names before Astro takes snapshots.
document.addEventListener('astro:before-preparation', event => {
  const navigation = event as TransitionBeforePreparationEvent;
  const link = navigation.sourceElement?.closest<HTMLAnchorElement>('a.hero-visual, a.project-image');
  const image = link?.querySelector<HTMLImageElement>('img');
  sharedImage = !!image && !reduced.matches;
  if (sharedImage && image) {
    image.classList.remove('subtle-parallax');
    image.style.removeProperty('--parallax-y');
    image.style.viewTransitionName = 'selected-project-image';
  }
});
document.addEventListener('astro:before-swap', event => {
  const navigation = event as TransitionBeforeSwapEvent;
  const target = navigation.newDocument.querySelector<HTMLImageElement>('.detail-hero img');
  if (sharedImage && target) target.style.viewTransitionName = 'selected-project-image';
  dispose();
});
document.addEventListener('astro:page-load', () => {
  document.querySelectorAll<HTMLImageElement>('img').forEach(image => image.style.removeProperty('view-transition-name'));
  setupMotion();
});
