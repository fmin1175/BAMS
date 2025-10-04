const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // First, let's check if the table exists
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'FreeTrialRequest'
      );
    `;
    
    console.log('Table exists check:', result);
    
    // Try to create a test record
    try {
      const testRecord = await prisma.FreeTrialRequest.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '12345678',
          academyName: 'Test Academy',
          studentsCount: '1-10',
          status: 'pending',
          password: 'testpassword'
        }
      });
      
      console.log('Successfully created test record:', testRecord);
    } catch (createError) {
      console.error('Error creating test record:', createError);
    }
    
  } catch (error) {
    console.error('Error checking table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();