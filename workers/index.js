import path from 'path';
import createWorker from './helpers/createWorker.js';
const root = path.resolve(`./`);
global.root = root;

createWorker({ name: 'tasks' }, `${global.root}/runners/tasks.js`);
