const { PrismaClient } = require('@prisma/client');

async function checkData() {
  const prisma = new PrismaClient();
  
  try {
    const classSessionCount = await prisma.classSession.count();
    console.log('ClassSession count:', classSessionCount);
    
    const classCount = await prisma.class.count();
    console.log('Class count:', classCount);
    
    const coachCount = await prisma.coach.count();
    console.log('Coach count:', coachCount);
    
    // Get some sample data
    const sampleSessions = await prisma.classSession.findMany({
      take: 3,
      include: {
        class: {
          include: {
            coach: true
          }
        }
      }
    });
    
    console.log('Sample sessions:', JSON.stringify(sampleSessions, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();