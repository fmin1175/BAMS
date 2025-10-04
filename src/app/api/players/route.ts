import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/players - Get all players
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academyId = searchParams.get('academyId');
    
    let whereClause: any = {};
    
    // Filter by academy ID if provided (for Academy Admins)
    if (academyId) {
      whereClause.academyId = parseInt(academyId);
    }
    
    const players = await prisma.student.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// POST /api/players - Create a new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, dateOfBirth, guardianName, contactNumber, medicalNotes } = body;
    if (!name || !dateOfBirth || !guardianName || !contactNumber) {
      return NextResponse.json(
        { error: 'Name, date of birth, guardian name, and contact number are required' },
        { status: 400 }
      );
    }

    // Use academyId = 1 as default (in a real app, get this from the authenticated user's session)
    const academyId = 1;

    const player = await prisma.student.create({
      data: {
        name,
        dateOfBirth: new Date(dateOfBirth),
        guardianName,
        contactNumber,
        medicalNotes: medicalNotes || null,
        academyId,
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}