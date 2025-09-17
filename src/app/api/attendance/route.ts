import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch attendance for a specific class session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

    if (sessionId) {
      // Get attendance for a specific session
      const attendance = await prisma.attendance.findMany({
        where: { sessionId: parseInt(sessionId) },
        include: {
          enrollment: {
            include: {
              student: true
            }
          }
        }
      });

      return NextResponse.json(attendance);
    }

    if (classId && date) {
      // Get or create session for the class and date
      let session = await prisma.classSession.findFirst({
        where: {
          classId: parseInt(classId),
          date: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lt: new Date(date + 'T23:59:59.999Z')
          }
        },
        include: {
          class: {
            include: {
              students: {
                include: {
                  student: true
                }
              },
              coach: true,
              court: true
            }
          },
          attendance: {
            include: {
              enrollment: {
                include: {
                  student: true
                }
              }
            }
          }
        }
      });

      if (!session) {
        // Create a new session if it doesn't exist
        const classInfo = await prisma.class.findUnique({
          where: { id: parseInt(classId) },
          include: {
            students: {
              include: {
                student: true
              }
            },
            coach: true,
            court: true
          }
        });

        if (!classInfo) {
          return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        // Create session with proper date and time handling
        const sessionDate = new Date(date);
        const startTime = new Date(classInfo.startTime);
        const endTime = new Date(classInfo.endTime);
        
        sessionDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
        const sessionEndTime = new Date(sessionDate);
        sessionEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

        session = await prisma.classSession.create({
          data: {
            classId: parseInt(classId),
            date: sessionDate,
            startTime: sessionDate,
            endTime: sessionEndTime,
            notes: `Session created for ${classInfo.name} on ${date}`
          },
          include: {
            class: {
              include: {
                students: {
                  include: {
                    student: true
                  }
                },
                coach: true,
                court: true
              }
            },
            attendance: {
              include: {
                enrollment: {
                  include: {
                    student: true
                  }
                }
              }
            }
          }
        });

        // Auto-generate attendance records for all enrolled students
        const { generateAttendanceForSession } = await import('@/lib/classSessionGenerator');
        await generateAttendanceForSession(session.id);

        // Refetch session with attendance records
        session = await prisma.classSession.findUnique({
          where: { id: session.id },
          include: {
            class: {
              include: {
                students: {
                  include: {
                    student: true
                  }
                },
                coach: true,
                court: true
              }
            },
            attendance: {
              include: {
                enrollment: {
                  include: {
                    student: true
                  }
                }
              }
            }
          }
        });
      }

      return NextResponse.json(session);
    }

    // Get today's classes for the coach
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysClasses = await prisma.class.findMany({
      include: {
        students: {
          include: {
            student: true
          }
        },
        sessions: {
          where: {
            date: {
              gte: today,
              lt: tomorrow
            }
          },
          include: {
            attendance: {
              include: {
                enrollment: {
                  include: {
                    student: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(todaysClasses);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Mark attendance for students
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, attendance: attendanceData, markedBy } = body;

    if (!sessionId || !attendanceData || !Array.isArray(attendanceData)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Get the session to verify it exists
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            students: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Process attendance records
    const attendancePromises = attendanceData.map(async (record: any) => {
      const { studentId, status, remarks } = record;

      // Find the enrollment record
      const enrollment = await prisma.classEnrollment.findFirst({
        where: {
          studentId: studentId,
          classId: session.classId
        }
      });

      if (!enrollment) {
        throw new Error(`Enrollment not found for student ${studentId}`);
      }

      // Upsert attendance record
      return prisma.attendance.upsert({
        where: {
          sessionId_enrollmentId: {
            sessionId: sessionId,
            enrollmentId: enrollment.id
          }
        },
        update: {
          status: status,
          remarks: remarks || null,
          markedBy: markedBy || 1, // Default to user ID 1 for now
          updatedAt: new Date()
        },
        create: {
          sessionId: sessionId,
          enrollmentId: enrollment.id,
          status: status,
          remarks: remarks || null,
          markedBy: markedBy || 1, // Default to user ID 1 for now
        }
      });
    });

    const results = await Promise.all(attendancePromises);

    // Check for absent students and send notifications
    const absentStudents = results.filter(record => record.status === 'ABSENT');
    
    // Process notifications for absent students
    let notificationResults = null;
    if (absentStudents.length > 0) {
      // Import notification service dynamically to avoid circular dependencies
      const { processAttendanceNotifications } = await import('@/lib/notifications');
      notificationResults = await processAttendanceNotifications(sessionId);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Attendance saved successfully',
      recordsProcessed: results.length,
      absentCount: absentStudents.length,
      notifications: notificationResults
    });

  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update existing attendance record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { attendanceId, status, remarks } = body;

    if (!attendanceId) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: status,
        remarks: remarks || null,
        updatedAt: new Date()
      },
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      }
    });

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}