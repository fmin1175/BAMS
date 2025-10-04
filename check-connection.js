// Script to check database connection and list tables
const { PrismaClient } = require('@prisma/client');

async function checkDatabaseConnection() {
  console.log('Checking database connection...');
  console.log('DATABASE_URL from environment:', process.env.DATABASE_URL);
  
  const prisma = new PrismaClient();
  
  try {
    // Execute a raw query to get database connection info
    const connectionInfo = await prisma.$queryRaw`SELECT current_database(), current_user, inet_server_addr() AS server_address, inet_server_port() AS server_port`;
    console.log('\nDatabase Connection Information:');
    console.log(connectionInfo[0]);
    
    // List all tables in the database
    const tables = await prisma.$queryRaw`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `;
    
    console.log('\nTables in the database:');
    tables.forEach(table => {
      console.log(`${table.table_schema}.${table.table_name}`);
    });
    
    // Count records in Student table
    const studentCount = await prisma.student.count();
    console.log(`\nNumber of students in the database: ${studentCount}`);
    
    // Check if FreeTrialRequest table exists and count records
    try {
      const freeTrialCount = await prisma.freeTrialRequest.count();
      console.log(`Number of free trial requests in the database: ${freeTrialCount}`);
    } catch (error) {
      console.log('Error counting free trial requests:', error.message);
    }
    
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();