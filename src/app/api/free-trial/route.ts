import { NextRequest, NextResponse } from 'next/server';
import { generatePassword } from '@/lib/utils';
// Use bcryptjs for serverless-compatible password hashing
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendTrialRequestConfirmation } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing free trial request');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { name, email, phone, academyName, studentsCount } = body;
    
    // Validate required fields
    if (!name || !email || !phone || !academyName || !studentsCount) {
      console.error('Missing required fields:', { name, email, phone, academyName, studentsCount });
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    console.log('Request data:', { name, email, phone, academyName, studentsCount });
    // Ensure studentsCount matches schema type (String)
    const studentsCountStr = typeof studentsCount === 'string' ? studentsCount : String(studentsCount);

    // Generate a secure password
    const password = generatePassword(12);
    // Hash the password for security
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      // Save to database using Prisma
      const newRequest = await prisma.freeTrialRequest.create({
        data: {
          name,
          email,
          phone,
          academyName,
          studentsCount: studentsCountStr,
          status: 'pending',
          password: hashedPassword
          // The expiry date is automatically set by the database default
        }
      });
      
      console.log('Free trial request saved successfully to database');

      // Send confirmation email to the requester
      try {
        await sendTrialRequestConfirmation(email, name, academyName);
        console.log(`Confirmation email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Continue with the response even if email fails
      }
      
      console.log(`New free trial created for ${academyName}`);
      console.log(`Login credentials: ${email} / ${password}`);
      
      return NextResponse.json(
        { success: true, message: 'Free trial request submitted successfully' },
        { status: 201 }
      );
    } catch (dbError: any) {
      // Check if this is a unique constraint error (email already exists)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      
      throw dbError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error processing free trial request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}