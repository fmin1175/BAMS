import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/classes/[id] - Get a specific class
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        coach: true,
        students: {
          include: {
            student: true
          }
        }
      }
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

// PUT /api/classes/[id] - Update a class with conflict validation
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { name, coachId, locationId, dayOfWeek, startTime, endTime } = body;
    if (!name || !coachId || !locationId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, coach, location, day of week, start time, and end time are required' },
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

    // Check for coach conflicts (excluding this class)
    const coachConflicts = await prisma.class.findMany({
      where: {
        id: { not: id },
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

    // Update the class if no conflicts
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        coachId: parseInt(coachId),
        locationId: parseInt(locationId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        isRecurring: body.isRecurring ?? true,
      },
      include: {
        coach: true,
        location: true,
        students: true
      }
    });

    // Handle student enrollments if provided
    if (body.studentIds && Array.isArray(body.studentIds)) {
      // First, delete all existing enrollments for this class
      await prisma.classEnrollment.deleteMany({
        where: { classId: id }
      });
      
      // Then create new enrollments for each student in the list
      if (body.studentIds.length > 0) {
        await Promise.all(body.studentIds.map(async (studentId: number) => {
          await prisma.classEnrollment.create({
            data: {
              classId: id,
              studentId: studentId,
              joinedAt: new Date()
            }
          });
        }));
      }
    }

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id] - Delete a class
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user data from headers for authentication
    const userDataHeader = request.headers.get('x-user-data');
    if (!userDataHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse user data
    let userData;
    try {
      userData = JSON.parse(userDataHeader);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 400 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}