const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create default modules
  const modules = [
    { id: 'fnb', name: 'F&B Restaurant Module', enabled: true, category: 'Operations' },
    { id: 'inventory', name: 'Inventory Management', enabled: true, category: 'Operations' },
    { id: 'crm', name: 'CRM', enabled: true, category: 'Marketing' },
    { id: 'loyalty', name: 'Loyalty & Vouchers', enabled: true, category: 'Marketing' },
    { id: 'accounting', name: 'Finance & VAT', enabled: true, category: 'Finance' },
    { id: 'commissions', name: 'Staff Commissions', enabled: false, category: 'Finance' },
    { id: 'whatsapp', name: 'WhatsApp Integration', enabled: true, category: 'Communications' },
    { id: 'multiBranch', name: 'Multi-Branch Sync', enabled: false, category: 'Operations' },
  ];

  for (const m of modules) {
    await prisma.module.upsert({ 
      where: { id: m.id }, 
      update: { enabled: m.enabled }, 
      create: m 
    });
  }

  // Create a default Branch and Staff
  await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Abu Dhabi HQ', location: 'Abu Dhabi', trn: '100387652400003' }
  });

  await prisma.staff.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Ahmed K.', role: 'Admin', pin: '1234' }
  });

  // Add Demo Products
  const products = [
    { id: 1, barcode: '6281000001', name: 'Basmati Rice 5kg', category: 'Grocery', price: 28.5, cost: 20.0, stock: 142, unit: 'bag', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80' },
    { id: 2, barcode: '6281000002', name: 'Nido Milk 900g', category: 'Dairy', price: 34, cost: 25.0, stock: 56, unit: 'tin', image: 'https://images.unsplash.com/photo-1550583724-125581fe2f8a?auto=format&fit=crop&w=400&q=80' },
    { id: 3, barcode: '6281000003', name: 'Lays Classic 160g', category: 'Snacks', price: 8, cost: 5.5, stock: 4, unit: 'pcs', image: 'https://images.unsplash.com/photo-1566478489140-98b2f90c7490?auto=format&fit=crop&w=400&q=80' },
    { id: 4, barcode: '6281000004', name: 'Pepsi 1.5L', category: 'Beverages', price: 5, cost: 3.5, stock: 24, unit: 'bottle', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' },
    { id: 5, barcode: '6281000005', name: 'Tide 3kg', category: 'Cleaning', price: 44.5, cost: 32.0, stock: 23, unit: 'box', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80' },
    { id: 6, barcode: '6281000006', name: 'Sunflower Oil 3L', category: 'Grocery', price: 29, cost: 21.0, stock: 88, unit: 'bottle', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80' },
    { id: 7, barcode: '6281000007', name: 'iPhone Case 15', category: 'Accessories', price: 24.99, cost: 12.0, stock: 15, unit: 'pcs', image: 'https://images.unsplash.com/photo-1603313011101-31c7166aef41?auto=format&fit=crop&w=400&q=80' },
    { id: 8, barcode: '6281000008', name: 'Notebook A4 100pg', category: 'Stationery', price: 6.5, cost: 3.0, stock: 200, unit: 'pcs', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: { image: p.image, price: p.price, stock: p.stock },
      create: p
    });
  }

  // Add Demo Tables for F&B
  const tables = [
    { number: '1', status: 'available', capacity: 4 },
    { number: '2', status: 'occupied', capacity: 2 },
    { number: '3', status: 'available', capacity: 6 },
    { number: '4', status: 'reserved', capacity: 4 },
    { number: '5', status: 'available', capacity: 2 },
  ];

  for (const t of tables) {
    await prisma.table.upsert({
      where: { number: t.number },
      update: {},
      create: t
    });
  }

  // Add Demo Customers
  const customers = [
    { name: 'Mohammed Al Rashid', phone: '971501112233', loyalty: 450 },
    { name: 'Fatima Al Zaabi', phone: '971502223344', loyalty: 120 },
    { name: 'Khalid Ibrahim', phone: '971503334455', loyalty: 890 },
    { name: 'Sara Mohammed', phone: '971504445566', loyalty: 25 },
    { name: 'Omar Al Hamdan', phone: '971505556677', loyalty: 500 },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: {},
      create: c
    });
  }

  console.log('Seed completed: Login with PIN 1234');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());