import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { getWeekDates } from '@/lib/date-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('Coach reports API called with params:', request.nextUrl.searchParams.toString());
    
    // Get user data from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      console.log('No auth token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user;
    try {
      // Verify and decode the JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(token, secret);
      user = payload;
      console.log('User authenticated:', { userId: user.id, role: user.role });
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has required role
    if (!user || !['SYSTEM_ADMIN', 'ACADEMY_ADMIN', 'COACH'].includes(user.role as string)) {
      console.log('Insufficient permissions for user:', user?.role);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const weekNumber = searchParams.get('week');
    const coachId = searchParams.get('coachId');
    
    console.log('Query params:', { weekNumber, coachId });
    
    if (!weekNumber) {
      console.log('Week number missing');
      return NextResponse.json({ error: 'Week number is required' }, { status: 400 });
    }

    // Get date range for the selected week
    // Use 2025 since that's where the session data is
    const currentYear = 2025;
    const { startDate, endDate } = getWeekDates(currentYear, parseInt(weekNumber));
    
    console.log('Date range:', { startDate, endDate, currentYear, weekNumber });

    // Build query filters
    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Add coach filter if specified
    if (coachId) {
      whereClause.class = {
        coachId: parseInt(coachId),
      };
    }
    
    console.log('Where clause:', JSON.stringify(whereClause, null, 2));

    // Get all sessions for the week with coach information
    const sessions = await prisma.classSession.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            coach: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
    
    console.log(`Found ${sessions.length} sessions`);
    if (sessions.length > 0) {
      console.log('Sample session:', JSON.stringify(sessions[0], null, 2));
    }

    // Group sessions by coach and calculate totals
    const coachReports = sessions.reduce((reports: any, session: any) => {
      const coachId = session.class.coachId;
      const coach = session.class.coach;
      
      // Calculate session duration in hours
      // Handle the case where startTime and endTime are Date objects or strings
      let startTime, endTime;
      
      if (session.startTime instanceof Date) {
        startTime = session.startTime;
      } else {
        // If it's a string, try to parse it as a time
        const timeStr = session.startTime.toString();
        if (timeStr.includes('T')) {
          // It's already a full datetime string
          startTime = new Date(timeStr);
        } else {
          // It's just a time string, add a date
          startTime = new Date(`1970-01-01T${timeStr}`);
        }
      }
      
      if (session.endTime instanceof Date) {
        endTime = session.endTime;
      } else {
        // If it's a string, try to parse it as a time
        const timeStr = session.endTime.toString();
        if (timeStr.includes('T')) {
          // It's already a full datetime string
          endTime = new Date(timeStr);
        } else {
          // It's just a time string, add a date
          endTime = new Date(`1970-01-01T${timeStr}`);
        }
      }
      
      // Handle case where end time is before start time (crosses midnight)
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }
      
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Find or create coach report
      let coachReport = reports.find((r: any) => r.coachId === coachId);
      
      if (!coachReport) {
        coachReport = {
          coachId: coachId,
          coachName: coach.name,
          paymentType: coach.paymentType,
          rate: coach.paymentType === 'HOURLY' ? coach.hourlyRate : coach.sessionRate,
          totalSessions: 0,
          totalHours: 0,
          paymentAmount: 0,
          sessions: [],
        };
        reports.push(coachReport);
      }
      
      // Update coach report totals
      coachReport.totalSessions += 1;
      coachReport.totalHours += durationHours;
      
      // Calculate payment based on payment type
      const sessionPayment = coach.paymentType === 'HOURLY' 
        ? durationHours * coach.hourlyRate 
        : coach.sessionRate;
      
      coachReport.paymentAmount += sessionPayment;
      
      // Add session details
      coachReport.sessions.push({
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        className: session.class.name,
        duration: durationHours,
        payment: sessionPayment,
      });
      
      return reports;
    }, []);
    
    console.log(`Generated ${coachReports.length} coach reports`);
    console.log('Coach reports:', JSON.stringify(coachReports, null, 2));

    return NextResponse.json(coachReports);
  } catch (error) {
    console.error('Error generating coach report:', error);
    return NextResponse.json({ error: 'Failed to generate coach report' }, { status: 500 });
  }
}