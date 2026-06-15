/**
 * Navigation Types
 */

export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
};

export type POSStackParamList = {
  POSHome: undefined;
  Cart: undefined;
  Wishlist: undefined;
  Checkout: undefined;
  Scanner: undefined;
  Receipt: undefined;
};

export type SalesStackParamList = {
  SalesHistory: undefined;
  Receipt: undefined;
};

export type CRMStackParamList = {
  Customers: undefined;
  CustomerDetail: { customer: any };
  CreateOrder: { customer: any };
};

export type InventoryStackParamList = {
  InventoryHome: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};

export type MainTabParamList = {
  POS: undefined;
  Sales: undefined;
  CRM: undefined;
  Inventory: undefined;
  Settings: undefined;
};
