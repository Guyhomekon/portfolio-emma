import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const projects = defineCollection({ loader: glob({ pattern: ['**/*.json', '!**/* 2.json'], base: './src/content/projects' }), schema: z.object({ title: z.string(), number: z.string(), category: z.enum(['Projets académiques','Travaux complémentaires','En stage']), type: z.string(), location: z.string(), year: z.string(), heroImage: z.string(), shortDescription: z.string(), description: z.string(), problematic: z.string(), concept: z.string(), materials: z.array(z.string()), featured: z.boolean(), gallery: z.array(z.object({ title: z.string(), image: z.string(), page: z.number() })) }) });
export const collections = { projects };
