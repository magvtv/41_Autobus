import { NextRequest, NextResponse } from 'next/server';
import { mockVehicles, type Vehicle } from '@/lib/mockData';

// POST /api/battery-health - Get battery health predictions for vehicles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { vehicleIds, projectionMonths = 6, includeClimateFactors = true } = body;
    
    // Get vehicles to analyze (all if none specified)
    const vehiclesToAnalyze = vehicleIds 
      ? mockVehicles.filter(v => vehicleIds.includes(v.id) && v.type === 'electric')
      : mockVehicles.filter(v => v.type === 'electric');

    if (vehiclesToAnalyze.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No electric vehicles found for analysis' 
        },
        { status: 400 }
      );
    }

    // Generate battery health predictions
    const predictions = vehiclesToAnalyze.map(vehicle => 
      generateBatteryHealthPrediction(vehicle, projectionMonths, includeClimateFactors)
    );

    // Calculate fleet-wide statistics
    const fleetStats = calculateFleetBatteryStats(predictions);

    return NextResponse.json({
      success: true,
      data: {
        predictions,
        fleetStats,
        projectionMonths,
        climateFactors: includeClimateFactors,
        analysisDate: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing battery health:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze battery health',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/battery-health - Get battery health for a specific vehicle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const projectionMonths = parseInt(searchParams.get('months') || '6');
    
    if (!vehicleId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vehicle ID is required' 
        },
        { status: 400 }
      );
    }

    const vehicle = mockVehicles.find(v => v.id === vehicleId && v.type === 'electric');
    
    if (!vehicle) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Electric vehicle not found' 
        },
        { status: 404 }
      );
    }

    const prediction = generateBatteryHealthPrediction(vehicle, projectionMonths, true);

    return NextResponse.json({
      success: true,
      data: prediction,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching battery health:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch battery health',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Battery Health Prediction Algorithm
interface BatteryHealthPrediction {
  vehicleId: string;
  plate: string;
  currentHealth: {
    socPercent: number;
    estimatedCapacity: number; // kWh
    cyclesCompleted: number;
    healthScore: number; // 0-100
  };
  projections: Array<{
    month: number;
    estimatedCapacity: number;
    healthScore: number;
    degradationRate: number;
    recommendedActions: string[];
  }>;
  climateImpact: {
    temperatureFactor: number;
    humidityFactor: number;
    dustFactor: number;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    actions: string[];
    estimatedCostSavings: number;
  };
}

function generateBatteryHealthPrediction(
  vehicle: Vehicle, 
  projectionMonths: number, 
  includeClimateFactors: boolean
): BatteryHealthPrediction {
  
  const currentSoc = vehicle.socPercent || 50;
  const baseCapacity = 50; // kWh - typical matatu battery
  const currentCycles = estimateCurrentCycles(vehicle);
  
  // Calculate current health score
  const currentHealthScore = calculateHealthScore(currentSoc, currentCycles, baseCapacity);
  
  // Climate factors for African conditions
  const climateImpact = includeClimateFactors ? {
    temperatureFactor: 1.15, // High temperature increases degradation
    humidityFactor: 1.05,    // High humidity affects battery chemistry
    dustFactor: 1.08         // Dust affects cooling and connections
  } : {
    temperatureFactor: 1.0,
    humidityFactor: 1.0,
    dustFactor: 1.0
  };
  
  // Generate monthly projections
  const projections = [];
  let currentCapacity = baseCapacity * (currentHealthScore / 100);
  
  for (let month = 1; month <= projectionMonths; month++) {
    // Calculate degradation for this month
    const monthlyDegradation = calculateMonthlyDegradation(
      currentCycles + (month * 30), // Assume 30 cycles per month
      climateImpact,
      vehicle.totalTripsToday
    );
    
    currentCapacity = Math.max(currentCapacity * (1 - monthlyDegradation), baseCapacity * 0.3); // Min 30% capacity
    const healthScore = Math.max((currentCapacity / baseCapacity) * 100, 30);
    
    projections.push({
      month,
      estimatedCapacity: Math.round(currentCapacity * 100) / 100,
      healthScore: Math.round(healthScore),
      degradationRate: Math.round(monthlyDegradation * 10000) / 100, // Percentage
      recommendedActions: generateMonthlyRecommendations(healthScore, month)
    });
  }
  
  // Generate overall recommendations
  const recommendations = generateOverallRecommendations(currentHealthScore, projections, climateImpact);
  
  return {
    vehicleId: vehicle.id,
    plate: vehicle.plate,
    currentHealth: {
      socPercent: currentSoc,
      estimatedCapacity: Math.round(currentCapacity * 100) / 100,
      cyclesCompleted: currentCycles,
      healthScore: Math.round(currentHealthScore)
    },
    projections,
    climateImpact,
    recommendations
  };
}

// Estimate current charge cycles based on vehicle usage
function estimateCurrentCycles(vehicle: Vehicle): number {
  // Base cycles on total trips and revenue (proxy for usage)
  const baseCycles = vehicle.totalTripsToday * 0.8; // ~0.8 cycles per trip
  const revenueFactor = vehicle.revenue / 10000; // Revenue as usage indicator
  return Math.floor(baseCycles + revenueFactor);
}

// Calculate current battery health score
function calculateHealthScore(socPercent: number, cycles: number, baseCapacity: number): number {
  // SOC impact (lower SOC = more stress)
  const socScore = Math.min(100, socPercent + 20); // Boost for good SOC
  
  // Cycle impact (more cycles = more degradation)
  const cycleScore = Math.max(30, 100 - (cycles * 0.5)); // 0.5% degradation per cycle
  
  // Combine scores
  return Math.round((socScore * 0.4 + cycleScore * 0.6));
}

// Calculate monthly degradation rate
function calculateMonthlyDegradation(
  totalCycles: number, 
  climateImpact: { temperatureFactor: number; humidityFactor: number; dustFactor: number },
  usageIntensity: number
): number {
  // Base degradation rate (0.02% per cycle)
  const baseRate = 0.0002;
  
  // Apply climate factors
  const climateMultiplier = climateImpact.temperatureFactor * 
                           climateImpact.humidityFactor * 
                           climateImpact.dustFactor;
  
  // Usage intensity factor
  const usageFactor = 1 + (usageIntensity / 20); // Higher usage = more degradation
  
  // Calculate monthly degradation
  const monthlyCycles = 30; // Assume 30 cycles per month
  return baseRate * monthlyCycles * climateMultiplier * usageFactor;
}

// Generate monthly recommendations
function generateMonthlyRecommendations(healthScore: number, month: number): string[] {
  const recommendations = [];
  
  if (healthScore < 50) {
    recommendations.push('Consider battery replacement planning');
  }
  
  if (healthScore < 70) {
    recommendations.push('Increase charging frequency to reduce deep cycles');
  }
  
  if (month % 3 === 0) {
    recommendations.push('Schedule battery health inspection');
  }
  
  if (healthScore > 80) {
    recommendations.push('Maintain current charging patterns');
  }
  
  return recommendations;
}

// Generate overall recommendations
function generateOverallRecommendations(
  currentHealth: number, 
  projections: Array<{ healthScore: number; month: number }>,
  climateImpact: { temperatureFactor: number; humidityFactor: number; dustFactor: number }
): { priority: 'high' | 'medium' | 'low'; actions: string[]; estimatedCostSavings: number } {
  
  const finalHealth = projections[projections.length - 1]?.healthScore || currentHealth;
  const healthDecline = currentHealth - finalHealth;
  
  let priority: 'high' | 'medium' | 'low' = 'low';
  const actions = [];
  let costSavings = 0;
  
  // Determine priority based on health decline
  if (healthDecline > 20 || currentHealth < 60) {
    priority = 'high';
    actions.push('Immediate battery health assessment required');
    actions.push('Consider early battery replacement to avoid downtime');
    costSavings = 50000; // KSh saved by preventing breakdown
  } else if (healthDecline > 10 || currentHealth < 75) {
    priority = 'medium';
    actions.push('Optimize charging patterns to reduce degradation');
    actions.push('Schedule quarterly battery inspections');
    costSavings = 25000;
  } else {
    priority = 'low';
    actions.push('Continue current maintenance schedule');
    actions.push('Monitor battery health monthly');
    costSavings = 10000;
  }
  
  // Climate-specific recommendations
  if (climateImpact.temperatureFactor > 1.1) {
    actions.push('Install battery cooling system for hot climate protection');
    costSavings += 15000;
  }
  
  if (climateImpact.dustFactor > 1.05) {
    actions.push('Increase battery cleaning frequency for dust protection');
    costSavings += 5000;
  }
  
  // Optimization recommendations
  actions.push('Use smart charging to reduce battery stress');
  actions.push('Avoid deep discharge cycles when possible');
  
  return {
    priority,
    actions,
    estimatedCostSavings: costSavings
  };
}

// Calculate fleet-wide battery statistics
function calculateFleetBatteryStats(predictions: BatteryHealthPrediction[]) {
  const totalVehicles = predictions.length;
  const avgCurrentHealth = predictions.reduce((sum, p) => sum + p.currentHealth.healthScore, 0) / totalVehicles;
  const avgFinalHealth = predictions.reduce((sum, p) => sum + p.projections[p.projections.length - 1].healthScore, 0) / totalVehicles;
  
  const criticalVehicles = predictions.filter(p => p.currentHealth.healthScore < 60).length;
  const healthyVehicles = predictions.filter(p => p.currentHealth.healthScore > 80).length;
  
  const totalCostSavings = predictions.reduce((sum, p) => sum + p.recommendations.estimatedCostSavings, 0);
  
  return {
    totalVehicles,
    avgCurrentHealth: Math.round(avgCurrentHealth),
    avgFinalHealth: Math.round(avgFinalHealth),
    criticalVehicles,
    healthyVehicles,
    totalCostSavings,
    healthDistribution: {
      excellent: predictions.filter(p => p.currentHealth.healthScore > 90).length,
      good: predictions.filter(p => p.currentHealth.healthScore >= 70 && p.currentHealth.healthScore <= 90).length,
      fair: predictions.filter(p => p.currentHealth.healthScore >= 50 && p.currentHealth.healthScore < 70).length,
      poor: predictions.filter(p => p.currentHealth.healthScore < 50).length
    }
  };
}
