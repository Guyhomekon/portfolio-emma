import assert from 'node:assert/strict';
import fs from 'node:fs';

const home = fs.readFileSync('dist/index.html', 'utf8');
const origin = new URL(home.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)[1]).origin + '/';
const english = JSON.parse(fs.readFileSync('src/i18n/en.json', 'utf8'));
const projects = fs.readdirSync('src/content/projects')
  .filter(file => file.endsWith('.json') && !file.endsWith(' 2.json'))
  .map(file => ({ id: file.slice(0, -5), ...JSON.parse(fs.readFileSync(`src/content/projects/${file}`, 'utf8')) }))
  .sort((a, b) => a.number.localeCompare(b.number));
const roots = new Map();
const graphs = new Map();
let count = 0;

// Validate generated routes, excluding local numbered backup copies of index.html.
for (const file of fs.readdirSync('dist', { recursive: true }).filter(file => /(^|\/)index\.html$/.test(file) || file === '404.html')) {
  const html = fs.readFileSync(`dist/${file}`, 'utf8');
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (!html.includes('property="og:title"')) continue; // Legacy redirects.
  if (/^(fr\/)?404(\/index)?\.html$/.test(file)) {
    assert.equal(blocks.length, 0, '404 pages must not describe portfolio content');
    continue;
  }
  assert.equal(blocks.length, 1, `${file}: exactly one JSON-LD block`);
  assert.ok(html.indexOf(blocks[0][0]) < html.indexOf('</head>'));
  const document = JSON.parse(blocks[0][1]);
  assert.equal(document['@context'], 'https://schema.org');
  assert.ok(Array.isArray(document['@graph']));
  const graph = document['@graph'];
  const byId = new Map(graph.map(entity => [entity['@id'], entity]));
  assert.equal(byId.size, graph.length, `${file}: unique entity identities`);
  const types = entity => [entity['@type']].flat();
  const person = graph.find(entity => types(entity).includes('Person'));
  const website = graph.find(entity => types(entity).includes('WebSite'));
  const page = graph.find(entity => types(entity).some(type => ['WebPage', 'ProfilePage'].includes(type)));
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  const locale = html.match(/<html[^>]*lang="([^"]+)"/)?.[1];
  assert.equal(person['@id'], `${origin}#emma-expert`);
  assert.equal(person.jobTitle, locale === 'fr' ? 'Designer d’espace' : 'Spatial designer');
  assert.deepEqual(person.sameAs, ['https://www.linkedin.com/in/emma-expert-758432247/']);
  assert.equal(person.telephone, undefined); assert.equal(person.email, undefined);
  assert.equal(website['@id'], `${origin}#website`);
  assert.equal(website.publisher['@id'], person['@id']);
  assert.equal(page['@id'], `${canonical}#webpage`);
  assert.equal(page.url, canonical); assert.equal(page.inLanguage, locale);
  assert.equal(page.isPartOf['@id'], website['@id']);
  function verifyReferences(value) {
    if (Array.isArray(value)) return value.forEach(verifyReferences);
    if (!value || typeof value !== 'object') return;
    if (Object.keys(value).length === 1 && value['@id']) assert.ok(byId.has(value['@id']), `${file}: resolved reference ${value['@id']}`);
    Object.values(value).forEach(verifyReferences);
  }
  verifyReferences(graph);
  graphs.set(new URL(canonical).pathname, graph);
  roots.set(new URL(canonical).pathname, page);
  count++;
}

for (const locale of ['en', 'fr']) {
  const t = text => locale === 'fr' ? text : (english[text] ?? text);
  const catalogPath = locale === 'fr' ? '/fr/projets/' : '/projects/';
  const list = graphs.get(catalogPath).find(entity => entity['@type'] === 'ItemList');
  assert.ok(roots.get(catalogPath)['@type'].includes('CollectionPage'));
  assert.equal(list.numberOfItems, projects.length);
  assert.equal(list.itemListElement.length, projects.length);
  for (const [index, project] of projects.entries()) {
    const path = `${catalogPath}${project.id}/`;
    const item = list.itemListElement[index];
    assert.equal(item.name, t(project.title));
    assert.equal(item.position, index + 1);
    assert.equal(item.item, new URL(path, origin).href);
    const graph = graphs.get(path);
    const work = graph.find(entity => entity['@type'] === 'CreativeWork');
    assert.equal(work['@id'], `${origin}projects/${project.id}/#project`);
    assert.equal(work.name, t(project.title));
    assert.equal(work.description, t(project.description));
    assert.equal(work.inLanguage, locale);
    assert.equal(work.creator['@id'], `${origin}#emma-expert`);
    assert.equal(roots.get(path).mainEntity['@id'], work['@id']);
    assert.equal(work.datePublished, undefined);
  }
  const profile = roots.get(locale === 'fr' ? '/fr/a-propos/' : '/about/');
  assert.equal(profile['@type'], 'ProfilePage');
  assert.equal(profile.mainEntity['@id'], `${origin}#emma-expert`);
  assert.ok(roots.get(locale === 'fr' ? '/fr/contact/' : '/contact/')['@type'].includes('ContactPage'));
}
assert.equal(count, 26);
console.log(`PASS: ${count} server-rendered unified graphs, resolved references, stable bilingual identities, nine visible projects, localized descriptions, profiles/contact pages and no private contact data.`);
