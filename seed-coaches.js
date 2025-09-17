const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Check if coaches already exist
  const existingCoaches = await prisma.coach.count();
  
  if (existingCoaches > 0) {
    console.log('Coaches already exist, skipping seeding');
    return;
  }

  // Create some initial coaches
  const coaches = [
    { 
      name: 'John Smith', 
      email: 'john.smith@example.com',
      phone: '555-0101',
      specialization: 'Tennis'
    },
    { 
      name: 'Sarah Johnson', 
      email: 'sarah.johnson@example.com',
      phone: '555-0102',
      specialization: 'Basketball'
    },
    { 
      name: 'Mike Davis', 
      email: 'mike.davis@example.com',
      phone: '555-0103',
      specialization: 'Soccer'
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