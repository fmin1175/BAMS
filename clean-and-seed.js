const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Cleaning existing data...');
  
  // Delete in order to respect foreign key constraints
  await prisma.attendance.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.court.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();
  await prisma.academy.deleteMany();
  
  console.log('✅ Database cleaned successfully');
}

async function seedDatabase() {
  console.log('🌱 Seeding dummy data...');

  // Create Academy
  const academy = await prisma.academy.create({
    data: {
      name: 'Elite Badminton Academy',
      description: 'Premier badminton training facility for all skill levels',
      email: 'info@elitebadminton.com',
      phone: '+1-555-0123',
      website: 'https://elitebadminton.com',
      headCoach: 'Sarah Johnson',
      headCoachEmail: 'sarah@elitebadminton.com',
      headCoachPhone: '+1-555-0124',
      subscriptionPlan: 'Professional',
      maxStudents: 200,
      maxCoaches: 15,
      isActive: true
    }
  });

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@elitebadminton.com',
        password: 'admin123', // In production, this should be hashed
        firstName: 'John',
        lastName: 'Admin',
        role: 'admin',
        academyId: academy.id
      }
    }),
    prisma.user.create({
      data: {
        email: 'manager@elitebadminton.com',
        password: 'manager123',
        firstName: 'Lisa',
        lastName: 'Manager',
        role: 'manager',
        academyId: academy.id
      }
    })
  ]);

  // Create Locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Main Training Center',
        address: '123 Sports Complex Ave, City Center',
        courts: 8,
        facilities: JSON.stringify(['Parking', 'Locker Rooms', 'Pro Shop', 'Cafeteria']),
        academyId: academy.id
      }
    }),
    prisma.location.create({
      data: {
        name: 'Youth Training Facility',
        address: '456 Youth Sports Blvd, Suburb',
        courts: 4,
        facilities: JSON.stringify(['Parking', 'Locker Rooms', 'Snack Bar']),
        academyId: academy.id
      }
    })
  ]);

  // Create Courts
  const courts = await Promise.all([
    prisma.court.create({
      data: {
        name: 'Court 1 - Championship',
        location: 'Main Training Center - Court 1',
        academyId: academy.id
      }
    }),
    prisma.court.create({
      data: {
        name: 'Court 2 - Training',
        location: 'Main Training Center - Court 2',
        academyId: academy.id
      }
    }),
    prisma.court.create({
      data: {
        name: 'Court 3 - Training',
        location: 'Main Training Center - Court 3',
        academyId: academy.id
      }
    }),
    prisma.court.create({
      data: {
        name: 'Youth Court 1',
        location: 'Youth Training Facility - Court 1',
        academyId: academy.id
      }
    }),
    prisma.court.create({
      data: {
        name: 'Youth Court 2',
        location: 'Youth Training Facility - Court 2',
        academyId: academy.id
      }
    })
  ]);

  // Create Coaches
  const coaches = await Promise.all([
    prisma.coach.create({
      data: {
        name: 'Sarah Johnson',
        hourlyRate: 75.00,
        payoutMethod: 'bank_transfer',
        bankDetails: 'Bank of America - ****1234',
        contactNumber: '+1-555-0124',
        email: 'sarah@elitebadminton.com',
        academyId: academy.id
      }
    }),
    prisma.coach.create({
      data: {
        name: 'Mike Chen',
        hourlyRate: 65.00,
        payoutMethod: 'bank_transfer',
        bankDetails: 'Chase Bank - ****5678',
        contactNumber: '+1-555-0125',
        email: 'mike@elitebadminton.com',
        academyId: academy.id
      }
    }),
    prisma.coach.create({
      data: {
        name: 'Emma Rodriguez',
        hourlyRate: 60.00,
        payoutMethod: 'check',
        bankDetails: null,
        contactNumber: '+1-555-0126',
        email: 'emma@elitebadminton.com',
        academyId: academy.id
      }
    }),
    prisma.coach.create({
      data: {
        name: 'David Kim',
        hourlyRate: 70.00,
        payoutMethod: 'bank_transfer',
        bankDetails: 'Wells Fargo - ****9012',
        contactNumber: '+1-555-0127',
        email: 'david@elitebadminton.com',
        academyId: academy.id
      }
    })
  ]);

  // Create Students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        name: 'Alex Thompson',
        dateOfBirth: new Date('2010-03-15'),
        guardianName: 'Robert Thompson',
        contactNumber: '+1-555-1001',
        medicalNotes: 'No known allergies',
        academyId: academy.id
      }
    }),
    prisma.student.create({
      data: {
        name: 'Sophie Williams',
        dateOfBirth: new Date('2009-07-22'),
        guardianName: 'Jennifer Williams',
        contactNumber: '+1-555-1002',
        medicalNotes: 'Asthma - carries inhaler',
        academyId: academy.id
      }
    }),
    prisma.student.create({
      data: {
        name: 'Ryan Martinez',
        dateOfBirth: new Date('2011-11-08'),
        guardianName: 'Carlos Martinez',
        contactNumber: '+1-555-1003',
        medicalNotes: null,
        academyId: academy.id
      }
    }),
    prisma.student.create({
      data: {
        name: 'Lily Zhang',
        dateOfBirth: new Date('2008-05-30'),
        guardianName: 'Wei Zhang',
        contactNumber: '+1-555-1004',
        medicalNotes: 'Previous ankle injury - cleared for play',
        academyId: academy.id
      }
    }),
    prisma.student.create({
      data: {
        name: 'Ethan Brown',
        dateOfBirth: new Date('2012-01-12'),
        guardianName: 'Michelle Brown',
        contactNumber: '+1-555-1005',
        medicalNotes: null,
        academyId: academy.id
      }
    }),
    prisma.student.create({
      data: {
        name: 'Zoe Davis',
        dateOfBirth: new Date('2010-09-18'),
        guardianName: 'Mark Davis',
        contactNumber: '+1-555-1006',
        medicalNotes: 'Food allergies - nuts',
        academyId: academy.id
      }
    }),
    prisma.student.create({
      data: {
        name: 'Noah Wilson',
        dateOfBirth: new Date('2009-12-03'),
        guardianName: 'Sarah Wilson',
        contactNumber: '+1-555-1007',
        medicalNotes: null,
        academyId: academy.id
      }
    }),
    prisma.student.create({
      data: {
        name: 'Mia Garcia',
        dateOfBirth: new Date('2011-04-25'),
        guardianName: 'Ana Garcia',
        contactNumber: '+1-555-1008',
        medicalNotes: 'Wears glasses',
        academyId: academy.id
      }
    })
  ]);

  // Create Classes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: 'Beginner Youth (Ages 8-12)',
        coachId: coaches[2].id, // Emma Rodriguez
        courtId: courts[3].id, // Youth Court 1
        dayOfWeek: 1, // Monday
        startTime: new Date('2024-01-01T16:00:00Z'),
        endTime: new Date('2024-01-01T17:00:00Z'),
        isRecurring: true
      }
    }),
    prisma.class.create({
      data: {
        name: 'Intermediate Youth (Ages 10-14)',
        coachId: coaches[1].id, // Mike Chen
        courtId: courts[1].id, // Court 2
        dayOfWeek: 2, // Tuesday
        startTime: new Date('2024-01-01T17:00:00Z'),
        endTime: new Date('2024-01-01T18:30:00Z'),
        isRecurring: true
      }
    }),
    prisma.class.create({
      data: {
        name: 'Advanced Youth (Ages 12-16)',
        coachId: coaches[0].id, // Sarah Johnson
        courtId: courts[0].id, // Championship Court
        dayOfWeek: 3, // Wednesday
        startTime: new Date('2024-01-01T18:00:00Z'),
        endTime: new Date('2024-01-01T19:30:00Z'),
        isRecurring: true
      }
    }),
    prisma.class.create({
      data: {
        name: 'Weekend Warriors (All Ages)',
        coachId: coaches[3].id, // David Kim
        courtId: courts[2].id, // Court 3
        dayOfWeek: 6, // Saturday
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:30:00Z'),
        isRecurring: true
      }
    })
  ]);

  // Create Class Enrollments
  const enrollments = await Promise.all([
    // Beginner Youth class
    prisma.classEnrollment.create({
      data: {
        studentId: students[4].id, // Ethan Brown
        classId: classes[0].id
      }
    }),
    prisma.classEnrollment.create({
      data: {
        studentId: students[7].id, // Mia Garcia
        classId: classes[0].id
      }
    }),
    // Intermediate Youth class
    prisma.classEnrollment.create({
      data: {
        studentId: students[0].id, // Alex Thompson
        classId: classes[1].id
      }
    }),
    prisma.classEnrollment.create({
      data: {
        studentId: students[2].id, // Ryan Martinez
        classId: classes[1].id
      }
    }),
    prisma.classEnrollment.create({
      data: {
        studentId: students[5].id, // Zoe Davis
        classId: classes[1].id
      }
    }),
    // Advanced Youth class
    prisma.classEnrollment.create({
      data: {
        studentId: students[1].id, // Sophie Williams
        classId: classes[2].id
      }
    }),
    prisma.classEnrollment.create({
      data: {
        studentId: students[3].id, // Lily Zhang
        classId: classes[2].id
      }
    }),
    prisma.classEnrollment.create({
      data: {
        studentId: students[6].id, // Noah Wilson
        classId: classes[2].id
      }
    }),
    // Weekend Warriors
    prisma.classEnrollment.create({
      data: {
        studentId: students[1].id, // Sophie Williams (multi-class)
        classId: classes[3].id
      }
    }),
    prisma.classEnrollment.create({
      data: {
        studentId: students[3].id, // Lily Zhang (multi-class)
        classId: classes[3].id
      }
    })
  ]);

  // Create some Class Sessions (recent and upcoming)
  const sessions = [];
  const today = new Date();
  
  // Create sessions for the past 2 weeks and next 2 weeks
  for (let i = -14; i <= 14; i++) {
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() + i);
    
    // Create sessions based on class schedule
    for (const classItem of classes) {
      if (sessionDate.getDay() === classItem.dayOfWeek) {
        const session = await prisma.classSession.create({
          data: {
            classId: classItem.id,
            date: sessionDate,
            startTime: classItem.startTime,
            endTime: classItem.endTime,
            notes: i < 0 ? 'Session completed' : i === 0 ? 'Today\'s session' : null
          }
        });
        sessions.push(session);
      }
    }
  }

  // Create Attendance records for past sessions
  const pastSessions = sessions.filter(s => s.date < today);
  for (const session of pastSessions) {
    const classEnrollments = enrollments.filter(e => e.classId === session.classId);
    
    for (const enrollment of classEnrollments) {
      // Simulate realistic attendance (90% present, 5% late, 5% absent)
      const rand = Math.random();
      let status = 'PRESENT';
      if (rand < 0.05) status = 'ABSENT';
      else if (rand < 0.10) status = 'LATE';
      
      await prisma.attendance.create({
        data: {
          sessionId: session.id,
          enrollmentId: enrollment.id,
          status: status,
          remarks: status === 'ABSENT' ? 'Sick' : status === 'LATE' ? 'Traffic' : null,
          markedBy: 1, // Admin user
          notificationSent: status === 'ABSENT'
        }
      });
    }
  }

  // Create Coach Availability
  for (const coach of coaches) {
    // Create availability for the next 30 days
    for (let i = 0; i < 30; i++) {
      const availDate = new Date(today);
      availDate.setDate(today.getDate() + i);
      
      // Skip Sundays
      if (availDate.getDay() !== 0) {
        await prisma.availability.create({
          data: {
            coachId: coach.id,
            date: availDate,
            startTime: new Date(`${availDate.toISOString().split('T')[0]}T09:00:00Z`),
            endTime: new Date(`${availDate.toISOString().split('T')[0]}T18:00:00Z`),
            isAvailable: Math.random() > 0.1 // 90% available
          }
        });
      }
    }
  }

  console.log('✅ Dummy data seeded successfully');
  console.log(`📊 Created:
    - 1 Academy
    - 2 Users
    - 2 Locations
    - 5 Courts
    - 4 Coaches
    - 8 Students
    - 4 Classes
    - 10 Class Enrollments
    - ${sessions.length} Class Sessions
    - ${pastSessions.length * 3} Attendance Records (average)
    - ${coaches.length * 26} Coach Availability Records`);
}

async function main() {
  try {
    await cleanDatabase();
    await seedDatabase();
    console.log('🎉 Database reset and seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database reset and seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });