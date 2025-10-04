const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    const attendanceCount = await prisma.attendance.count();
    console.log('Attendance records:', attendanceCount);
    
    const sessionCount = await prisma.classSession.count();
    console.log('Class sessions:', sessionCount);
    
    const enrollmentCount = await prisma.classEnrollment.count();
    console.log('Enrollments:', enrollmentCount);
    
    const studentCount = await prisma.student.count();
    console.log('Students:', studentCount);
    
    const classCount = await prisma.class.count();
    console.log('Classes:', classCount);
    
    // Check if we have any recent attendance data
    const recentAttendance = await prisma.attendance.findMany({
      take: 5,
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
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    console.log('\nRecent attendance records:');
    recentAttendance.forEach(record => {
      console.log(`- ${record.enrollment.student.name} in ${record.session.class.name}: ${record.status}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();