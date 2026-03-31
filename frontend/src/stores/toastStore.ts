import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  show: (message, type = 'info') => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ visible: true, message, type });
    toastTimer = setTimeout(() => {
      set({ visible: false });
      toastTimer = null;
    }, 3000);
  },
  hide: () => {
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = null;
    set({ visible: false });
  },
}));
