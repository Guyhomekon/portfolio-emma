// Prepare nearby images without hiding or animating any content.
let observer: IntersectionObserver | undefined;
let initializedBody: HTMLElement | undefined;

function prepareImages() {
  if (initializedBody === document.body) return;
  observer?.disconnect();
  initializedBody = document.body;
  if (!('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      (entry.target as HTMLImageElement).loading = 'eager';
      observer?.unobserve(entry.target);
    }
  }, { rootMargin: '800px 0px' });
  document.querySelectorAll<HTMLImageElement>('main picture img').forEach(image => observer!.observe(image));
}

document.addEventListener('astro:before-swap', () => observer?.disconnect());
document.addEventListener('astro:page-load', prepareImages);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepareImages, { once: true });
else prepareImages();
