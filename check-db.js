const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and data...');
    
    // Check Academy records
    const academies = await prisma.academy.findMany();
    console.log(`📚 Found ${academies.length} academies:`, academies.map(a => ({ id: a.id, name: a.name })));
    
    // Check Students
    const students = await prisma.student.findMany();
    console.log(`👨‍🎓 Found ${students.length} students`);
    
    // Check Coaches
    const coaches = await prisma.coach.findMany();
    console.log(`👨‍🏫 Found ${coaches.length} coaches`);
    
    // Check Classes
    const classes = await prisma.class.findMany();
    console.log(`🏫 Found ${classes.length} classes`);
    
    console.log('✅ Database check completed successfully');
  } catch (error) {
    console.error('❌ Database check failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();