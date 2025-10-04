import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();

// GET /api/settings - Get academy settings for the current user
export async function GET(request: NextRequest) {
  try {
    // Get user data from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    // Default to System Academy (ID: 1) if no token is found
    let academyId = 1;
    
    if (token) {
      try {
        // Verify and decode the JWT token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
        const { payload } = await jwtVerify(token, secret);
        
        // Extract academyId from the token payload
        if (payload && typeof payload.academyId === 'number') {
          academyId = payload.academyId;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // Continue with default academyId if token verification fails
      }
    }
    
    // Get academy based on academyId
    const academy = await prisma.academy.findUnique({
      where: { id: academyId },
      include: {
        locations: true
      }
    });

    if (!academy) {
      return NextResponse.json({ error: 'Academy not found' }, { status: 404 });
    }

    // Get head coach information if available
    let headCoachInfo = {
      headCoach: academy.headCoach || '',
      headCoachEmail: academy.headCoachEmail || '',
      headCoachPhone: academy.headCoachPhone || '',
      headCoachQualification: academy.headCoachQualification || ''
    };

    // Format the response to match the expected structure in the frontend
    const settings = {
      academyName: academy.name,
      description: academy.description || '',
      email: academy.email,
      phone: academy.phone || '',
      website: academy.website || '',
      defaultCoachPassword: academy.defaultCoachPassword || 'coach',
      ...headCoachInfo,
      locations: academy.locations.map(location => ({
        id: location.id.toString(),
        name: location.name,
        address: location.address,
        courts: location.courts,
        facilities: location.facilities ? location.facilities.split(',') : []
      })),
      operatingHours: {
        monday: { open: '06:00', close: '22:00', closed: false },
        tuesday: { open: '06:00', close: '22:00', closed: false },
        wednesday: { open: '06:00', close: '22:00', closed: false },
        thursday: { open: '06:00', close: '22:00', closed: false },
        friday: { open: '06:00', close: '22:00', closed: false },
        saturday: { open: '08:00', close: '20:00', closed: false },
        sunday: { open: '08:00', close: '18:00', closed: false }
      },
      subscriptionPlan: academy.subscriptionPlan,
      maxStudents: academy.maxStudents,
      maxCoaches: academy.maxCoaches
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching academy settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academy settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update academy settings
export async function PUT(request: NextRequest) {
  try {
    // Get user data from cookies - same method as in GET
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    // Require a valid token
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    let academyId: number | undefined;
    
    try {
      // Verify and decode the JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(token, secret);
      
      // Extract academyId from the token payload
      if (payload && typeof payload.academyId === 'number') {
        academyId = payload.academyId;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    
    // Require a valid academyId
    if (!academyId) {
      return NextResponse.json({ error: 'No academy associated with user' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Check if academy exists first
    const existingAcademy = await prisma.academy.findUnique({
      where: { id: academyId }
    });
    
    // If academy doesn't exist, return an error
    if (!existingAcademy) {
      console.error(`Academy with ID ${academyId} not found`);
      return NextResponse.json({ 
        error: 'Academy not found. Please contact system administrator.' 
      }, { status: 404 });
    }
    
    // Update existing academy
    const updatedAcademy = await prisma.academy.update({
      where: { id: academyId },
      data: {
        name: body.academyName,
        description: body.description,
        email: body.email,
        phone: body.phone,
        website: body.website,
        headCoach: body.headCoach,
        headCoachEmail: body.headCoachEmail,
        headCoachPhone: body.headCoachPhone,
        headCoachQualification: body.headCoachQualification,
        defaultCoachPassword: body.defaultCoachPassword,
        subscriptionPlan: body.subscriptionPlan,
        maxStudents: body.maxStudents,
        maxCoaches: body.maxCoaches
      }
    });

    // Handle locations update
    if (body.locations && Array.isArray(body.locations)) {
      console.log('Processing locations:', body.locations.length);
      
      // Get existing locations
      const existingLocations = await prisma.location.findMany({
        where: { academyId }
      });
      console.log('Existing locations:', existingLocations.length);
      
      // Create a map of existing locations by ID
      const existingLocationsMap = new Map(
        existingLocations.map(loc => [loc.id.toString(), loc])
      );
      
      // Process each location in the request
      for (const location of body.locations) {
        console.log('Processing location:', location);
        console.log('Location ID type:', typeof location.id);
        
        // Format facilities as comma-separated string
        const facilitiesString = Array.isArray(location.facilities) 
          ? location.facilities.join(',') 
          : '';
        
        try {
          // For new locations with string IDs (from Date.now().toString())
          if (typeof location.id === 'string' && location.id.length > 8) {
            console.log('Creating new location with string ID:', location.name);
            // Create new location
            const newLocation = await prisma.location.create({
              data: {
                name: location.name || 'Unnamed Location',
                address: location.address || '',
                courts: parseInt(location.courts) || 1,
                facilities: facilitiesString,
                academyId: academyId
              }
            });
            console.log('New location created:', newLocation);
          } else if (isNaN(parseInt(location.id)) || parseInt(location.id) <= 0) {
            console.log('Creating new location with invalid numeric ID:', location.name);
            // Create new location
            const newLocation = await prisma.location.create({
              data: {
                name: location.name || 'Unnamed Location',
                address: location.address || '',
                courts: parseInt(location.courts) || 1,
                facilities: facilitiesString,
                academyId: academyId
              }
            });
            console.log('New location created:', newLocation);
          } else {
            // Update existing location
            if (existingLocationsMap.has(location.id)) {
              console.log('Updating existing location:', parseInt(location.id));
              await prisma.location.update({
                where: { id: parseInt(location.id) },
                data: {
                  name: location.name || 'Unnamed Location',
                  address: location.address || '',
                  courts: parseInt(location.courts) || 1,
                  facilities: facilitiesString
                }
              });
              console.log('Location updated successfully');
              
              // Remove from map to track which ones were processed
              existingLocationsMap.delete(location.id);
            }
          }
        } catch (error) {
          console.error('Error processing location:', error);
        }
      }
      
      // Delete locations that weren't in the request
      console.log('Locations to delete:', existingLocationsMap.size);
      
      const idsToDelete = Array.from(existingLocationsMap.keys());
      for (const id of idsToDelete) {
        try {
          await prisma.location.delete({
            where: { id: parseInt(id) }
          });
          console.log('Location deleted:', id);
        } catch (error) {
          console.error('Error deleting location:', error);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    });
  } catch (error) {
    console.error('Error updating academy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update academy settings' },
      { status: 500 }
    );
  }
}