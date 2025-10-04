import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Fetching free trial requests from database');
    
    // Get all free trial requests from the database
    const freeTrialRequests = await prisma.freeTrialRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${freeTrialRequests.length} free trial requests`);
    
    return NextResponse.json(freeTrialRequests);
  } catch (error) {
    console.error('Error fetching free trial requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch free trial requests' },
      { status: 500 }
    );
  }
}