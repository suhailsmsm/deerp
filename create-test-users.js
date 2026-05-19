const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Creating test data...\n');

    // Create or get a test tenant
    let tenant = await prisma.tenant.findFirst();

    if (!tenant) {
      console.log('📌 Creating test tenant...');
      tenant = await prisma.tenant.create({
        data: {
          id: 'tenant-001',
          name: 'Test Company',
          subdomain: 'test-company',
          plan: 'pro',
          status: 'active',
        },
      });
      console.log(`✅ Tenant created: ${tenant.name}\n`);
    } else {
      console.log(`✅ Using existing tenant: ${tenant.name}\n`);
    }

    // Create or get a test company
    let company = await prisma.company.findFirst();

    if (!company) {
      console.log('🏢 Creating test company...');
      company = await prisma.company.create({
        data: {
          tenantId: tenant.id,
          name: 'Test Business',
          nameAr: 'عمل اختبار',
          trn: '100123456789',
        },
      });
      console.log(`✅ Company created: ${company.name}\n`);
    } else {
      console.log(`✅ Using existing company: ${company.name}\n`);
    }

    // Create test users
    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
      },
      {
        email: 'manager@test.com',
        password: 'manager123',
        role: 'manager',
        name: 'Manager User',
      },
      {
        email: 'staff@test.com',
        password: 'staff123',
        role: 'staff',
        name: 'Staff User',
      },
      {
        email: 'cashier@test.com',
        password: 'cashier123',
        role: 'cashier',
        name: 'Cashier User',
      },
    ];

    console.log('👤 Creating test users...\n');

    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`⏭️  User already exists: ${userData.email}`);
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await prisma.user.create({
          data: {
            tenantId: tenant.id,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
          },
        });
        console.log(`✅ Created: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Role: ${userData.role}\n`);
      }
    }

    // Create test customers
    const testCustomers = [
      { name: 'Ahmed Al-Mansouri', phone: '971501234567' },
      { name: 'Fatima Al-Naqbi', phone: '971509876543' },
      { name: 'Mohammed Al-Mazrouei', phone: '971502345678' },
      { name: 'Layla Al-Kaabi', phone: '971507654321' },
      { name: 'Sara Al-Maktoum', phone: '971503456789' },
    ];

    console.log('👥 Creating test customers...\n');

    for (const customerData of testCustomers) {
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: customerData.phone },
      });

      if (existingCustomer) {
        console.log(`⏭️  Customer already exists: ${customerData.name}`);
      } else {
        const customer = await prisma.customer.create({
          data: {
            name: customerData.name,
            phone: customerData.phone,
            loyalty: Math.floor(Math.random() * 500),
          },
        });
        console.log(`✅ Created: ${customerData.name} (${customerData.phone})`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST DATA CREATED SUCCESSFULLY!\n');
    console.log('📱 Login credentials for mobile app:');
    console.log('═'.repeat(60));
    console.log(`Tenant ID:  ${tenant.id}`);
    console.log('\nAdmin Account:');
    console.log('  Email:    admin@test.com');
    console.log('  Password: admin123\n');
    console.log('Manager Account:');
    console.log('  Email:    manager@test.com');
    console.log('  Password: manager123\n');
    console.log('Staff Account:');
    console.log('  Email:    staff@test.com');
    console.log('  Password: staff123\n');
    console.log('Cashier Account:');
    console.log('  Email:    cashier@test.com');
    console.log('  Password: cashier123\n');
    console.log('═'.repeat(60));
    console.log(`Company ID: ${company.id}`);
    console.log(`Company:    ${company.name}`);
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
