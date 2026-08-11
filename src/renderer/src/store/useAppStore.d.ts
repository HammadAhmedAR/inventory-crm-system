interface AppState {
    isWalkInModalOpen: boolean;
    toggleWalkInModal: () => void;
    openWalkInModal: () => void;
    closeWalkInModal: () => void;
    selectedCustomerId: string | null;
    setSelectedCustomerId: (id: string | null) => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AppState>>;
export {};
