import raw from '../data/author.json';
import {authorSchema} from './author-schema.mjs';
export const author=authorSchema.parse(raw);
