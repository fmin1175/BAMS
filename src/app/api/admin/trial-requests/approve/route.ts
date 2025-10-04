import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTrialRequestApprovalEmail } from '@/lib/email';
import { generatePassword } from '@/lib/utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { id } = body;
    
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
    
    if (trialRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Trial request is already ${trialRequest.status}` },
        { status: 400 }
      );
    }
    
    // Check if an academy with this email already exists
    const existingAcademy = await prisma.academy.findUnique({
      where: { email: trialRequest.email }
    });
    
    if (existingAcademy) {
      return NextResponse.json(
        { error: 'An academy with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create a new academy with default coach password
    const academy = await prisma.academy.create({
      data: {
        name: trialRequest.academyName,
        email: trialRequest.email,
        phone: trialRequest.phone,
        subscriptionPlan: 'Trial',
        defaultCoachPassword: 'coach'
      }
    });
    
    // Generate a new plain text password
    const plainPassword = generatePassword(12);
    // Hash the password for database storage
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    
    // Create a new user with Academy Admin role
    const user = await prisma.user.create({
      data: {
        email: trialRequest.email,
        password: hashedPassword, // Store the hashed password
        firstName: trialRequest.name.split(' ')[0],
        lastName: trialRequest.name.split(' ').slice(1).join(' ') || '',
        role: 'ACADEMY_ADMIN',
        academyId: academy.id
      }
    });
    
    // Calculate expiry date (90 days from approval date)
    const approvalDate = new Date();
    const expiryDate = new Date(approvalDate);
    expiryDate.setDate(expiryDate.getDate() + 90);
    
    // Update the trial request status and link it to the academy
    const updatedRequest = await prisma.freeTrialRequest.update({
      where: { id: trialRequest.id },
      data: {
        status: 'approved',
        academyId: academy.id,
        approvalDate: approvalDate,
        expiry: expiryDate
      }
    });
    
    // Send approval email with login credentials
    try {
      await sendTrialRequestApprovalEmail(
        trialRequest.email,
        trialRequest.name,
        trialRequest.academyName,
        plainPassword // Send the plain text password
      );
      console.log(`Approval email sent to ${trialRequest.email}`);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Continue with the response even if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Trial request approved successfully',
      data: {
        trialRequest: updatedRequest,
        academy,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error('Error approving trial request:', error);
    return NextResponse.json(
      { error: 'An error occurred while approving the trial request' },
      { status: 500 }
    );
  }
}