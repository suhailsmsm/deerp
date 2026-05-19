interface ElectronAPI {
  saveTransaction(data: any): Promise<any>;
  getTransactions(): Promise<any>;
  getProducts(): Promise<any>;
  getCustomers(): Promise<any>;
  updateLoyalty(payload: any): Promise<any>;
  updateProduct(product: any): Promise<any>;
  bulkUpsertProducts(products: any[]): Promise<any>;
  getBranches(): Promise<any>;
  verifyStaff(pin: any): Promise<any>;
  updateStock(id: any, newStock: any): Promise<any>;
  startShift(data: any): Promise<any>;
  getShiftReport(id: any): Promise<any>;
  getTables(): Promise<any>;
  updateTable(payload: any): Promise<any>;
  getModules(): Promise<any>;
  generateQr(data: any): Promise<any>;
  getExpiringProducts(): Promise<any>;
  toggleModule(payload: any): Promise<any>;
  printReceipt(html: string): Promise<any>;
  sendWhatsApp(payload: any): Promise<any>;
  openDrawer(): Promise<any>;
  syncStatus(callback: (...args: any[]) => unknown): void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
