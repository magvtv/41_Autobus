import { NextRequest, NextResponse } from 'next/server';
import { mockChargerStations, type ChargerStation } from '@/lib/mockData';

// GET /api/chargers/[id] - Get specific charging station
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const stationId = params.id;
    const station = mockChargerStations.find(s => s.id === stationId);

    if (!station) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Charging station not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: station,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching charging station:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch charging station',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/chargers/[id] - Update charging station
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const stationId = params.id;
    const body = await request.json();
    
    const stationIndex = mockChargerStations.findIndex(s => s.id === stationId);
    
    if (stationIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Charging station not found' 
        },
        { status: 404 }
      );
    }

    // Update station with provided fields
    const updatedStation = {
      ...mockChargerStations[stationIndex],
      ...body,
      id: stationId // Ensure ID doesn't change
    };

    // In a real app, you'd update the database here
    return NextResponse.json({
      success: true,
      data: updatedStation,
      message: 'Charging station updated successfully'
    });

  } catch (error) {
    console.error('Error updating charging station:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update charging station',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
