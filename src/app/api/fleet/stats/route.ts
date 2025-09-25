import { NextRequest, NextResponse } from 'next/server';
import { mockVehicles, mockChargerStations, calculateFleetStats } from '@/lib/mockData';

// GET /api/fleet/stats - Get fleet statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';

    // Get basic fleet stats
    const basicStats = calculateFleetStats();
    
    // Get additional detailed stats if requested
    const detailedStats = includeDetails ? {
      vehiclesByStatus: {
        'in-route': mockVehicles.filter(v => v.status === 'in-route').length,
        'charging': mockVehicles.filter(v => v.status === 'charging').length,
        'idle': mockVehicles.filter(v => v.status === 'idle').length,
        'maintenance': mockVehicles.filter(v => v.status === 'maintenance').length
      },
      vehiclesByType: {
        'electric': mockVehicles.filter(v => v.type === 'electric').length,
        'diesel': mockVehicles.filter(v => v.type === 'diesel').length
      },
      batteryLevels: {
        'critical': mockVehicles.filter(v => v.type === 'electric' && (v.socPercent || 0) < 20).length,
        'low': mockVehicles.filter(v => v.type === 'electric' && (v.socPercent || 0) >= 20 && (v.socPercent || 0) < 50).length,
        'good': mockVehicles.filter(v => v.type === 'electric' && (v.socPercent || 0) >= 50).length
      },
      chargerAvailability: {
        'total': mockChargerStations.length,
        'operational': mockChargerStations.filter(c => c.status === 'operational').length,
        'available': mockChargerStations.filter(c => c.status === 'operational' && c.plugsAvailable > 0).length,
        'totalPlugs': mockChargerStations.reduce((sum, c) => sum + c.plugsTotal, 0),
        'availablePlugs': mockChargerStations.reduce((sum, c) => sum + c.plugsAvailable, 0)
      },
      topPerformers: mockVehicles
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3)
        .map(v => ({
          id: v.id,
          plate: v.plate,
          driver: v.driver,
          revenue: v.revenue,
          trips: v.totalTripsToday
        }))
    } : null;

    return NextResponse.json({
      success: true,
      data: {
        ...basicStats,
        ...(detailedStats && { details: detailedStats })
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching fleet stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch fleet statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
