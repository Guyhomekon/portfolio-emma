import type { CollectionEntry } from 'astro:content';
import {
  defineSchema, entityRef, ItemList, ListItem, Person, PersonSchema,
  ProfilePage, WebPage, WebSite, withAdditionalProperties, withAdditionalTypes,
} from '@unschema-graph/astro';
import { z } from 'zod';
import { localeFrom, localizedPath, translator } from '../i18n';

// v0.10.0 has no CreativeWork builder. Use its documented, validated extension API.
export const PortfolioWork = defineSchema('CreativeWork', z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.url(),
  inLanguage: z.enum(['en', 'fr']),
  creator: entityRef({ schemas: [PersonSchema], types: ['Person'] }),
}).strict());

type Project = CollectionEntry<'projects'>;
export interface PortfolioSchemaInput {
  url: URL;
  site: URL;
  title: string;
  description: string;
  project?: Pick<Project['data'], 'title' | 'description'>;
  projects?: Pick<Project, 'id' | 'data'>[];
}

export function buildPortfolioSchema({ url, site, title, description, project, projects }: PortfolioSchemaInput) {
  const t = translator(url);
  const locale = localeFrom(url);
  const route = localizedPath(url.pathname, 'en');
  const canonical = new URL(url.pathname, site).href;
  const emma = Person({
    '@id': '/#emma-expert',
    name: 'Emma Expert',
    jobTitle: t('Designer d’espace'),
    url: new URL('/about/', site).href,
    sameAs: ['https://www.linkedin.com/in/emma-expert-758432247/'],
  });
  const website = WebSite({
    '@id': '/#website',
    name: 'Emma Expert - Portfolio',
    url: site.href,
    publisher: emma,
  });
  const pageData = {
    '@id': `${url.pathname}#webpage`,
    name: title,
    description,
    url: canonical,
    inLanguage: locale,
  };

  if (route === '/about/') {
    return withAdditionalProperties(ProfilePage({ ...pageData, mainEntity: emma }), { isPartOf: website });
  }

  const page = WebPage({ ...pageData, isPartOf: website });
  if (project) {
    const work = PortfolioWork({
      '@id': `${route}#project`,
      name: project.title,
      description: project.description,
      url: canonical,
      inLanguage: locale,
      creator: emma,
    });
    return withAdditionalProperties(page, { mainEntity: work });
  }
  if (route === '/projects/' && projects?.length) {
    const list = ItemList({
      '@id': `${url.pathname}#projects`,
      name: t('Projets'),
      numberOfItems: projects.length,
      itemListElement: projects.map((item, index) => ListItem({
        name: t(item.data.title),
        position: index + 1,
        item: new URL(localizedPath(`/projects/${item.id}/`, locale), site).href,
      })),
    });
    return withAdditionalProperties(withAdditionalTypes(page, ['CollectionPage']), { mainEntity: list });
  }
  if (route === '/contact/') {
    return withAdditionalProperties(withAdditionalTypes(page, ['ContactPage']), { about: emma });
  }
  return withAdditionalProperties(page, { about: emma });
}
