import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePassword } from '@/lib/utils';
import bcrypt from 'bcryptjs';

// GET /api/coaches - Get all coaches with optional search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const academyId = searchParams.get('academyId');
    
    let whereClause: any = {};
    
    // If search parameter exists, filter by name or ID
    if (search) {
      const searchId = parseInt(search);
      whereClause.OR = [
        { name: { contains: search } },
        ...(isNaN(searchId) ? [] : [{ id: searchId }])
      ];
    }
    
    // Filter by academy ID if provided (for Academy Admins)
    if (academyId) {
      whereClause.academyId = parseInt(academyId);
    }
    
    const coaches = await prisma.coach.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
}

// POST /api/coaches - Create a new coach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
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
    
    // Get academy's default coach password
    const academy = await prisma.academy.findUnique({
      where: { id: academyId }
    });
    
    if (!academy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    // Use academy's default coach password
    const password = academy.defaultCoachPassword;
    // Hash the password for security
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Safely parse numeric values
    let hourlyRate = 0;
    let sessionRate = 0;
    let monthlySalary = 0;
    
    try {
      hourlyRate = body.hourlyRate !== undefined && body.hourlyRate !== null ? 
        parseFloat(String(body.hourlyRate)) : 0;
    } catch (e) {
      console.error("Error parsing hourlyRate:", e);
    }
    
    try {
      sessionRate = body.sessionRate !== undefined && body.sessionRate !== null ? 
        parseFloat(String(body.sessionRate)) : 0;
    } catch (e) {
      console.error("Error parsing sessionRate:", e);
    }
    
    try {
      monthlySalary = body.monthlySalary !== undefined && body.monthlySalary !== null ? 
        parseFloat(String(body.monthlySalary)) : 0;
    } catch (e) {
      console.error("Error parsing monthlySalary:", e);
    }

    // Create the coach record with default values for numeric fields
    const coach = await prisma.coach.create({
      data: {
        name: body.name || '',
        hourlyRate,
        sessionRate,
        paymentType: body.paymentType || 'HOURLY',
        paymentFrequency: body.paymentFrequency || 'WEEKLY',
        monthlySalary,
        payoutMethod: body.payoutMethod || 'CASH',
        bankDetails: body.bankDetails || '',
        contactNumber: body.contactNumber || '',
        email: body.email || '',
        academyId,
      },
    });

    // Create a user account with COACH role
    const nameParts = (body.name || '').split(' ');
    const firstName = nameParts.length > 0 ? nameParts[0] : '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const email = body.email || `coach${coach.id}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Store the hashed password
        firstName,
        lastName,
        role: 'COACH',
        academyId,
      }
    });

    // In a real application, send an email with the password
    console.log(`New coach user created: ${body.email} / ${password}`);
    
    return NextResponse.json({
      ...coach,
      userCreated: true,
      password // Only return password in development
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating coach:', error);
    // Return more detailed error message
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create coach' },
      { status: 500 }
    );
  }
}