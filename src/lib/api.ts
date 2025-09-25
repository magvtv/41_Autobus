// API client for MatatuMind backend integration

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api' 
  : 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

export interface RouteOptimizationRequest {
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  vehicleType: 'electric' | 'diesel';
  currentSoc?: number;
  trafficMultiplier?: number;
}

export interface RouteOptimizationResponse {
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  waypoints: Array<{ lat: number; lng: number; name?: string; type?: string }>;
  distance: {
    direct: number;
    total: number;
    optimized: number;
  };
  time: {
    direct: number;
    total: number;
    withCharging: number;
    savings: number;
  };
  energy: {
    consumption: number;
    remaining: number | null;
    needsCharging: boolean;
    savings: number;
  };
  chargingStations: Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number };
    distance: number;
    available: boolean;
    estimatedChargingTime: number;
    cost: number;
  }>;
  trafficMultiplier: number;
  optimization: {
    algorithm: string;
    pathNodes: number;
    costReduction: number;
  };
  recommendations: string[];
}

export interface ChargingScheduleRequest {
  vehicles?: any[];
  chargers?: any[];
  gridNodes?: any[];
  gridStatus?: string;
}

export interface ChargingScheduleResponse {
  schedule: Array<{
    vehicleId: string;
    chargerId: string;
    startTime: string;
    endTime: string;
    expectedEnergyKwh: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  queue: Array<{
    vehicle: any;
    waitTime: number;
    reason: string;
  }>;
  summary: {
    totalVehicles: number;
    vehiclesNeedingCharge: number;
    availableChargers: number;
    gridStatus: string;
    estimatedCompletionTime: string;
    totalScheduled: number;
    totalQueued: number;
    criticalVehiclesScheduled: number;
    criticalVehiclesQueued: number;
    averageWaitTime: number;
  };
}

export interface SimulationRequest {
  scenario?: string;
  duration?: number;
  timeStep?: number;
}

export interface SimulationResponse {
  scenario: {
    name: string;
    description: string;
    gridStatus: string;
    trafficMultiplier: number;
    activeVehicles: number;
  };
  duration: number;
  timeStep: number;
  result: {
    events: any[];
    vehicleUpdates: any[];
    chargerUpdates: any[];
    gridEvents: any[];
    finalState: {
      vehicles: any[];
      chargers: any[];
      gridNodes: any[];
    };
  };
  summary: {
    totalEvents: number;
    vehiclesAffected: number;
    chargersAffected: number;
    gridEvents: number;
  };
}

// API Functions
export async function optimizeRoute(request: RouteOptimizationRequest): Promise<ApiResponse<RouteOptimizationResponse>> {
  const response = await fetch(`${API_BASE}/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Route optimization failed: ${response.statusText}`);
  }

  return response.json();
}

export async function runChargingScheduler(request: ChargingScheduleRequest = {}): Promise<ApiResponse<ChargingScheduleResponse>> {
  const response = await fetch(`${API_BASE}/scheduler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Charging scheduler failed: ${response.statusText}`);
  }

  return response.json();
}

export async function runSimulation(request: SimulationRequest = {}): Promise<ApiResponse<SimulationResponse>> {
  const response = await fetch(`${API_BASE}/simulation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Simulation failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getVehicles(): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE}/vehicles`);

  if (!response.ok) {
    throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
  }

  return response.json();
}

export async function getChargers(): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE}/chargers`);

  if (!response.ok) {
    throw new Error(`Failed to fetch chargers: ${response.statusText}`);
  }

  return response.json();
}

export async function getFleetStats(): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE}/fleet/stats`);

  if (!response.ok) {
    throw new Error(`Failed to fetch fleet stats: ${response.statusText}`);
  }

  return response.json();
}

export async function getSimulationScenarios(): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE}/simulation`);

  if (!response.ok) {
    throw new Error(`Failed to fetch simulation scenarios: ${response.statusText}`);
  }

  return response.json();
}
