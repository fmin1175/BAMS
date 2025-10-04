import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    const academy = await prisma.academy.findUnique({
      where: { email },
      select: { id: true }
    });
    
    return NextResponse.json({
      exists: !!academy,
      academyId: academy?.id || null
    });
    
  } catch (error) {
    console.error('Error checking academy:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking for academy' },
      { status: 500 }
    );
  }
}