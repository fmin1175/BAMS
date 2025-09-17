const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Check if courts already exist
  const existingCourts = await prisma.court.count();
  
  if (existingCourts > 0) {
    console.log('Courts already exist, skipping seeding');
    return;
  }

  // Create some initial courts
  const courts = [
    { name: 'Court 1', location: 'Main Hall' },
    { name: 'Court 2', location: 'Main Hall' },
    { name: 'Court 3', location: 'Side Hall' },
    { name: 'Court 4', location: 'Side Hall' }
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