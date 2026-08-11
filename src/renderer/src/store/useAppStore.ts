import { create } from "zustand";

interface AppState {
  isWalkInModalOpen: boolean;
  toggleWalkInModal: () => void;
  openWalkInModal: () => void;
  closeWalkInModal: () => void;

  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedChassisNumber: string | null;
  setSelectedChassisNumber: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isWalkInModalOpen: false,
  toggleWalkInModal: () => set((state) => ({ isWalkInModalOpen: !state.isWalkInModalOpen })),
  openWalkInModal: () => set({ isWalkInModalOpen: true }),
  closeWalkInModal: () => set({ isWalkInModalOpen: false }),

  selectedCustomerId: null,
  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  selectedChassisNumber: null,
  setSelectedChassisNumber: (id) => set({ selectedChassisNumber: id }),
}));
