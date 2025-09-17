import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const period = searchParams.get('period') || 'month';
    const reportType = searchParams.get('type') || 'student';

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    if (reportType === 'student') {
      // Get student attendance statistics
      const whereClause: any = {
        session: {
          date: {
            gte: startDate,
            lte: now
          }
        }
      };

      if (classId && classId !== 'all') {
        whereClause.session.classId = parseInt(classId);
      }

      const attendanceRecords = await prisma.attendance.findMany({
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

      // Group by student and calculate statistics
      const studentStats = new Map();

      attendanceRecords.forEach(record => {
        const studentId = record.enrollment.student.id;
        const studentName = `${record.enrollment.student.firstName} ${record.enrollment.student.lastName}`;
        
        if (!studentStats.has(studentId)) {
          studentStats.set(studentId, {
            studentId,
            studentName,
            totalSessions: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            attendanceRate: 0
          });
        }

        const stats = studentStats.get(studentId);
        stats.totalSessions++;

        switch (record.status) {
          case 'PRESENT':
            stats.presentCount++;
            break;
          case 'LATE':
            stats.lateCount++;
            break;
          case 'ABSENT':
            stats.absentCount++;
            break;
        }

        // Calculate attendance rate (Present + Late considered as attended)
        stats.attendanceRate = ((stats.presentCount + stats.lateCount) / stats.totalSessions) * 100;
      });

      const studentStatsArray = Array.from(studentStats.values());
      
      return NextResponse.json({
        type: 'student',
        data: studentStatsArray,
        period,
        classId: classId || 'all'
      });

    } else if (reportType === 'class') {
      // Get class performance statistics
      const whereClause: any = {
        date: {
          gte: startDate,
          lte: now
        }
      };

      if (classId && classId !== 'all') {
        whereClause.classId = parseInt(classId);
      }

      const sessions = await prisma.classSession.findMany({
        where: whereClause,
        include: {
          class: {
            include: {
              students: true
            }
          },
          attendance: true
        }
      });

      // Group by class and calculate statistics
      const classStats = new Map();

      sessions.forEach(session => {
        const classId = session.class.id;
        const className = session.class.name;
        
        if (!classStats.has(classId)) {
          classStats.set(classId, {
            classId,
            className,
            totalStudents: session.class.students.length,
            totalSessions: 0,
            totalAttendanceRecords: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            averageAttendanceRate: 0
          });
        }

        const stats = classStats.get(classId);
        stats.totalSessions++;
        stats.totalAttendanceRecords += session.attendance.length;

        session.attendance.forEach(record => {
          switch (record.status) {
            case 'PRESENT':
              stats.presentCount++;
              break;
            case 'LATE':
              stats.lateCount++;
              break;
            case 'ABSENT':
              stats.absentCount++;
              break;
          }
        });

        // Calculate average attendance rate
        if (stats.totalAttendanceRecords > 0) {
          stats.averageAttendanceRate = ((stats.presentCount + stats.lateCount) / stats.totalAttendanceRecords) * 100;
        }
      });

      const classStatsArray = Array.from(classStats.values());
      
      return NextResponse.json({
        type: 'class',
        data: classStatsArray,
        period,
        classId: classId || 'all'
      });

    } else if (reportType === 'summary') {
      // Get overall summary statistics
      const whereClause: any = {
        session: {
          date: {
            gte: startDate,
            lte: now
          }
        }
      };

      if (classId && classId !== 'all') {
        whereClause.session.classId = parseInt(classId);
      }

      const totalAttendance = await prisma.attendance.count({
        where: whereClause
      });

      const presentCount = await prisma.attendance.count({
        where: {
          ...whereClause,
          status: 'PRESENT'
        }
      });

      const lateCount = await prisma.attendance.count({
        where: {
          ...whereClause,
          status: 'LATE'
        }
      });

      const absentCount = await prisma.attendance.count({
        where: {
          ...whereClause,
          status: 'ABSENT'
        }
      });

      const uniqueStudents = await prisma.attendance.findMany({
        where: whereClause,
        select: {
          enrollment: {
            select: {
              studentId: true
            }
          }
        },
        distinct: ['enrollmentId']
      });

      const totalSessions = await prisma.classSession.count({
        where: {
          date: {
            gte: startDate,
            lte: now
          },
          ...(classId && classId !== 'all' ? { classId: parseInt(classId) } : {})
        }
      });

      const overallAttendanceRate = totalAttendance > 0 ? ((presentCount + lateCount) / totalAttendance) * 100 : 0;

      return NextResponse.json({
        type: 'summary',
        data: {
          totalStudents: uniqueStudents.length,
          totalSessions,
          totalAttendanceRecords: totalAttendance,
          presentCount,
          lateCount,
          absentCount,
          overallAttendanceRate
        },
        period,
        classId: classId || 'all'
      });
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });

  } catch (error) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Generate and export attendance report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, period, format = 'csv' } = body;

    // This would generate a downloadable report
    // For now, we'll return the data that would be exported
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      period,
      classId: classId || 'all',
      format,
      downloadUrl: `/api/reports/attendance/download?period=${period}&classId=${classId}&format=${format}`
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Error generating report export:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}