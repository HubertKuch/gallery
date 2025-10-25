import { readDir } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

class AlbumService {
  async readDirectory(path) {
    return this.readDirRecursive(path, path.split('/').pop());
  }

  async readDirRecursive(currentPath, name) {
    const entries = await readDir(currentPath);
    const node = { name, path: currentPath, children: [] };

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = await join(currentPath, entry.name);

      if (entry.isDirectory) {
        const childNode = await this.readDirRecursive(fullPath, entry.name);
        node.children.push(childNode);
      }
    }
    return node;
  }

  async getImages(path) {
    if (!path) return [];
    const entries = await readDir(path);
    const images = [];
    for (const entry of entries) {
      if (entry.isFile && /\.(jpe?g|png|gif|webp)$/i.test(entry.name)) {
        const fullPath = await join(path, entry.name);
        images.push(fullPath);
      }
    }
    return images;
  }
}

const albumService = new AlbumService();
export default albumService;
