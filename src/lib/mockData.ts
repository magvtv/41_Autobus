// Mock data for MatatuMind application

export interface Vehicle {
  id: string;
  plate: string;
  type: "diesel" | "electric";
  socPercent?: number; // State of charge for EVs
  fuelLiters?: number; // Fuel for diesel vehicles
  capacity: number;
  lastKnownLocation: { lat: number; lng: number };
  status: "in-route" | "charging" | "idle" | "maintenance";
  nextDispatchTimestamp: string;
  currentRoute?: string;
  driver: string;
  totalTripsToday: number;
  revenue: number;
}

export interface ChargerStation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  plugsTotal: number;
  plugsAvailable: number;
  gridNodeId: string;
  costPerKwh: number;
  powerOutput: number; // kW
  status: "operational" | "maintenance" | "offline";
}

export interface Trip {
  id: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  passengers: number;
  scheduledDeparture: string;
  actualDeparture?: string;
  actualArrival?: string;
  vehicleId: string;
  fare: number;
  distance: number; // km
}

export interface GridNode {
  id: string;
  region: string;
  capacityKw: number;
  status: "normal" | "brownout" | "peak";
  loadPercent: number;
}

export interface ChargingSchedule {
  vehicleId: string;
  chargerId: string;
  startTime: string;
  endTime: string;
  expectedEnergyKwh: number;
  priority: "high" | "medium" | "low";
}

// Nairobi coordinates and common locations
const NAIROBI_CENTER = { lat: -1.2921, lng: 36.8219 };
const NAIROBI_LOCATIONS = [
  { name: "CBD", lat: -1.2921, lng: 36.8219 },
  { name: "Westlands", lat: -1.2676, lng: 36.8108 },
  { name: "Kasarani", lat: -1.2198, lng: 36.8975 },
  { name: "Embakasi", lat: -1.3197, lng: 36.8947 },
  { name: "Kibera", lat: -1.3133, lng: 36.7894 },
  { name: "Mathare", lat: -1.2584, lng: 36.8584 },
  { name: "Kariobangi", lat: -1.2532, lng: 36.8916 },
  { name: "Kawangware", lat: -1.2905, lng: 36.7372 },
  { name: "Umoja", lat: -1.2779, lng: 36.8916 },
  { name: "Dandora", lat: -1.2532, lng: 36.8916 },
];

export const mockVehicles: Vehicle[] = [
  {
    id: "KCA-001E",
    plate: "KCA 001E",
    type: "electric",
    socPercent: 23,
    capacity: 14,
    lastKnownLocation: { lat: -1.2921, lng: 36.8219 },
    status: "in-route",
    nextDispatchTimestamp: "2024-01-15T16:30:00Z",
    currentRoute: "CBD → Kasarani",
    driver: "John Mwangi",
    totalTripsToday: 8,
    revenue: 13200,
  },
  {
    id: "KCB-002E",
    plate: "KCB 002E",
    type: "electric",
    socPercent: 67,
    capacity: 14,
    lastKnownLocation: { lat: -1.2676, lng: 36.8108 },
    status: "idle",
    nextDispatchTimestamp: "2024-01-15T17:00:00Z",
    driver: "Grace Wanjiku",
    totalTripsToday: 6,
    revenue: 28000,
  },
  {
    id: "KCC-003E",
    plate: "KCC 003E",
    type: "electric",
    socPercent: 12,
    capacity: 14,
    lastKnownLocation: { lat: -1.2198, lng: 36.8975 },
    status: "charging",
    nextDispatchTimestamp: "2024-01-15T18:00:00Z",
    currentRoute: "Charging at Kasarani Station",
    driver: "Peter Kiprotich",
    totalTripsToday: 9,
    revenue: 13600,
  },
  {
    id: "KCD-004D",
    plate: "KCD 004D",
    type: "diesel",
    fuelLiters: 45,
    capacity: 14,
    lastKnownLocation: { lat: -1.3197, lng: 36.8947 },
    status: "in-route",
    nextDispatchTimestamp: "2024-01-15T16:45:00Z",
    currentRoute: "Embakasi → CBD",
    driver: "Mary Nyokabi",
    totalTripsToday: 7,
    revenue: 22900,
  },
  {
    id: "KCE-005E",
    plate: "KCE 005E",
    type: "electric",
    socPercent: 89,
    capacity: 14,
    lastKnownLocation: { lat: -1.3133, lng: 36.7894 },
    status: "in-route",
    nextDispatchTimestamp: "2024-01-15T17:15:00Z",
    currentRoute: "Kibera → Westlands",
    driver: "Samuel Kipchoge",
    totalTripsToday: 5,
    revenue: 12400,
  },
  {
    id: "KCF-006E",
    plate: "KCF 006E",
    type: "electric",
    socPercent: 34,
    capacity: 14,
    lastKnownLocation: { lat: -1.2584, lng: 36.8584 },
    status: "idle",
    nextDispatchTimestamp: "2024-01-15T17:30:00Z",
    driver: "Elizabeth Wambui",
    totalTripsToday: 6,
    revenue: 20700,
  },
];

