import { NextRequest, NextResponse } from 'next/server';
import { mockChargerStations, type ChargerStation } from '@/lib/mockData';

// GET /api/chargers - Get all charging stations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const available = searchParams.get('available');

    let filteredStations = [...mockChargerStations];

    // Filter by status if provided
    if (status) {
      filteredStations = filteredStations.filter(s => s.status === status);
    }

    // Filter by availability if provided
    if (available === 'true') {
      filteredStations = filteredStations.filter(s => s.plugsAvailable > 0);
    }

    return NextResponse.json({
      success: true,
      data: filteredStations,
      count: filteredStations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching charging stations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch charging stations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/chargers - Create a new charging station
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'location', 'plugsTotal', 'powerOutput'];
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

    // Create new charging station
    const newStation: ChargerStation = {
      id: `CS-${String(mockChargerStations.length + 1).padStart(3, '0')}`,
      name: body.name,
      location: body.location,
      plugsTotal: body.plugsTotal,
      plugsAvailable: body.plugsAvailable || body.plugsTotal,
      gridNodeId: body.gridNodeId || `GN-${String(mockChargerStations.length + 1).padStart(3, '0')}`,
      costPerKwh: body.costPerKwh || 25,
      powerOutput: body.powerOutput,
      status: body.status || 'operational',
    };

    // In a real app, you'd save to database here
    return NextResponse.json({
      success: true,
      data: newStation,
      message: 'Charging station created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating charging station:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create charging station',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
