import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // In a real app, we would check authentication here
    // For now, we'll allow access to this endpoint without authentication checks
    
    // Fetch all free trial requests
    const freeTrialRequests = await prisma.freeTrialRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Free trial requests fetched:', freeTrialRequests.length);
    
    return NextResponse.json({ freeTrialRequests });
  } catch (error) {
    console.error('Error fetching free trial requests:', error);
    return NextResponse.json({ error: 'Failed to fetch free trial requests', details: String(error) }, { status: 500 });
  }
}