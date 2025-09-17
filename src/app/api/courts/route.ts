import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/courts - Get all courts with optional search
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
          { name: { contains: search, mode: 'insensitive' } },
          ...(isNaN(searchId) ? [] : [{ id: searchId }])
        ]
      };
    }
    
    const courts = await prisma.court.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courts' },
      { status: 500 }
    );
  }
}

// POST /api/courts - Create a new court
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, location } = body;
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // For now, we'll use academyId = 1 as a default
    // In a real application, this should come from the authenticated user's session
    const academyId = 1;

    const court = await prisma.court.create({
      data: {
        name,
        location: location || null,
        academyId,
      },
    });

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    console.error('Error creating court:', error);
    return NextResponse.json(
      { error: 'Failed to create court' },
      { status: 500 }
    );
  }
}