export const mockChargerStations: ChargerStation[] = [
  {
    id: "CS-CBD-01",
    name: "CBD Central Station",
    location: { lat: -1.2865, lng: 36.82 },
    plugsTotal: 8,
    plugsAvailable: 3,
    gridNodeId: "GN-CBD",
    costPerKwh: 25,
    powerOutput: 50,
    status: "operational",
  },
  {
    id: "CS-WLS-01",
    name: "Westlands Hub",
    location: { lat: -1.2676, lng: 36.8108 },
    plugsTotal: 6,
    plugsAvailable: 6,
    gridNodeId: "GN-WLS",
    costPerKwh: 23,
    powerOutput: 50,
    status: "operational",
  },
  {
    id: "CS-KAS-01",
    name: "Kasarani Station",
    location: { lat: -1.2198, lng: 36.8975 },
    plugsTotal: 4,
    plugsAvailable: 0,
    gridNodeId: "GN-KAS",
    costPerKwh: 22,
    powerOutput: 50,
    status: "operational",
  },
  {
    id: "CS-EMB-01",
    name: "Embakasi Depot",
    location: { lat: -1.3197, lng: 36.8947 },
    plugsTotal: 10,
    plugsAvailable: 7,
    gridNodeId: "GN-EMB",
    costPerKwh: 24,
    powerOutput: 50,
    status: "operational",
  },
  {
    id: "CS-KIB-01",
    name: "Kibera Station",
    location: { lat: -1.3133, lng: 36.7894 },
    plugsTotal: 4,
    plugsAvailable: 2,
    gridNodeId: "GN-KIB",
    costPerKwh: 25,
    powerOutput: 30,
    status: "maintenance",
  },
];

export const mockGridNodes: GridNode[] = [
  {
    id: "GN-CBD",
    region: "Central Business District",
    capacityKw: 500,
    status: "peak",
    loadPercent: 87,
  },
  {
    id: "GN-WLS",
    region: "Westlands",
    capacityKw: 300,
    status: "normal",
    loadPercent: 65,
  },
  {
    id: "GN-KAS",
    region: "Kasarani",
    capacityKw: 200,
    status: "normal",
    loadPercent: 72,
  },
  {
    id: "GN-EMB",
    region: "Embakasi",
    capacityKw: 400,
    status: "brownout",
    loadPercent: 95,
  },
  {
    id: "GN-KIB",
    region: "Kibera",
    capacityKw: 150,
    status: "normal",
    loadPercent: 58,
  },
];

export const mockTrips: Trip[] = [
  {
    id: "T-001",
    origin: { lat: -1.2921, lng: 36.8219, name: "CBD" },
    destination: { lat: -1.2198, lng: 36.8975, name: "Kasarani" },
    passengers: 12,
    scheduledDeparture: "2024-01-15T16:00:00Z",
    actualDeparture: "2024-01-15T16:05:00Z",
    vehicleId: "KCA-001E",
    fare: 80,
    distance: 12.5,
  },
  {
    id: "T-002",
    origin: { lat: -1.3197, lng: 36.8947, name: "Embakasi" },
    destination: { lat: -1.2921, lng: 36.8219, name: "CBD" },
    passengers: 14,
    scheduledDeparture: "2024-01-15T16:30:00Z",
    vehicleId: "KCD-004D",
    fare: 60,
    distance: 10.2,
  },
];

export const mockChargingSchedule: ChargingSchedule[] = [
  {
    vehicleId: "KCC-003E",
    chargerId: "CS-KAS-01",
    startTime: "2024-01-15T15:30:00Z",
    endTime: "2024-01-15T17:30:00Z",
    expectedEnergyKwh: 45,
    priority: "high",
  },
  {
    vehicleId: "KCA-001E",
    chargerId: "CS-CBD-01",
    startTime: "2024-01-15T18:00:00Z",
    endTime: "2024-01-15T20:00:00Z",
    expectedEnergyKwh: 52,
    priority: "high",
  },
];

// Simulation scenarios
export const scenarios = {
  "rush-hour-brownout": {
    name: "Rush Hour Grid Brownout",
    description:
      "Heavy traffic during evening rush with grid stress in Embakasi",
    gridStatus: "brownout",
    trafficMultiplier: 2.5,
    activeVehicles: 5,
  },
  "normal-day": {
    name: "Normal Operations",
    description: "Standard operating conditions with regular traffic",
    gridStatus: "normal",
    trafficMultiplier: 1.0,
    activeVehicles: 6,
  },
  "depot-failure": {
    name: "Kibera Depot Offline",
    description: "Main charging station in Kibera is down for maintenance",
    gridStatus: "normal",
    trafficMultiplier: 1.2,
    activeVehicles: 4,
  },
};

// Helper functions
export function getVehiclesByStatus(status: Vehicle["status"]): Vehicle[] {
  return mockVehicles.filter((v) => v.status === status);
}

export function getAvailableChargers(): ChargerStation[] {
  return mockChargerStations.filter(
    (station) => station.status === "operational" && station.plugsAvailable > 0,
  );
}

export function calculateFleetStats() {
  const totalVehicles = mockVehicles.length;
  const evVehicles = mockVehicles.filter((v) => v.type === "electric").length;
  const dieselVehicles = mockVehicles.filter((v) => v.type === "diesel").length;
  const activeVehicles = mockVehicles.filter(
    (v) => v.status === "in-route",
  ).length;
  const chargingVehicles = mockVehicles.filter(
    (v) => v.status === "charging",
  ).length;

  const totalRevenue = mockVehicles.reduce((sum, v) => sum + v.revenue, 0);
  const avgSoc =
    mockVehicles
      .filter((v) => v.type === "electric")
      .reduce((sum, v) => sum + (v.socPercent || 0), 0) / evVehicles;

  return {
    totalVehicles,
    evVehicles,
    dieselVehicles,
    activeVehicles,
    chargingVehicles,
    totalRevenue,
    avgSoc: Math.round(avgSoc),
  };
}
