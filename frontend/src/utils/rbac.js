const ROLE_PERMISSIONS = {
  super_admin: ['*'], // Full System Access
  admin: ['pos', 'inventory', 'reports', 'accounting', 'hr', 'settings'],
  manager: ['pos', 'inventory', 'reports', 'crm'],
  cashier: ['pos', 'crm'],
  kitchen: ['fnb_kds'],
};

export function canUserAccess(role, moduleId) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  
  const permissions = ROLE_PERMISSIONS[role];
  
  if (permissions.includes('*')) return true;
  
  return permissions.includes(moduleId);
}

export const ROLES = Object.keys(ROLE_PERMISSIONS).map(role => ({
  value: role,
  label: role.replace('_', ' ').toUpperCase()
}));