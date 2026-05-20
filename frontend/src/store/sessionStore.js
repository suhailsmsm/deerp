import { create } from 'zustand';

export const useSessionStore = create((set) => ({
  currentStaff: null,
  currentBranch: null,
  isAuthenticated: false,
  setStaff: (staff) => set({ currentStaff: staff, isAuthenticated: !!staff }),
  setBranch: (branch) => set({ currentBranch: branch }),
  logout: () => set({ currentStaff: null, isAuthenticated: false }),
}));