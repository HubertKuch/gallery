import {create} from 'zustand';

const useViewStore = create((set) => ({
    currentView: 'grid',
    history: [],
    settingsOpen: false,
    openSettings: () => set(state => ({...state, settingsOpen: true})),
    closeSettings: () => set(state => ({...state, settingsOpen: false})),
    setCurrentView: (view) => set((state) => ({...state,
        currentView: view,
        history: [...state.history, state.currentView],
    })),
}));

export default useViewStore;
