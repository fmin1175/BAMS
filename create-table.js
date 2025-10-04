const { prisma } = require('./src/lib/prisma');

async function createTable() {
  try {
    // Check if the table exists in the public schema
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'FreeTrialRequest'
      );
    `;
    
    console.log('Table exists check result:', tableExists);
    
    // If table doesn't exist, create it
    if (!tableExists[0].exists) {
      console.log('Creating FreeTrialRequest table in public schema...');
      
      await prisma.$executeRaw`
        CREATE TABLE "public"."FreeTrialRequest" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL UNIQUE,
          "phone" TEXT NOT NULL,
          "academyName" TEXT NOT NULL,
          "studentsCount" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "password" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      console.log('Table created successfully');
    } else {
      console.log('Table already exists, skipping creation');
    }
    
    console.log('Done!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTable();