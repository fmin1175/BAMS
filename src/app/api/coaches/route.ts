import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/coaches - Get all coaches with optional search
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
    
    // Validate required fields
    const { name, hourlyRate, payoutMethod, contactNumber } = body;
    if (!name || hourlyRate === undefined || !payoutMethod || !contactNumber) {
      return NextResponse.json(
        { error: 'Name, hourly rate, payout method, and contact number are required' },
        { status: 400 }
      );
    }

    // For now, we'll use academyId = 1 as a default
    // In a real application, this should come from the authenticated user's session
    const academyId = 1;

    const coach = await prisma.coach.create({
      data: {
        name,
        hourlyRate: parseFloat(hourlyRate),
        payoutMethod,
        bankDetails: body.bankDetails || null,
        contactNumber,
        email: body.email || null,
        academyId,
      },
    });

    return NextResponse.json(coach, { status: 201 });
  } catch (error) {
    console.error('Error creating coach:', error);
    return NextResponse.json(
      { error: 'Failed to create coach' },
      { status: 500 }
    );
  }
}