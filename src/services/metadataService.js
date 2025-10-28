import {invoke} from '@tauri-apps/api/core';

class MetadataService {
    static async getMetadata(photoPath) {
        console.log(photoPath)
        const res = await invoke('get_image_metadata', {filePath: photoPath});

        console.log(res);

        return res.entries;
    }
}

export default MetadataService;
