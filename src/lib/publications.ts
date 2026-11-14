import raw from '../data/publications.json';
import {validatePublications,publicationSchema} from './publications.mjs';
import type {z} from 'zod';
export type Publication = z.infer<typeof publicationSchema>;
export const publications: Publication[]=validatePublications(raw);
