// Script to check if Academy record exists and create it if it doesn't
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAcademyRecord() {
  try {
    console.log('Checking if Academy record exists...');
    
    // Check if Academy with ID 1 exists
    const existingAcademy = await prisma.academy.findUnique({
      where: { id: 1 }
    });
    
    if (existingAcademy) {
      console.log('Academy record already exists:', existingAcademy);
      return;
    }
    
    // Create Academy record if it doesn't exist
    console.log('Academy record not found. Creating new record...');
    const newAcademy = await prisma.academy.create({
      data: {
        id: 1,
        name: 'System Academy',
        email: 'admin@system.com',
        phone: '123-456-7890',
        website: 'https://system-academy.com',
        description: 'Default system academy',
        headCoach: 'Head Coach',
        headCoachEmail: 'headcoach@system.com',
        headCoachPhone: '123-456-7890',
        headCoachQualification: 'Level 3',
        defaultCoachPassword: 'coach',
        subscriptionPlan: 'BASIC',
        maxStudents: 100,
        maxCoaches: 10
      }
    });
    
    console.log('Academy record created successfully:', newAcademy);
  } catch (error) {
    console.error('Error creating Academy record:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAcademyRecord()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error));