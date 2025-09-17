import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/students - Get all students with optional search
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
    
    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });

    // Transform the data to include calculated age and contact field
    const transformedStudents = students.map(student => {
      const birthDate = new Date(student.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return {
        ...student,
        age,
        contact: student.contactNumber
      };
    });

    return NextResponse.json(transformedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, dateOfBirth, guardianName, contactNumber } = body;
    if (!name || !dateOfBirth || !guardianName || !contactNumber) {
      return NextResponse.json(
        { error: 'Name, date of birth, guardian name, and contact number are required' },
        { status: 400 }
      );
    }

    // For now, we'll use academyId = 1 as a default
    // In a real application, this should come from the authenticated user's session
    const academyId = 1;

    const student = await prisma.student.create({
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        guardianName,
        contactNumber,
        medicalNotes: body.medicalNotes || null,
        academyId,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}