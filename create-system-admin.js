const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

// Allow passing DATABASE_URL via CLI arg for targeting specific environments
// Usage: node create-system-admin.js "postgresql://..."
const dbUrlArg = process.argv[2];
if (dbUrlArg) {
  process.env.DATABASE_URL = dbUrlArg;
  console.log('Using DATABASE_URL from CLI argument');
}

// Make system admin credentials configurable via environment variables
const sysAdminEmail = process.env.SYSADMIN_EMAIL || 'sysadmin@example.com';
const sysAdminPassword = process.env.SYSADMIN_PASSWORD || 'admin123';
const sysAcademyName = process.env.SYSADMIN_ACADEMY_NAME || 'System Academy';
const sysAcademyEmail = process.env.SYSADMIN_ACADEMY_EMAIL || 'system@example.com';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating System Admin user...');
    
    // Hash the password
    const hashedPassword = await hash(sysAdminPassword, 10);
    
    // Check if we need to create an academy for the system admin
    let academyId;
    const systemAcademy = await prisma.academy.findFirst({
      where: {
        name: sysAcademyName
      }
    });
    
    if (systemAcademy) {
      academyId = systemAcademy.id;
      console.log(`Using existing System Academy with ID: ${academyId}`);
    } else {
      // Create a system academy
      const newAcademy = await prisma.academy.create({
        data: {
          name: sysAcademyName,
          email: sysAcademyEmail,
          phone: '000-000-0000',
          description: 'System Academy for administrative purposes'
        }
      });
      academyId = newAcademy.id;
      console.log(`Created new System Academy with ID: ${academyId}`);
    }
    
    // Check if the system admin user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: sysAdminEmail,
        role: 'SYSTEM_ADMIN'
      }
    });
    
    if (existingUser) {
      console.log(`System Admin user already exists with ID: ${existingUser.id}`);
      return;
    }
    
    // Create the system admin user
    const user = await prisma.user.create({
      data: {
        email: sysAdminEmail,
        firstName: 'System',
        lastName: 'Admin',
        role: 'SYSTEM_ADMIN',
        academyId: academyId,
        password: hashedPassword
      }
    });
    
    console.log('System Admin user created successfully:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${sysAdminEmail}`);
    console.log(`Password: ${sysAdminPassword}`);
    console.log(`Role: SYSTEM_ADMIN`);
    
  } catch (error) {
    console.error('Error creating System Admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();