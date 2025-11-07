import path from 'path';
import { fileURLToPath } from 'url';

const modulePath = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(modulePath, '../../..');
