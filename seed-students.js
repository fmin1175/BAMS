// Script to seed the local database with student data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedStudents() {
  console.log('Seeding students to local database...');
  
  // Check if we already have students
  const existingCount = await prisma.student.count();
  console.log(`Current student count: ${existingCount}`);
  
  if (existingCount > 0) {
    console.log('Students already exist in the database. Skipping seeding.');
    return;
  }
  
  // Default academy ID (make sure this exists in your database)
  const academyId = 1;
  
  // Check if academy exists
  const academy = await prisma.academy.findUnique({
    where: { id: academyId }
  });
  
  if (!academy) {
    console.log('Creating default academy...');
    await prisma.academy.create({
      data: {
        id: academyId,
        name: 'Default Academy',
        email: 'admin@example.com',
        phone: '555-1234'
      }
    });
    console.log('Default academy created.');
  }
  
  // Sample student data
  const students = [
    {
      name: 'John Smith',
      dateOfBirth: new Date('2010-05-15'),
      guardianName: 'Mary Smith',
      contactNumber: '555-1001',
      medicalNotes: 'No allergies',
      monthlyFee: 75.00,
      academyId
    },
    {
      name: 'Emma Johnson',
      dateOfBirth: new Date('2011-07-22'),
      guardianName: 'Robert Johnson',
      contactNumber: '555-1002',
      medicalNotes: 'Asthma',
      monthlyFee: 85.00,
      academyId
    },
    {
      name: 'Michael Brown',
      dateOfBirth: new Date('2009-03-10'),
      guardianName: 'Jennifer Brown',
      contactNumber: '555-1003',
      medicalNotes: null,
      monthlyFee: 75.00,
      academyId
    },
    {
      name: 'Sophia Davis',
      dateOfBirth: new Date('2012-11-05'),
      guardianName: 'William Davis',
      contactNumber: '555-1004',
      medicalNotes: 'Peanut allergy',
      monthlyFee: 90.00,
      academyId
    },
    {
      name: 'James Wilson',
      dateOfBirth: new Date('2010-09-18'),
      guardianName: 'Elizabeth Wilson',
      contactNumber: '555-1005',
      medicalNotes: null,
      monthlyFee: 80.00,
      academyId
    },
    {
      name: 'Olivia Martinez',
      dateOfBirth: new Date('2011-01-30'),
      guardianName: 'Daniel Martinez',
      contactNumber: '555-1006',
      medicalNotes: 'Wears glasses',
      monthlyFee: 85.00,
      academyId
    },
    {
      name: 'Alexander Taylor',
      dateOfBirth: new Date('2009-12-12'),
      guardianName: 'Sarah Taylor',
      contactNumber: '555-1007',
      medicalNotes: null,
      monthlyFee: 75.00,
      academyId
    },
    {
      name: 'Isabella Anderson',
      dateOfBirth: new Date('2012-06-25'),
      guardianName: 'Thomas Anderson',
      contactNumber: '555-1008',
      medicalNotes: 'Mild eczema',
      monthlyFee: 90.00,
      academyId
    },
    {
      name: 'Ethan White',
      dateOfBirth: new Date('2010-08-03'),
      guardianName: 'Jessica White',
      contactNumber: '555-1009',
      medicalNotes: null,
      monthlyFee: 80.00,
      academyId
    }
  ];
  
  // Insert students
  try {
    const result = await prisma.student.createMany({
      data: students,
      skipDuplicates: true
    });
    
    console.log(`Successfully added ${result.count} students to the database.`);
  } catch (error) {
    console.error('Error seeding students:', error);
  }
}

// Run the seeding function
seedStudents()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });