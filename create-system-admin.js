const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating System Admin user...');
    
    // Hash the password
    const password = 'admin123';
    const hashedPassword = await hash(password, 10);
    
    // Check if we need to create an academy for the system admin
    let academyId;
    const systemAcademy = await prisma.academy.findFirst({
      where: {
        name: 'System Academy'
      }
    });
    
    if (systemAcademy) {
      academyId = systemAcademy.id;
      console.log(`Using existing System Academy with ID: ${academyId}`);
    } else {
      // Create a system academy
      const newAcademy = await prisma.academy.create({
        data: {
          name: 'System Academy',
          email: 'system@example.com',
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
        email: 'sysadmin@example.com',
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
        email: 'sysadmin@example.com',
        firstName: 'System',
        lastName: 'Admin',
        role: 'SYSTEM_ADMIN',
        academyId: academyId,
        password: hashedPassword
      }
    });
    
    console.log('System Admin user created successfully:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: sysadmin@example.com`);
    console.log(`Password: ${password}`);
    console.log(`Role: SYSTEM_ADMIN`);
    
  } catch (error) {
    console.error('Error creating System Admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();