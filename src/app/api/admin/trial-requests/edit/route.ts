import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { id, name, email, phone, academyName, studentsCount, status, expiry } = body;
    
    console.log('Received expiry:', expiry, 'Type:', typeof expiry);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Trial request ID is required' },
        { status: 400 }
      );
    }
    
    // Find the trial request
    const trialRequest = await prisma.freeTrialRequest.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!trialRequest) {
      return NextResponse.json(
        { error: 'Trial request not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (academyName) updateData.academyName = academyName;
    if (studentsCount) updateData.studentsCount = studentsCount;
    if (status) updateData.status = status;
    
    // Handle expiry date - set to null if empty, otherwise convert to Date
    if (expiry === null || expiry === undefined || expiry === '') {
      updateData.expiry = null;
    } else {
      try {
        updateData.expiry = new Date(expiry);
        if (isNaN(updateData.expiry.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        console.error('Invalid date format for expiry:', expiry);
        return NextResponse.json(
          { error: 'Invalid date format for expiry' },
          { status: 400 }
        );
      }
    }
    
    // Update the trial request
    const updatedRequest = await prisma.freeTrialRequest.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    return NextResponse.json({
      success: true,
      message: 'Trial request updated successfully',
      data: updatedRequest
    });
    
  } catch (error) {
    console.error('Error updating trial request:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the trial request' },
      { status: 500 }
    );
  }
}