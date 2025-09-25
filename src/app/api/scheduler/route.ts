import { NextRequest, NextResponse } from 'next/server';
import { mockVehicles, mockChargerStations, mockGridNodes, type ChargingSchedule, type Vehicle, type ChargerStation, type GridNode } from '@/lib/mockData';

// POST /api/scheduler - Run charging scheduler algorithm
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get current fleet status (vehicles, chargers, grid)
    const vehicles = body.vehicles || mockVehicles;
    const chargers = body.chargers || mockChargerStations;
    const gridNodes = body.gridNodes || mockGridNodes;
    const gridStatus = body.gridStatus || 'normal';

    // Run the charging scheduler algorithm
    const schedulerResult = runChargingScheduler(vehicles, chargers, gridNodes, gridStatus);

    return NextResponse.json({
      success: true,
      data: {
        schedule: schedulerResult.schedule,
        queue: schedulerResult.queue,
        summary: {
          totalVehicles: vehicles.length,
          vehiclesNeedingCharge: vehicles.filter((v: Vehicle) => 
            v.type === 'electric' && (v.socPercent || 0) < 30
          ).length,
          availableChargers: chargers.filter((c: ChargerStation) => 
            c.status === 'operational' && c.plugsAvailable > 0
          ).length,
          gridStatus,
          estimatedCompletionTime: schedulerResult.schedule.length > 0 ? 
            new Date(Math.max(...schedulerResult.schedule.map(s => new Date(s.endTime).getTime()))).toISOString() : 
            new Date().toISOString(),
          // Enhanced summary with queue information
          totalScheduled: schedulerResult.summary.totalScheduled,
          totalQueued: schedulerResult.summary.totalQueued,
          criticalVehiclesScheduled: schedulerResult.summary.criticalVehiclesScheduled,
          criticalVehiclesQueued: schedulerResult.summary.criticalVehiclesQueued,
          averageWaitTime: schedulerResult.summary.averageWaitTime
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error running scheduler:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run charging scheduler',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Charging Scheduler Algorithm Implementation
function runChargingScheduler(
  vehicles: Vehicle[], 
  chargers: ChargerStation[], 
  gridNodes: GridNode[], 
  gridStatus: string
): { 
  schedule: ChargingSchedule[], 
  queue: Array<{ vehicle: any, waitTime: number, reason: string }>,
  summary: {
    totalScheduled: number,
    totalQueued: number,
    criticalVehiclesScheduled: number,
    criticalVehiclesQueued: number,
    averageWaitTime: number
  }
} {
  
  // Filter electric vehicles that need charging
  const vehiclesNeedingCharge = vehicles.filter(v => 
    v.type === 'electric' && 
    (v.socPercent || 0) < 30 && 
    v.status !== 'maintenance'
  );

  // Filter available chargers
  const availableChargers = chargers.filter(c => 
    c.status === 'operational' && c.plugsAvailable > 0
  );

  if (vehiclesNeedingCharge.length === 0 || availableChargers.length === 0) {
    return {
      schedule: [],
      queue: [],
      summary: {
        totalScheduled: 0,
        totalQueued: 0,
        criticalVehiclesScheduled: 0,
        criticalVehiclesQueued: 0,
        averageWaitTime: 0
      }
    };
  }

  // Calculate priority scores for vehicles with enhanced algorithm
  const vehiclesWithPriority = vehiclesNeedingCharge.map(vehicle => {
    const soc = vehicle.socPercent || 0;
    const timeToDispatch = new Date(vehicle.nextDispatchTimestamp).getTime() - Date.now();
    const hoursToDispatch = Math.max(0, timeToDispatch / (1000 * 60 * 60));
    
    // Enhanced priority scoring with multiple factors
    const socWeight = 0.4; // Battery level importance
    const timeWeight = 0.3; // Time to dispatch importance
    const revenueWeight = 0.2; // Revenue potential importance
    const locationWeight = 0.1; // Location accessibility importance
    
    // SOC criticality (higher for lower battery)
    const socCriticality = soc < 15 ? 1.0 : soc < 25 ? 0.8 : 0.6;
    
    // Time urgency (higher for sooner dispatch)
    const timeUrgency = hoursToDispatch < 1 ? 1.0 : hoursToDispatch < 4 ? 0.7 : 0.3;
    
    // Revenue potential (higher for vehicles with more trips)
    const revenuePotential = Math.min(vehicle.totalTripsToday / 10, 1.0);
    
    // Location accessibility (simplified - could be enhanced with actual distance to chargers)
    const locationAccessibility = 0.8; // Default good accessibility
    
    const criticalityScore = 
      (socWeight * socCriticality) +
      (timeWeight * timeUrgency) +
      (revenueWeight * revenuePotential) +
      (locationWeight * locationAccessibility);
    
    // Determine priority level with more granular thresholds
    let priority: 'high' | 'medium' | 'low';
    if (criticalityScore > 0.8 || soc < 15) {
      priority = 'high';
    } else if (criticalityScore > 0.5 || soc < 25) {
      priority = 'medium';
    } else {
      priority = 'low';
    }
    
    return {
      ...vehicle,
      criticalityScore,
      priority,
      socCriticality,
      timeUrgency,
      revenuePotential
    };
  });

  // Sort by priority (highest criticality first)
  vehiclesWithPriority.sort((a, b) => b.criticalityScore - a.criticalityScore);

  // Apply grid constraints
  const maxConcurrentChargers = gridStatus === 'brownout' ? 
    Math.floor(availableChargers.length * 0.5) : 
    availableChargers.length;

  const schedule: ChargingSchedule[] = [];
  const chargerAvailability = new Map<string, Date>();
  const queue: Array<{ vehicle: any, waitTime: number, reason: string }> = [];

  // Initialize charger availability
  availableChargers.forEach(charger => {
    chargerAvailability.set(charger.id, new Date());
  });

  // Critical SOC threshold logic - implement Vehicle A vs Vehicle B scenario
  const criticalSocThreshold = 20; // 20% battery threshold
  const vehiclesBelowThreshold = vehiclesWithPriority.filter(v => (v.socPercent || 0) < criticalSocThreshold);
  const vehiclesAboveThreshold = vehiclesWithPriority.filter(v => (v.socPercent || 0) >= criticalSocThreshold);

  // Prioritize vehicles below critical threshold (Vehicle B scenario)
  const prioritizedVehicles = [...vehiclesBelowThreshold, ...vehiclesAboveThreshold];

  // Schedule vehicles with enhanced queue management
  for (const vehicle of prioritizedVehicles) {
    if (schedule.length >= maxConcurrentChargers) {
      // Add to queue with wait time calculation
      const estimatedWaitTime = calculateQueueWaitTime(schedule, availableChargers);
      queue.push({
        vehicle,
        waitTime: estimatedWaitTime,
        reason: (vehicle.socPercent || 0) < criticalSocThreshold ? 
          'Critical battery level - priority queued' : 
          'Standard queue - waiting for charger availability'
      });
      continue;
    }

    // Find best available charger
    const bestCharger = findBestCharger(vehicle, availableChargers, chargerAvailability);
    
    if (bestCharger) {
      const startTime = chargerAvailability.get(bestCharger.id)!;
      const chargingTime = calculateChargingTime(vehicle, bestCharger);
      const endTime = new Date(startTime.getTime() + chargingTime * 60 * 1000);

      const scheduleEntry: ChargingSchedule = {
        vehicleId: vehicle.id,
        chargerId: bestCharger.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        expectedEnergyKwh: calculateEnergyNeeded(vehicle, bestCharger),
        priority: vehicle.priority as 'high' | 'medium' | 'low'
      };

      schedule.push(scheduleEntry);
      chargerAvailability.set(bestCharger.id, endTime);
    } else {
      // No charger available - add to queue
      const estimatedWaitTime = calculateQueueWaitTime(schedule, availableChargers);
      queue.push({
        vehicle,
        waitTime: estimatedWaitTime,
        reason: 'No available chargers - queued for next available slot'
      });
    }
  }

  return {
    schedule,
    queue,
    summary: {
      totalScheduled: schedule.length,
      totalQueued: queue.length,
      criticalVehiclesScheduled: schedule.filter(s => 
        vehiclesBelowThreshold.some(v => v.id === s.vehicleId)
      ).length,
      criticalVehiclesQueued: queue.filter(q => 
        vehiclesBelowThreshold.some(v => v.id === q.vehicle.id)
      ).length,
      averageWaitTime: queue.length > 0 ? 
        Math.round(queue.reduce((sum, q) => sum + q.waitTime, 0) / queue.length) : 0
    }
  };
}

// Helper function to find the best charger for a vehicle
function findBestCharger(
  vehicle: Vehicle, 
  chargers: ChargerStation[], 
  availability: Map<string, Date>
): ChargerStation | null {
  
  // Filter chargers that are available
  const availableChargers = chargers.filter(c => 
    c.status === 'operational' && c.plugsAvailable > 0
  );

  if (availableChargers.length === 0) return null;

  // Find charger with earliest availability
  let bestCharger = availableChargers[0];
  let earliestTime = availability.get(bestCharger.id)!;

  for (const charger of availableChargers) {
    const availableTime = availability.get(charger.id)!;
    if (availableTime < earliestTime) {
      bestCharger = charger;
      earliestTime = availableTime;
    }
  }

  return bestCharger;
}

// Calculate charging time in minutes
function calculateChargingTime(vehicle: Vehicle, charger: ChargerStation): number {
  const currentSoc = vehicle.socPercent || 0;
  const targetSoc = 90; // Charge to 90%
  const batteryCapacity = 50; // kWh (typical for matatu)
  
  const energyNeeded = (targetSoc - currentSoc) / 100 * batteryCapacity;
  const chargingPower = charger.powerOutput; // kW
  
  return Math.ceil((energyNeeded / chargingPower) * 60); // Convert to minutes
}

// Calculate energy needed in kWh
function calculateEnergyNeeded(vehicle: Vehicle, charger: ChargerStation): number {
  const currentSoc = vehicle.socPercent || 0;
  const targetSoc = 90;
  const batteryCapacity = 50; // kWh
  
  return (targetSoc - currentSoc) / 100 * batteryCapacity;
}

// Calculate estimated wait time for queued vehicles
function calculateQueueWaitTime(
  schedule: ChargingSchedule[], 
  availableChargers: ChargerStation[]
): number {
  if (schedule.length === 0) return 0;
  
  // Find the earliest available time across all chargers
  const earliestAvailable = Math.min(
    ...schedule.map(s => new Date(s.endTime).getTime())
  );
  
  const currentTime = Date.now();
  const waitTimeMinutes = Math.max(0, (earliestAvailable - currentTime) / (1000 * 60));
  
  return Math.round(waitTimeMinutes);
}
