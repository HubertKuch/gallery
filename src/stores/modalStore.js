import { create } from 'zustand';

const useModal = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  openModal: (title, message) => set({ isOpen: true, title, message }),
  closeModal: () => set({ isOpen: false, title: '', message: '' }),
}));

export default useModal;
