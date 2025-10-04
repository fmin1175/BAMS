const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if there are any free trial requests
    const existingRequests = await prisma.freeTrialRequest.findMany();
    console.log(`Found ${existingRequests.length} existing free trial requests`);

    // If no requests exist, create some sample ones
    if (existingRequests.length === 0) {
      console.log('Creating sample free trial requests...');
      
      const sampleRequests = [
        {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '555-123-4567',
          academyName: 'Smith Badminton Academy',
          studentsCount: '25',
          status: 'pending'
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '555-987-6543',
          academyName: 'Johnson Training Center',
          studentsCount: '40',
          status: 'approved'
        },
        {
          name: 'Michael Wong',
          email: 'mwong@example.com',
          phone: '555-456-7890',
          academyName: 'Wong Badminton School',
          studentsCount: '15',
          status: 'rejected'
        }
      ];

      for (const request of sampleRequests) {
        await prisma.freeTrialRequest.create({
          data: request
        });
      }

      console.log('Successfully created sample free trial requests');
    }

    // Verify the requests now
    const allRequests = await prisma.freeTrialRequest.findMany();
    console.log('Current free trial requests:');
    console.log(JSON.stringify(allRequests, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();