const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveTransaction: (data) => ipcRenderer.invoke('save-transaction', data),
  getProducts: () => ipcRenderer.invoke('get-products'),
  getCustomers: () => ipcRenderer.invoke('get-customers'),
  updateLoyalty: (payload) => ipcRenderer.invoke('update-customer-loyalty', payload),
  getBranches: () => ipcRenderer.invoke('get-branches'),
  verifyStaff: (pin) => ipcRenderer.invoke('verify-staff-pin', pin),
  updateStock: (id, newStock) => ipcRenderer.invoke('update-stock', id, newStock),
  updateProduct: (product) => ipcRenderer.invoke('update-product', product),
  startShift: (data) => ipcRenderer.invoke('start-shift', data),
  getShiftReport: (id) => ipcRenderer.invoke('get-shift-report', id),
  getTables: () => ipcRenderer.invoke('get-tables'),
  updateTable: (payload) => ipcRenderer.invoke('update-table-status', payload),
  getModules: () => ipcRenderer.invoke('get-modules'),
  generateQr: (data) => ipcRenderer.invoke('generate-invoice-qr', data),
  getExpiringProducts: () => ipcRenderer.invoke('get-expiring-products'),
  toggleModule: (payload) => ipcRenderer.invoke('toggle-module', payload),
  printReceipt: (html) => ipcRenderer.invoke('print-receipt', html),
  sendWhatsApp: (payload) => ipcRenderer.invoke('send-whatsapp', payload),
  openDrawer: () => ipcRenderer.invoke('trigger-drawer'),
  syncStatus: (callback) => ipcRenderer.on('sync-status-update', callback)
});