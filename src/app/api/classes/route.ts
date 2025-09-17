import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/classes - Get all classes with optional search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let whereClause = {};
    
    // If search parameter exists, filter by name or ID
    if (search) {
      const searchId = parseInt(search);
      whereClause = {
        OR: [
          { name: { contains: search } },
          ...(isNaN(searchId) ? [] : [{ id: searchId }])
        ]
      };
    }
    
    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        coach: true,
        court: true,
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
    const { name, coachId, courtId, dayOfWeek, startTime, endTime } = body;
    if (!name || !coachId || !courtId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, coach, court, day of week, start time, and end time are required' },
        { status: 400 }
      );
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

    // Check for court conflicts
    const courtConflicts = await prisma.class.findMany({
      where: {
        courtId: parseInt(courtId),
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

    if (courtConflicts.length > 0) {
      return NextResponse.json(
        { error: 'Court is already booked during this time' },
        { status: 409 }
      );
    }

    // Create the class if no conflicts
    const newClass = await prisma.class.create({
      data: {
        name,
        coachId: parseInt(coachId),
        courtId: parseInt(courtId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        isRecurring: body.isRecurring ?? true,
      },
      include: {
        coach: true,
        court: true,
      }
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}