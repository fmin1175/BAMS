import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/players - Get all players
export async function GET() {
  try {
    const players = await prisma.player.findMany({
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
    const { name, age, contact } = body;
    if (!name || !age || !contact) {
      return NextResponse.json(
        { error: 'Name, age, and contact are required' },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: {
        name,
        age,
        contact,
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