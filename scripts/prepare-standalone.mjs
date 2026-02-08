import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, '.next', 'standalone');
const standaloneServer = path.join(standaloneRoot, 'server.js');

if (!fs.existsSync(standaloneServer)) {
  console.error('Missing standalone build at .next/standalone/server.js. Run `yarn build` first.');
  process.exit(1);
}

const copyRecursive = (from, to) => {
  if (!fs.existsSync(from)) {
    return;
  }

  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true, force: true });
};

copyRecursive(path.join(projectRoot, 'public'), path.join(standaloneRoot, 'public'));
copyRecursive(path.join(projectRoot, '.next', 'static'), path.join(standaloneRoot, '.next', 'static'));
