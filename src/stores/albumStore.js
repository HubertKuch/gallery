import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import albumService from '../services/albumService';
import useModal from './modalStore.js';
import populateFSError from '../errors/fsErrorPopulator.js';

async function cleanupListeners(get, set) {
  const {
    thumbnailReadyListener,
    thumbnailFinishedListener,
    albumMetadataListener, // 👈 New listener to clean up
  } = get();

  if (thumbnailReadyListener) await thumbnailReadyListener();
  if (thumbnailFinishedListener) await thumbnailFinishedListener();
  if (albumMetadataListener) await albumMetadataListener();

  set({
    thumbnailReadyListener: null,
    thumbnailFinishedListener: null,
    albumMetadataListener: null,
  });
}

const useAlbumStore = create((set, get) => ({
  tree: null,
  currentAlbum: null,
  currentAlbumImages: [], // Original paths (still useful)
  currentAlbumThumbnails: [], // Fast, cached paths
  imageCount: 0, // The number of skeletons to show
  isLoadingThumbnails: false,

  thumbnailReadyListener: null,
  thumbnailFinishedListener: null,
  albumMetadataListener: null, // 👈 NEW

  loadAlbum: async (path) => {
    try {
      const tree = await albumService.readDirectory(path);
      console.log('test');
      set({ tree });
    } catch (e) {
      console.error(e);
      useModal.getState().openModal('Album loading', populateFSError(e));
    }
  },

  setCurrentAlbum: async (album) => {
    await cleanupListeners(get, set);

    set({
      currentAlbum: album,
      currentAlbumImages: [],
      currentAlbumThumbnails: [],
      imageCount: 0, // 👈 Reset count
      isLoadingThumbnails: true,
    });

    if (!album || !album.path) {
      set({ isLoadingThumbnails: false });
      return;
    }

    try {
      const albumMetadataListener = await listen('album-metadata-ready', (event) => {
        console.log('Got metadata:', event.payload);
        set({ imageCount: event.payload.image_count });
      });

      // Listen for a new thumbnail
      const thumbnailReadyListener = await listen('thumbnail-ready', (event) => {
        set((state) => ({
          currentAlbumThumbnails: [...state.currentAlbumThumbnails, event.payload],
        }));
      });

      // Listen for the finish signal
      const thumbnailFinishedListener = await listen('thumbnail-generation-finished', () => {
        console.debug('Finished generating thumbnails.');
        set({ isLoadingThumbnails: false });
        cleanupListeners(get, set);
      });

      set({
        thumbnailReadyListener,
        thumbnailFinishedListener,
        albumMetadataListener,
      });

      await invoke('start_album_load', { albumPath: album.path });
    } catch (e) {
      console.error(e);
      useModal.getState().openModal('Image loading', populateFSError(e));
      set({ isLoadingThumbnails: false });
    }
  },
}));

export default useAlbumStore;
