import { NextRequest, NextResponse } from 'next/server';
import { mockVehicles, type Vehicle } from '@/lib/mockData';

// GET /api/vehicles - Get all vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let filteredVehicles = [...mockVehicles];

    // Filter by status if provided
    if (status) {
      filteredVehicles = filteredVehicles.filter(v => v.status === status);
    }

    // Filter by type if provided
    if (type) {
      filteredVehicles = filteredVehicles.filter(v => v.type === type);
    }

    return NextResponse.json({
      success: true,
      data: filteredVehicles,
      count: filteredVehicles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vehicles',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Create a new vehicle (for simulation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['plate', 'type', 'capacity', 'driver'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Create new vehicle
    const newVehicle: Vehicle = {
      id: `KC${String(mockVehicles.length + 1).padStart(3, '0')}${body.type === 'electric' ? 'E' : 'D'}`,
      plate: body.plate,
      type: body.type,
      socPercent: body.type === 'electric' ? (body.socPercent || 100) : undefined,
      fuelLiters: body.type === 'diesel' ? (body.fuelLiters || 50) : undefined,
      capacity: body.capacity,
      lastKnownLocation: body.lastKnownLocation || { lat: -1.2921, lng: 36.8219 },
      status: body.status || 'idle',
      nextDispatchTimestamp: body.nextDispatchTimestamp || new Date().toISOString(),
      currentRoute: body.currentRoute,
      driver: body.driver,
      totalTripsToday: 0,
      revenue: 0,
    };

    // In a real app, you'd save to database here
    // For now, we'll just return the created vehicle
    return NextResponse.json({
      success: true,
      data: newVehicle,
      message: 'Vehicle created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create vehicle',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
