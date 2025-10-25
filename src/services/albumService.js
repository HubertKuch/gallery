import { readDir } from '@tauri-apps/plugin-fs';

class AlbumService {
  async readDirectory(path) {
    const entries = await readDir(path, { recursive: true });
    return this.buildTree(entries, path);
  }

  buildTree(entries, rootPath) {
    console.log(rootPath, entries);

    const root = { name: 'Photos', path: rootPath, children: [] };
    const map = { [rootPath]: root };

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const parentPath = entry.path.substring(0, entry.path.lastIndexOf('/'));
      const parentNode = map[parentPath];

      if (parentNode) {
        if (entry.children) {
          const node = { name: entry.name, path: entry.path, children: [] };
          parentNode.children.push(node);
          map[entry.path] = node;
        } else if (/\.(jpe?g|png|gif|webp)$/i.test(entry.name)) {
          parentNode.children.push({ name: entry.name, path: entry.path });
        }
      }
    }
    return root;
  }

  async getImages(path) {
    const entries = await readDir(path);
    const images = [];
    for (const entry of entries) {
      if (!entry.children && /\.(jpe?g|png|gif|webp)$/i.test(entry.name)) {
        images.push(entry.path);
      }
    }
    return images;
  }
}

const albumService = new AlbumService();
export default albumService;
