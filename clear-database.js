// Script to clear all data from the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Starting database cleanup...');

  try {
    // Delete in order to respect foreign key constraints
    console.log('Deleting attendance records...');
    await prisma.attendance.deleteMany();
    
    console.log('Deleting class sessions...');
    await prisma.classSession.deleteMany();
    
    console.log('Deleting class enrollments...');
    await prisma.classEnrollment.deleteMany();
    
    console.log('Deleting classes...');
    await prisma.class.deleteMany();
    
    console.log('Deleting availability records...');
    await prisma.availability.deleteMany();
    
    console.log('Deleting coaches...');
    await prisma.coach.deleteMany();
    
    console.log('Deleting courts...');
    await prisma.court.deleteMany();
    
    console.log('Deleting students...');
    await prisma.student.deleteMany();
    
    console.log('Deleting free trial requests...');
    await prisma.freeTrialRequest.deleteMany();
    
    console.log('Deleting users...');
    await prisma.user.deleteMany();
    
    console.log('Deleting academies...');
    await prisma.academy.deleteMany();

    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();