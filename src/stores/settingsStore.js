import { create } from 'zustand';
import settingsService from '../services/settingsService';

const useSettingsStore = create((set, get) => ({
  theme: 'light',
  loaded: false,

  init: async () => {
    const theme = await settingsService.getSetting('theme');
    if (theme) {
      set({ theme });
    }
    set({ loaded: true });
    document.documentElement.setAttribute('data-theme', get().theme);
  },

  setTheme: async (theme) => {
    set({ theme });
    await settingsService.setSetting('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },
}));

export default useSettingsStore;
