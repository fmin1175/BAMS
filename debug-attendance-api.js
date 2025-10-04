const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAttendanceAPI() {
  try {
    console.log('=== Debugging Attendance API ===\n');
    
    // Check raw attendance data
    const allAttendance = await prisma.attendance.findMany({
      include: {
        enrollment: {
          include: {
            student: true
          }
        },
        session: {
          include: {
            class: true
          }
        }
      }
    });
    
    console.log('Total attendance records:', allAttendance.length);
    console.log('\nAttendance records:');
    allAttendance.forEach((record, index) => {
      console.log(`${index + 1}. Session ID: ${record.sessionId}, Enrollment ID: ${record.enrollmentId}`);
      console.log(`   Student: ${record.enrollment?.student?.name || 'NULL'}`);
      console.log(`   Class: ${record.session?.class?.name || 'NULL'}`);
      console.log(`   Session Date: ${record.session?.date || 'NULL'}`);
      console.log(`   Status: ${record.status}`);
      console.log('');
    });
    
    // Check date filtering
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - 1);
    
    console.log(`Date range: ${startDate.toISOString()} to ${now.toISOString()}\n`);
    
    // Test the exact query from the API
    const whereClause = {
      session: {
        date: {
          gte: startDate,
          lte: now
        }
      }
    };
    
    const filteredRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        enrollment: {
          include: {
            student: true
          }
        },
        session: {
          include: {
            class: true
          }
        }
      }
    });
    
    console.log('Filtered attendance records (API query):', filteredRecords.length);
    
    // Check sessions in date range
    const sessionsInRange = await prisma.classSession.findMany({
      where: {
        date: {
          gte: startDate,
          lte: now
        }
      }
    });
    
    console.log('Sessions in date range:', sessionsInRange.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAttendanceAPI();