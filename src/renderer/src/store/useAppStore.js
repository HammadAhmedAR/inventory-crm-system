import { create } from "zustand";
export const useAppStore = create((set) => ({
    isWalkInModalOpen: false,
    toggleWalkInModal: () => set((state) => ({ isWalkInModalOpen: !state.isWalkInModalOpen })),
    openWalkInModal: () => set({ isWalkInModalOpen: true }),
    closeWalkInModal: () => set({ isWalkInModalOpen: false }),
    selectedCustomerId: null,
    setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
}));
