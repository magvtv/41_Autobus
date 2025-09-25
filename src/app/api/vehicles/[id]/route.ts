import { NextRequest, NextResponse } from 'next/server';
import { mockVehicles, type Vehicle } from '@/lib/mockData';

// GET /api/vehicles/[id] - Get specific vehicle
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const vehicleId = params.id;
    const vehicle = mockVehicles.find(v => v.id === vehicleId);

    if (!vehicle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vehicle not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vehicle',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/[id] - Update vehicle status/location
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const vehicleId = params.id;
    const body = await request.json();
    
    const vehicleIndex = mockVehicles.findIndex(v => v.id === vehicleId);
    
    if (vehicleIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vehicle not found' 
        },
        { status: 404 }
      );
    }

    // Update vehicle with provided fields
    const updatedVehicle = {
      ...mockVehicles[vehicleIndex],
      ...body,
      id: vehicleId // Ensure ID doesn't change
    };

    // In a real app, you'd update the database here
    // For now, we'll just return the updated vehicle
    return NextResponse.json({
      success: true,
      data: updatedVehicle,
      message: 'Vehicle updated successfully'
    });

  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update vehicle',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
