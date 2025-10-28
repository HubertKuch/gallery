import { create } from 'zustand';
import { convertFileSrc } from '@tauri-apps/api/core';
import MetadataService from '../services/metadataService';

const usePhotoStore = create((set) => ({
  selectedPhoto: null,
  openDetailsSidebar: async (photoPath) => {
    const metadata = await MetadataService.getMetadata(photoPath);

    set({ selectedPhoto: { path: photoPath, url: convertFileSrc(photoPath), metadata } });
  },
  closeDetailsSidebar: () => set({ selectedPhoto: null }),
}));

export default usePhotoStore;
