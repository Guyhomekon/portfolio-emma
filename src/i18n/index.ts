import english from './en.json';
export type Locale = 'en' | 'fr';
const messages: Record<string, string> = english;
export const localeFrom = (url: URL): Locale => url.pathname === '/fr' || url.pathname.startsWith('/fr/') ? 'fr' : 'en';
export const translator = (url: URL) => (text: string): string => localeFrom(url) === 'fr' ? text : (messages[text] ?? text);

export function localizedPath(path: string, locale: Locale): string {
  if (!path.startsWith('/') || /\.[a-z0-9]+(?:$|[?#])/i.test(path)) return path;
  const [pathname, ...fragment] = path.split('#');
  const clean = pathname.replace(/^\/fr(?=\/|$)/, '') || '/';
  const french = clean.replace(/^\/projects(?=\/|$)/, '/projets').replace(/^\/about(?=\/|$)/, '/a-propos');
  const localized = locale === 'fr' ? `/fr${french === '/' ? '/' : french}` : french.replace(/^\/projets(?=\/|$)/, '/projects').replace(/^\/a-propos(?=\/|$)/, '/about');
  return localized + (fragment.length ? '#' + fragment.join('#') : '');
}
export const pathFor = (url: URL) => (path: string) => localizedPath(path, localeFrom(url));
export function translateData<T>(value: T, url: URL): T {
  const t = translator(url);
  function walk(item: unknown): unknown {
    if (typeof item === 'string') return t(item);
    if (Array.isArray(item)) return item.map(walk);
    if (item && typeof item === 'object') return Object.fromEntries(Object.entries(item).map(([key, child]) => [key, walk(child)]));
    return item;
  }
  return walk(value) as T;
}
