import createWorker from './helpers/createWorker.js';
import path from 'path';
const root = path.resolve(`./`);
global.root = root;

createWorker({ name: 'tasks' }, `${global.root}/runners/tasks.js`);