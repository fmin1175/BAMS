const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Check if coaches already exist
  const existingCoaches = await prisma.coach.count();
  
  if (existingCoaches > 0) {
    console.log('Coaches already exist, skipping seeding');
    return;
  }

  // First, create or get an academy
  let academy = await prisma.academy.findFirst();
  if (!academy) {
    academy = await prisma.academy.create({
      data: {
        name: 'Elite Badminton Academy',
        description: 'Premier badminton training facility in Singapore',
        email: 'info@elitebadminton.sg',
        phone: '65-6123-4567',
        website: 'https://elitebadminton.sg'
      }
    });
  }

  // Create some initial coaches
  const coaches = [
    { 
      name: 'John Smith', 
      email: 'john.smith@example.com',
      contactNumber: '555-0101',
      hourlyRate: 50.0,
      payoutMethod: 'bank_transfer',
      academyId: academy.id
    },
    { 
      name: 'Sarah Johnson', 
      email: 'sarah.johnson@example.com',
      contactNumber: '555-0102',
      hourlyRate: 45.0,
      payoutMethod: 'bank_transfer',
      academyId: academy.id
    },
    { 
      name: 'Mike Davis', 
      email: 'mike.davis@example.com',
      contactNumber: '555-0103',
      hourlyRate: 55.0,
      payoutMethod: 'check',
      academyId: academy.id
    }
  ];

  for (const coach of coaches) {
    await prisma.coach.create({
      data: coach
    });
  }

  console.log('Coaches seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });