import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, name, email, phone, website, subscriptionPlan, isActive } = data;

    if (!id) {
      return NextResponse.json({ error: 'Academy ID is required' }, { status: 400 });
    }

    // Check if academy exists
    const existingAcademy = await prisma.academy.findUnique({
      where: { id }
    });

    if (!existingAcademy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    // Update academy
    const updatedAcademy = await prisma.academy.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        website,
        subscriptionPlan,
        isActive
      }
    });

    return NextResponse.json({ 
      message: 'Academy updated successfully', 
      academy: updatedAcademy 
    });
  } catch (error) {
    console.error('Error updating academy:', error);
    return NextResponse.json({ error: 'Failed to update academy' }, { status: 500 });
  }
}