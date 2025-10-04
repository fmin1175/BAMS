// Script to add Student 22 to the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addStudent22() {
  try {
    console.log('Adding Student 22 to the database...');
    
    const student = await prisma.student.create({
      data: {
        name: 'Student 22',
        dateOfBirth: new Date('2010-01-01'),
        guardianName: 'Guardian 22',
        contactNumber: '555-1022',
        academyId: 1
      }
    });
    
    console.log('Student 22 created successfully:', student);
  } catch (error) {
    console.error('Error creating Student 22:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addStudent22();