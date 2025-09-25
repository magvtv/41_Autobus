import { NextRequest, NextResponse } from 'next/server';
import { mockVehicles, mockChargerStations, mockGridNodes, scenarios, type Vehicle, type ChargerStation, type GridNode } from '@/lib/mockData';

interface SimulationEvent {
  timestamp: string;
  type: string;
  vehicleId?: string;
  chargerId?: string;
  changes?: Partial<Vehicle> | Partial<ChargerStation>;
  message?: string;
  data?: Record<string, unknown>;
}

interface VehicleUpdate {
  vehicleId: string;
  timestamp: string;
  changes: Partial<Vehicle>;
}

interface ChargerUpdate {
  chargerId: string;
  timestamp: string;
  changes: Partial<ChargerStation>;
}

interface GridEvent {
  timestamp: string;
  type: string;
  location?: string;
  description?: string;
}

// POST /api/simulation - Run simulation scenario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { scenario = 'normal-day', duration = 24, timeStep = 1 } = body;
    
    // Get scenario configuration
    const scenarioConfig = scenarios[scenario as keyof typeof scenarios];
    if (!scenarioConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid scenario' 
        },
        { status: 400 }
      );
    }

    // Run simulation
    const simulationResult = runSimulation(scenarioConfig, duration, timeStep);

    return NextResponse.json({
      success: true,
      data: {
        scenario: scenarioConfig,
        duration,
        timeStep,
        result: simulationResult,
        summary: {
          totalEvents: simulationResult.events.length,
          vehiclesAffected: simulationResult.vehicleUpdates.length,
          chargersAffected: simulationResult.chargerUpdates.length,
          gridEvents: simulationResult.gridEvents.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error running simulation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run simulation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/simulation - Get available scenarios
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        scenarios: Object.keys(scenarios).map(key => ({
          id: key,
          ...scenarios[key as keyof typeof scenarios]
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch scenarios',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Simulation Engine Implementation
function runSimulation(
  scenario: { name: string; description: string; gridStatus: string; trafficMultiplier: number; activeVehicles: number }, 
  durationHours: number, 
  timeStepHours: number
) {
  const events = [];
  const vehicleUpdates = [];
  const chargerUpdates = [];
  const gridEvents = [];
  
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
  
  // Initialize simulation state
  let currentTime = new Date(startTime);
  let vehicles = [...mockVehicles];
  let chargers = [...mockChargerStations];
  let gridNodes = [...mockGridNodes];
  
  // Apply scenario-specific modifications
  if (scenario.gridStatus === 'brownout') {
    gridNodes = gridNodes.map(node => ({
      ...node,
      status: node.region === 'Embakasi' ? 'brownout' : node.status,
      loadPercent: node.region === 'Embakasi' ? 95 : node.loadPercent
    }));
    
    gridEvents.push({
      timestamp: currentTime.toISOString(),
      type: 'grid_brownout',
      location: 'Embakasi',
      description: 'Grid brownout detected in Embakasi region'
    });
  }
  
  // Simulate time steps
  while (currentTime < endTime) {
    const timeStepEvents = simulateTimeStep(
      currentTime, 
      vehicles, 
      chargers, 
      gridNodes, 
      scenario
    );
    
    events.push(...timeStepEvents.events);
    vehicleUpdates.push(...timeStepEvents.vehicleUpdates);
    chargerUpdates.push(...timeStepEvents.chargerUpdates);
    gridEvents.push(...timeStepEvents.gridEvents);
    
    // Update state
    vehicles = timeStepEvents.vehicles;
    chargers = timeStepEvents.chargers;
    gridNodes = timeStepEvents.gridNodes;
    
    // Move to next time step
    currentTime = new Date(currentTime.getTime() + timeStepHours * 60 * 60 * 1000);
  }
  
  return {
    events,
    vehicleUpdates,
    chargerUpdates,
    gridEvents,
    finalState: {
      vehicles,
      chargers,
      gridNodes
    }
  };
}

// Simulate a single time step
function simulateTimeStep(
  currentTime: Date,
  vehicles: Vehicle[],
  chargers: ChargerStation[],
  gridNodes: GridNode[],
  scenario: { name: string; description: string; gridStatus: string; trafficMultiplier: number; activeVehicles: number }
) {
  const events: SimulationEvent[] = [];
  const vehicleUpdates: VehicleUpdate[] = [];
  const chargerUpdates: ChargerUpdate[] = [];
  const gridEvents: GridEvent[] = [];
  
  // Simulate vehicle movements and status changes
  vehicles.forEach(vehicle => {
    const shouldUpdate = Math.random() < 0.3; // 30% chance of update per time step
    
    if (shouldUpdate) {
      const update = simulateVehicleUpdate(vehicle, currentTime, scenario);
      if (update) {
        vehicleUpdates.push(update);
        events.push({
          timestamp: currentTime.toISOString(),
          type: 'vehicle_update',
          vehicleId: vehicle.id,
          changes: update.changes
        });
      }
    }
  });
  
  // Simulate charger availability changes
  chargers.forEach(charger => {
    const shouldUpdate = Math.random() < 0.1; // 10% chance of update per time step
    
    if (shouldUpdate) {
      const update = simulateChargerUpdate(charger, currentTime, scenario);
      if (update) {
        chargerUpdates.push(update);
        events.push({
          timestamp: currentTime.toISOString(),
          type: 'charger_update',
          chargerId: charger.id,
          changes: update.changes
        });
      }
    }
  });
  
  // Simulate grid events
  if (scenario.gridStatus === 'brownout' && Math.random() < 0.05) {
    gridEvents.push({
      timestamp: currentTime.toISOString(),
      type: 'grid_stress',
      description: 'Grid load increasing due to high demand'
    });
  }
  
  return {
    events,
    vehicleUpdates,
    chargerUpdates,
    gridEvents,
    vehicles,
    chargers,
    gridNodes
  };
}

// Simulate vehicle status update
function simulateVehicleUpdate(vehicle: Vehicle, currentTime: Date, scenario: { name: string; description: string; gridStatus: string; trafficMultiplier: number; activeVehicles: number }) {
  const changes: Partial<Vehicle> = {};
  
  // Simulate battery/fuel consumption
  if (vehicle.type === 'electric' && vehicle.socPercent) {
    const consumption = Math.random() * 5; // 0-5% consumption
    changes.socPercent = Math.max(0, vehicle.socPercent - consumption);
    
    // Change status if battery is low
    if (changes.socPercent < 15 && vehicle.status !== 'charging') {
      changes.status = 'idle';
      changes.currentRoute = 'Low battery - seeking charging station';
    }
  }
  
  // Simulate status changes based on scenario
  if (scenario.trafficMultiplier > 1.5 && vehicle.status === 'in-route') {
    if (Math.random() < 0.2) { // 20% chance of delay
      changes.status = 'idle';
      changes.currentRoute = 'Traffic delay - route adjustment needed';
    }
  }
  
  // Simulate trip completion
  if (vehicle.status === 'in-route' && Math.random() < 0.3) {
    changes.status = 'idle';
    changes.currentRoute = undefined;
    changes.totalTripsToday = vehicle.totalTripsToday + 1;
    changes.revenue = vehicle.revenue + Math.floor(Math.random() * 500) + 200;
  }
  
  return Object.keys(changes).length > 0 ? {
    vehicleId: vehicle.id,
    timestamp: currentTime.toISOString(),
    changes
  } : null;
}

// Simulate charger availability update
function simulateChargerUpdate(charger: ChargerStation, currentTime: Date, scenario: { name: string; description: string; gridStatus: string; trafficMultiplier: number; activeVehicles: number }) {
  const changes: Partial<ChargerStation> = {};
  
  // Simulate plug availability changes
  if (Math.random() < 0.3) {
    const change = Math.random() < 0.5 ? 1 : -1;
    changes.plugsAvailable = Math.max(0, Math.min(charger.plugsTotal, charger.plugsAvailable + change));
  }
  
  // Simulate maintenance events
  if (charger.status === 'operational' && Math.random() < 0.02) {
    changes.status = 'maintenance';
    changes.plugsAvailable = 0;
  } else if (charger.status === 'maintenance' && Math.random() < 0.1) {
    changes.status = 'operational';
    changes.plugsAvailable = charger.plugsTotal;
  }
  
  return Object.keys(changes).length > 0 ? {
    chargerId: charger.id,
    timestamp: currentTime.toISOString(),
    changes
  } : null;
}
