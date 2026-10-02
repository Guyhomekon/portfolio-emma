import { getCollection } from 'astro:content';
export async function projectPaths() {
  const projects = (await getCollection('projects')).sort((a, b) => a.data.number.localeCompare(b.data.number));
  return projects.map((project, index) => ({ params: { slug: project.id }, props: { project, next: projects[(index + 1) % projects.length] } }));
}
