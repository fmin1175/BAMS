import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/students - Get all students with optional search
export async function GET(request: NextRequest) {
  try {
    console.log('Students API called');
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    let academyId = searchParams.get('academyId');
    console.log('Search parameter:', search);
    console.log('Academy ID parameter:', academyId);
    
    let whereClause: any = {};
    
    // If search parameter exists, filter by name or ID
    if (search) {
      const searchId = parseInt(search);
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { guardianName: { contains: search, mode: 'insensitive' } },
        { contactNumber: { contains: search } },
        ...(isNaN(searchId) ? [] : [{ id: searchId }])
      ];
    }
    
    // Get academy ID from the request headers if not provided in query params
    if (!academyId) {
      const userDataHeader = request.headers.get('x-user-data');
      if (userDataHeader) {
        try {
          const userData = JSON.parse(userDataHeader);
          if (userData.academyId) {
            academyId = userData.academyId.toString();
          }
        } catch (error) {
          console.error('Error parsing user data header:', error);
        }
      }
    }
    
    // Always filter by academy ID for data isolation
    if (academyId) {
      whereClause.academyId = parseInt(academyId);
    } else {
      // If no academyId is found, only system admins should see all students
      // For other users, return empty result for security
      const userDataHeader = request.headers.get('x-user-data');
      if (userDataHeader) {
        try {
          const userData = JSON.parse(userDataHeader);
          if (userData.role !== 'SYSTEM_ADMIN') {
            console.log('Non-admin user without academyId tried to access students');
            return NextResponse.json([]);
          }
        } catch (error) {
          console.error('Error parsing user data header:', error);
          return NextResponse.json([]);
        }
      } else {
        console.log('No user data found, returning empty students list');
        return NextResponse.json([]);
      }
    }
    
    console.log('Where clause:', JSON.stringify(whereClause));
    console.log('About to query students...');
    
    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });

    console.log('Students found:', students.length);

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

    console.log('Returning transformed students');
    return NextResponse.json(transformedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      stack: error instanceof Error ? error.stack : undefined
    });
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
    const { name, dateOfBirth, guardianName, contactNumber, monthlyFee } = body;
    if (!name || !dateOfBirth || !guardianName || !contactNumber || (monthlyFee === undefined || monthlyFee === null)) {
      return NextResponse.json(
        { error: 'Name, date of birth, guardian name, contact number, and monthly fee are required' },
        { status: 400 }
      );
    }

    // Validate monthly fee is not negative
    if (parseFloat(monthlyFee) < 0) {
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

    const student = await prisma.student.create({
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        guardianName,
        contactNumber,
        monthlyFee: parseFloat(monthlyFee),
        medicalNotes: body.medicalNotes || null,
        academyId,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to create student', details: error.message },
      { status: 500 }
    );
  }
}