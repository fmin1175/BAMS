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
    const { name, payoutMethod, contactNumber, paymentFrequency, bankDetails, paymentType } = body;
    if (!name || !payoutMethod || !contactNumber || !paymentFrequency) {
      return NextResponse.json(
        { error: 'Name, payment frequency, payout method, and contact number are required' },
        { status: 400 }
      );
    }
    
    // Validate bank details for bank transfers
    if (payoutMethod === 'BANK_TRANSFER' && (!bankDetails || bankDetails.trim() === '')) {
      return NextResponse.json(
        { error: 'Bank details are required for bank transfers' },
        { status: 400 }
      );
    }

    // Validate payment frequency specific fields
    if (paymentFrequency === 'WEEKLY') {
      if (!paymentType) {
        return NextResponse.json(
          { error: 'Payment type is required for weekly payment frequency' },
          { status: 400 }
        );
      }

      // Validate payment type specific fields for weekly frequency
      if (paymentType === 'HOURLY' && (body.hourlyRate === undefined || body.hourlyRate === null)) {
        return NextResponse.json(
          { error: 'Hourly rate is required for hourly payment type' },
          { status: 400 }
        );
      }

      if (paymentType === 'PER_SESSION' && (body.sessionRate === undefined || body.sessionRate === null)) {
        return NextResponse.json(
          { error: 'Session rate is required for per-session payment type' },
          { status: 400 }
        );
      }
    } else if (paymentFrequency === 'MONTHLY' && (body.monthlySalary === undefined || body.monthlySalary === null)) {
      return NextResponse.json(
        { error: 'Monthly salary is required for monthly payment frequency' },
        { status: 400 }
      );
    }

    const coach = await prisma.coach.update({
      where: { id },
      data: {
        name,
        hourlyRate: paymentType === 'HOURLY' ? parseFloat(body.hourlyRate || 0) : 0,
        sessionRate: paymentType === 'PER_SESSION' ? parseFloat(body.sessionRate || 0) : 0,
        paymentType: paymentFrequency === 'WEEKLY' ? paymentType : 'HOURLY',
        paymentFrequency,
        monthlySalary: paymentFrequency === 'MONTHLY' ? parseFloat(body.monthlySalary || 0) : 0,
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
    
    // Get user data from header for authentication
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
    
    // Check if user has permission (system admin or academy admin)
    if (!userData.role || (userData.role !== 'SYSTEM_ADMIN' && userData.role !== 'ACADEMY_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Find the coach to verify it exists and belongs to the user's academy
    const coach = await prisma.coach.findUnique({
      where: { id }
    });
    
    if (!coach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }
    
    // For academy admins, verify they're deleting a coach from their academy
    if (userData.role === 'ACADEMY_ADMIN' && coach.academyId !== userData.academyId) {
      return NextResponse.json(
        { error: 'You can only delete coaches from your academy' },
        { status: 403 }
      );
    }

    // Delete the coach
    await prisma.coach.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Coach deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting coach:', error);
    
    // Check for foreign key constraint violation (coach assigned to classes)
    if (error.code === 'P2003' && error.meta?.constraint === 'Class_coachId_fkey') {
      return NextResponse.json(
        { error: 'Cannot delete this coach because they are assigned to one or more classes. Please remove the coach from all classes first.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete coach' },
      { status: 500 }
    );
  }
}