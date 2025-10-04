import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Get the ID from the URL or request body
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const deleteAcademy = url.searchParams.get('deleteAcademy') === 'true';
    
    // If ID is not in URL, try to get it from request body
    let requestId = id;
    if (!requestId) {
      const body = await request.json();
      requestId = body.id;
    }
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Trial request ID is required' },
        { status: 400 }
      );
    }
    
    // Find the trial request
    const trialRequest = await prisma.freeTrialRequest.findUnique({
      where: { id: parseInt(requestId) }
    });
    
    if (!trialRequest) {
      return NextResponse.json(
        { error: 'Trial request not found' },
        { status: 404 }
      );
    }
    
    // If deleteAcademy is true, check if academy exists and delete it
    if (deleteAcademy) {
      const academy = await prisma.academy.findUnique({
        where: { email: trialRequest.email }
      });
      
      if (academy) {
        // Delete associated users first to avoid foreign key constraints
        await prisma.user.deleteMany({
          where: { academyId: academy.id }
        });
        
        // Delete the academy
        await prisma.academy.delete({
          where: { id: academy.id }
        });
      }
    }
    
    // Delete the trial request
    await prisma.freeTrialRequest.delete({
      where: { id: parseInt(requestId) }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Trial request deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting trial request:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the trial request' },
      { status: 500 }
    );
  }
}