import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SessionGenerationOptions {
  startDate?: Date;
  endDate?: Date;
  weeksAhead?: number;
}

/**
 * Generate class sessions for recurring classes
 */
export async function generateClassSessions(
  classId?: number,
  options: SessionGenerationOptions = {}
) {
  try {
    const {
      startDate = new Date(),
      weeksAhead = 4, // Generate 4 weeks ahead by default
      endDate = new Date(Date.now() + weeksAhead * 7 * 24 * 60 * 60 * 1000)
    } = options;

    // Get classes to generate sessions for
    const whereClause = classId ? { id: classId } : { isRecurring: true };
    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        sessions: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            attendance: true
          }
        }
      }
    });

    const generatedSessions = [];
    const skippedSessions = [];

    for (const classItem of classes) {
      // Track existing sessions and those with attendance
      const existingSessions = new Map();
      classItem.sessions.forEach(session => {
        const dateKey = session.date.toISOString().split('T')[0];
        existingSessions.set(dateKey, {
          id: session.id,
          hasAttendance: session.attendance && session.attendance.length > 0
        });
      });

      // Generate sessions for each week
      const currentDate = new Date(startDate);
      currentDate.setHours(0, 0, 0, 0);

      while (currentDate <= endDate) {
        // Find the next occurrence of the class day
        const daysUntilClass = (classItem.dayOfWeek - currentDate.getDay() + 7) % 7;
        const sessionDate = new Date(currentDate);
        sessionDate.setDate(currentDate.getDate() + daysUntilClass);

        // Skip if session is in the past
        if (sessionDate < startDate) {
          currentDate.setDate(currentDate.getDate() + 7); // Move to next week
          continue;
        }

        // Check if session already exists for this date
        const sessionDateString = sessionDate.toISOString().split('T')[0];
        const existingSession = existingSessions.get(sessionDateString);
        
        if (existingSession) {
          if (existingSession.hasAttendance) {
            // Skip sessions that already have attendance records
            skippedSessions.push({
              date: sessionDateString,
              reason: 'attendance_exists'
            });
          } else {
            // Delete existing session without attendance so we can recreate it
            console.log(`Deleting existing session without attendance for ${sessionDateString}`);
            await prisma.classSession.delete({
              where: { id: existingSession.id }
            });
          }
        }
        
        // Create new session if we're within date range and either no existing session or we deleted one without attendance
        if (sessionDate >= startDate && sessionDate <= endDate && 
            (!existingSession || (existingSession && !existingSession.hasAttendance))) {
          
          // Create session date with proper time
          const sessionDateTime = new Date(sessionDate);
          const startTime = new Date(classItem.startTime);
          const endTime = new Date(classItem.endTime);
          
          // Set hours and minutes from the class's start and end times
          sessionDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
          const sessionEndTime = new Date(sessionDate);
          sessionEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

          const newSession = await prisma.classSession.create({
            data: {
              classId: classItem.id,
              date: sessionDateTime,
              startTime: sessionDateTime,
              endTime: sessionEndTime,
              notes: `Auto-generated session for ${classItem.name}`
            }
          });

          generatedSessions.push(newSession);
        }

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    return {
      success: true,
      generatedCount: generatedSessions.length,
      sessions: generatedSessions,
      skippedSessions: skippedSessions
    };

  } catch (error) {
    console.error('Error generating class sessions:', error);
    throw error;
  }
}

/**
 * Generate attendance records for a class session
 */
export async function generateAttendanceForSession(sessionId: number) {
  try {
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            students: {
              include: {
                student: true
              }
            }
          }
        },
        attendance: true
      }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Check if attendance records already exist
    if (session.attendance.length > 0) {
      return {
        success: true,
        message: 'Attendance records already exist for this session',
        existingCount: session.attendance.length
      };
    }

    // Create attendance records for all enrolled students
    const attendanceRecords = [];
    for (const enrollment of session.class.students) {
      const attendanceRecord = await prisma.attendance.create({
        data: {
          sessionId: sessionId,
          enrollmentId: enrollment.id,
          status: 'PRESENT', // Default to present, can be updated later
          markedBy: 1 // Default system user, should be updated when actually marked
        }
      });
      attendanceRecords.push(attendanceRecord);
    }

    return {
      success: true,
      generatedCount: attendanceRecords.length,
      records: attendanceRecords
    };

  } catch (error) {
    console.error('Error generating attendance records:', error);
    throw error;
  }
}

/**
 * Clean up old sessions (older than specified days)
 */
export async function cleanupOldSessions(daysOld: number = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedSessions = await prisma.classSession.deleteMany({
      where: {
        date: {
          lt: cutoffDate
        }
      }
    });

    return {
      success: true,
      deletedCount: deletedSessions.count
    };

  } catch (error) {
    console.error('Error cleaning up old sessions:', error);
    throw error;
  }
}