import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all academies from the database
    const academies = await prisma.academy.findMany({
      include: {
        _count: {
          select: {
            students: true,
            coaches: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include counts
    const formattedAcademies = academies.map(academy => ({
      id: academy.id,
      name: academy.name,
      email: academy.email,
      phone: academy.phone,
      website: academy.website || '',
      subscriptionPlan: academy.subscriptionPlan || 'Basic',
      isActive: true, // You might want to add an isActive field to your schema
      studentsCount: academy._count.students,
      coachesCount: academy._count.coaches,
      // Add any other fields you need
      headCoach: '' // This would need to be determined from coaches if needed
    }));

    return NextResponse.json(formattedAcademies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academies' },
      { status: 500 }
    );
  }
}