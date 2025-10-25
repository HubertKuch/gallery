import { create } from 'zustand';
import albumService from '../services/albumService';
import useModal from './modalStore.js';
import populateFSError from '../errors/fsErrorPopulator.js';

const useAlbumStore = create((set) => ({
  tree: null,
  currentAlbum: null,
  currentAlbumImages: [],

  loadAlbum: async (path) => {
    try {
      const tree = await albumService.readDirectory(path);
      set({ tree });
    } catch (e) {
      console.error(e);

      useModal.getState().openModal('Album loading', populateFSError(e));
    }
  },

  setCurrentAlbum: async (album) => {
    set({ currentAlbum: album });
    if (album && album.path) {
      const images = await albumService.getImages(album.path);
      set({ currentAlbumImages: images });
    } else {
      set({ currentAlbumImages: [] });
    }
  },
}));

export default useAlbumStore;
