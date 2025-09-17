const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Check if courts already exist
  const existingCourts = await prisma.court.count();
  
  if (existingCourts > 0) {
    console.log('Courts already exist, skipping seeding');
    return;
  }

  // Get the academy
  const academy = await prisma.academy.findFirst();
  if (!academy) {
    console.log('No academy found. Please run seed-coaches.js first.');
    return;
  }

  // Create some initial courts
  const courts = [
    { name: 'Court 1', location: 'Main Hall', academyId: academy.id },
    { name: 'Court 2', location: 'Main Hall', academyId: academy.id },
    { name: 'Court 3', location: 'Side Hall', academyId: academy.id },
    { name: 'Court 4', location: 'Side Hall', academyId: academy.id }
  ];

  for (const court of courts) {
    await prisma.court.create({
      data: court
    });
  }

  console.log('Courts seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });