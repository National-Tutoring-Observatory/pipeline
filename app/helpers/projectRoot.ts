import fs from "fs";
import path from "path";

function findRepoRoot(startDir: string, marker: string): string | null {
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, marker))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }
  return null;
}

export const PROJECT_ROOT: string = (() => {
  if (process.env.PROJECT_ROOT) {
    return path.resolve(process.env.PROJECT_ROOT);
  }
  const repoRoot = findRepoRoot(process.cwd(), "yarn.lock");
  const resolved = repoRoot || process.cwd();
  console.warn("PROJECT_ROOT env var not set, using:", resolved);
  return resolved;
})();

// DATA_PATH can be used to explicitly point tests or runtime to a data directory.
// If not set, it defaults to `<PROJECT_ROOT>/data` for backwards compatibility.
export const DATA_PATH: string = (() => {
  if (process.env.DATA_PATH) {
    return path.resolve(process.env.DATA_PATH);
  }
  return path.join(PROJECT_ROOT, "data");
})();
