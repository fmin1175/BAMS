import { NextRequest, NextResponse } from 'next/server';
import { generateClassSessions, generateAttendanceForSession } from '@/lib/classSessionGenerator';

// POST - Generate class sessions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, weeksAhead = 4, action = 'generate' } = body;

    if (action === 'generate') {
      const result = await generateClassSessions(classId, { weeksAhead });
      
      return NextResponse.json({
        success: true,
        message: `Generated ${result.generatedCount} class sessions`,
        data: result
      });
    }

    if (action === 'generateAttendance') {
      const { sessionId } = body;
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session ID is required for attendance generation' },
          { status: 400 }
        );
      }

      const result = await generateAttendanceForSession(sessionId);
      
      return NextResponse.json({
        success: true,
        message: result.message || `Generated ${result.generatedCount} attendance records`,
        data: result
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "generate" or "generateAttendance"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in class sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get class sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const whereClause: any = {
      classId: parseInt(classId)
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const sessions = await prisma.classSession.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
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
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: sessions
    });

  } catch (error) {
    console.error('Error fetching class sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}