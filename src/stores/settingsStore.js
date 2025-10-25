import { create } from 'zustand';
import { open } from '@tauri-apps/plugin-dialog';
import settingsService from '../services/settingsService';
import useAlbumStore from './albumStore';

const useSettingsStore = create((set, get) => ({
  theme: 'light',
  albumDirectory: null,
  loaded: false,

  init: async () => {
    const theme = await settingsService.getSetting('theme');
    if (theme) {
      set({ theme });
    }
    const albumDirectory = await settingsService.getSetting('albumDirectory');
    if (albumDirectory) {
      set({ albumDirectory });
      useAlbumStore.getState().loadAlbum(albumDirectory);
    }
    set({ loaded: true });
    document.documentElement.setAttribute('data-theme', get().theme);
  },

  setTheme: async (theme) => {
    set({ theme });
    await settingsService.setSetting('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  setAlbumDirectory: async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected) {
      set({ albumDirectory: selected });
      await settingsService.setSetting('albumDirectory', selected);
      useAlbumStore.getState().loadAlbum(selected);
    }
  },
}));

export default useSettingsStore;
