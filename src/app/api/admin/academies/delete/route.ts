import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Get academy ID from URL or request body
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    
    if (!idParam) {
      return NextResponse.json({ error: 'Academy ID is required' }, { status: 400 });
    }
    
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Academy ID must be a number' }, { status: 400 });
    }

    // Check if academy exists
    const existingAcademy = await prisma.academy.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            coaches: true,
            courts: true,
            users: true
          }
        }
      }
    });

    if (!existingAcademy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    // Start a transaction to ensure all related data is deleted
    await prisma.$transaction(async (tx) => {
      // Delete all class sessions and attendance records related to this academy's classes
      const classes = await tx.class.findMany({
        where: { 
          coach: { academyId: id } 
        },
        select: { id: true }
      });
      
      const classIds = classes.map(c => c.id);
      
      // Delete attendance records for these classes
      if (classIds.length > 0) {
        // Find all class sessions for these classes
        const sessions = await tx.classSession.findMany({
          where: { classId: { in: classIds } },
          select: { id: true }
        });
        
        const sessionIds = sessions.map(s => s.id);
        
        // Delete attendance records
        if (sessionIds.length > 0) {
          await tx.attendance.deleteMany({
            where: { sessionId: { in: sessionIds } }
          });
        }
        
        // Delete class sessions
        await tx.classSession.deleteMany({
          where: { classId: { in: classIds } }
        });
        
        // Delete class enrollments
        await tx.classEnrollment.deleteMany({
          where: { classId: { in: classIds } }
        });
      }
      
      // Delete users associated with this academy
      await tx.user.deleteMany({
        where: { academyId: id }
      });
    });

    // Delete the academy (this will cascade delete students, coaches, courts, etc.)
    await prisma.academy.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Academy and all associated data deleted successfully',
      deletedCounts: {
        students: existingAcademy._count.students,
        coaches: existingAcademy._count.coaches,
        courts: existingAcademy._count.courts,
        users: existingAcademy._count.users
      }
    });
  } catch (error) {
    console.error('Error deleting academy:', error);
    return NextResponse.json({ error: 'Failed to delete academy' }, { status: 500 });
  }
}