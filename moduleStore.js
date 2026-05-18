import { create } from 'zustand';

export const useModuleStore = create((set) => ({
  modules: {
    fnb: true,
    inventory: true,
    crm: true,
    loyalty: true,
    accounting: true,
    commissions: false,
    whatsapp: true,
    multiBranch: false,
  },
  initModules: async () => {
    if (!window.electron) return; // Silent return if in browser

    const dbModules = await window.electron.getModules();
    if (dbModules.length > 0) {
      const moduleMap = {};
      dbModules.forEach(m => moduleMap[m.id] = m.enabled);
      set((state) => ({ modules: { ...state.modules, ...moduleMap } }));
    }
  },
  toggleModule: async (id) => {
    set((state) => {
      const newValue = !state.modules[id];
      if (window.electron) {
        window.electron.toggleModule({ id, enabled: newValue });
      }
      return {
        modules: { ...state.modules, [id]: newValue }
      };
    });
  }
}));