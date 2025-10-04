import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/students/[id] - Get a specific student
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Get user's academy ID from the request headers
    const userDataHeader = request.headers.get('x-user-data');
    let academyId: number | undefined;
    let isSystemAdmin = false;
    
    if (userDataHeader) {
      try {
        const userData = JSON.parse(userDataHeader);
        academyId = userData.academyId;
        isSystemAdmin = userData.role === 'SYSTEM_ADMIN';
      } catch (error) {
        console.error('Error parsing user data header:', error);
      }
    }
    
    // If not system admin and no academyId, return error
    if (!isSystemAdmin && !academyId) {
      return NextResponse.json({ error: 'User not authenticated or no academy associated' }, { status: 401 });
    }

    // For non-system admins, ensure they can only access students from their academy
    const whereClause: any = { id };
    if (!isSystemAdmin) {
      whereClause.academyId = academyId;
    }

    const student = await prisma.student.findFirst({
      where: whereClause,
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or you do not have permission to view this student' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// PUT /api/students/[id] - Update a student
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { name, dateOfBirth, guardianName, contactNumber, monthlyFee } = body;
    if (!name || !dateOfBirth || !guardianName || !contactNumber || monthlyFee === undefined) {
      return NextResponse.json(
        { error: 'Name, date of birth, guardian name, contact number, and monthly fee are required' },
        { status: 400 }
      );
    }
    
    // Validate monthly fee is not negative
    if (monthlyFee < 0) {
      return NextResponse.json(
        { error: 'Monthly fee cannot be negative' },
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

    // Check if student exists and belongs to the user's academy
    const existingStudent = await prisma.student.findFirst({
      where: { 
        id,
        academyId 
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found or you do not have permission to update this student' },
        { status: 404 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        guardianName,
        contactNumber,
        monthlyFee: parseFloat(monthlyFee),
        medicalNotes: body.medicalNotes || null,
        academyId, // Ensure academyId is maintained
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
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

    // Check if student exists and belongs to the user's academy
    const existingStudent = await prisma.student.findFirst({
      where: { 
        id,
        academyId 
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found or you do not have permission to delete this student' },
        { status: 404 }
      );
    }

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}