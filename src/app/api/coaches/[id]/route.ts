import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/coaches/[id] - Get a specific coach
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid coach ID' },
        { status: 400 }
      );
    }

    const coach = await prisma.coach.findUnique({
      where: { id },
      include: {
        availability: true,
        classes: true
      }
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error fetching coach:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach' },
      { status: 500 }
    );
  }
}

// PUT /api/coaches/[id] - Update a coach
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid coach ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { name, hourlyRate, payoutMethod, contactNumber } = body;
    if (!name || hourlyRate === undefined || !payoutMethod || !contactNumber) {
      return NextResponse.json(
        { error: 'Name, hourly rate, payout method, and contact number are required' },
        { status: 400 }
      );
    }

    const coach = await prisma.coach.update({
      where: { id },
      data: {
        name,
        hourlyRate: parseFloat(hourlyRate),
        payoutMethod,
        bankDetails: body.bankDetails || null,
        contactNumber,
        email: body.email || null,
      },
    });

    return NextResponse.json(coach);
  } catch (error) {
    console.error('Error updating coach:', error);
    return NextResponse.json(
      { error: 'Failed to update coach' },
      { status: 500 }
    );
  }
}

// DELETE /api/coaches/[id] - Delete a coach
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid coach ID' },
        { status: 400 }
      );
    }

    await prisma.coach.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    console.error('Error deleting coach:', error);
    return NextResponse.json(
      { error: 'Failed to delete coach' },
      { status: 500 }
    );
  }
}