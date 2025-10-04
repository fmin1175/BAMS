import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try a simple query to verify the connection works
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test Student table specifically
    const studentCount = await prisma.student.count();
    
    // Test Academy table (referenced by Student)
    const academyCount = await prisma.academy.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      status: 'Database connected successfully',
      timestamp: new Date().toISOString(),
      result,
      studentCount,
      academyCount,
      tables: 'Student and Academy tables accessible'
    });
  } catch (error: any) {
    console.error('Database connection failed:', error);
    
    return NextResponse.json({ 
      error: 'Database connection failed',
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}