import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// GET /api/classes - Get all classes with optional search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    let academyId = searchParams.get('academyId');
    
    // Get academy ID from cookies if not provided in query params
    if (!academyId) {
      const cookieStore = cookies();
      const token = cookieStore.get('auth_token')?.value;
      
      if (token) {
        try {
          // Verify and decode the JWT token
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
          const { payload } = await jwtVerify(token, secret);
          
          // Extract academyId from the token payload
          if (payload && typeof payload.academyId === 'number') {
            academyId = payload.academyId.toString();
          }
        } catch (error) {
          console.error('Error verifying token:', error);
        }
      }
    }
    
    let whereClause: any = {};
    
    // If search parameter exists, filter by name or ID
    if (search) {
      const searchId = parseInt(search);
      whereClause.OR = [
        { name: { contains: search } },
        ...(isNaN(searchId) ? [] : [{ id: searchId }])
      ];
    }
    
    // Filter by academy ID if provided
    if (academyId) {
      whereClause.academyId = parseInt(academyId);
    } else {
      // If no academyId is provided, default to System Academy (ID: 1)
      whereClause.academyId = 1;
    }
    
    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        coach: true,
        location: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST /api/classes - Create a new class with conflict validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, coachId, locationId, dayOfWeek, startTime, endTime } = body;
    if (!name || !coachId || !locationId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, coach, location, day of week, start time, and end time are required' },
        { status: 400 }
      );
    }
    
    // Get user ID from the request headers
    const userDataHeader = request.headers.get('x-user-data');
    let academyId: number | undefined;
    
    if (userDataHeader) {
      try {
        const userData = JSON.parse(userDataHeader);
        academyId = userData.academyId;
      } catch (error) {
        console.error('Error parsing user data header:', error);
      }
    }
    
    // If no academyId found in header, return error
    if (!academyId) {
      return NextResponse.json({ error: 'User not authenticated or no academy associated' }, { status: 401 });
    }

    // Parse times
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);
    
    // Validate times
    if (parsedEndTime <= parsedStartTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Check for coach conflicts
    const coachConflicts = await prisma.class.findMany({
      where: {
        coachId: parseInt(coachId),
        dayOfWeek: parseInt(dayOfWeek),
        OR: [
          {
            AND: [
              { startTime: { lte: parsedStartTime } },
              { endTime: { gt: parsedStartTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: parsedEndTime } },
              { endTime: { gte: parsedEndTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: parsedStartTime } },
              { endTime: { lte: parsedEndTime } }
            ]
          }
        ]
      }
    });

    if (coachConflicts.length > 0) {
      return NextResponse.json(
        { error: 'Coach is already booked during this time' },
        { status: 409 }
      );
    }

    // Location conflict check removed as per user request

    // Create the class if no conflicts
    const newClass = await prisma.class.create({
      data: {
        name,
        coachId: parseInt(coachId),
        locationId: parseInt(locationId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        isRecurring: body.isRecurring ?? true,
        academyId: academyId,
      },
      include: {
        coach: true,
        location: true,
      }
    });

    // Handle student enrollments if provided
    if (body.studentIds && Array.isArray(body.studentIds) && body.studentIds.length > 0) {
      // Create enrollment records for each student
      await Promise.all(body.studentIds.map(async (studentId: number) => {
        await prisma.classEnrollment.create({
          data: {
            classId: newClass.id,
            studentId: studentId,
            joinedAt: new Date()
          }
        });
      }));
    }

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}