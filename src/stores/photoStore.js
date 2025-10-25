import { create } from 'zustand';
import { convertFileSrc } from '@tauri-apps/api/core';
import metadataService from '../services/metadataService';

const usePhotoStore = create((set) => ({
  selectedPhoto: null,
  openDetailsSidebar: async (photoPath) => {
    const metadata = await metadataService.getMetadata(photoPath);
    set({ selectedPhoto: { path: photoPath, url: convertFileSrc(photoPath), metadata } });
  },
  closeDetailsSidebar: () => set({ selectedPhoto: null }),
}));

export default usePhotoStore;
