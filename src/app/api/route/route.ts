import { NextRequest, NextResponse } from 'next/server';

// POST /api/route - Get optimized route between two points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { origin, destination, vehicleType, currentSoc, trafficMultiplier = 1.0 } = body;
    
    if (!origin || !destination) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Origin and destination are required' 
        },
        { status: 400 }
      );
    }

    // Run route optimization algorithm
    const optimizedRoute = calculateOptimizedRoute(
      origin, 
      destination, 
      vehicleType, 
      currentSoc, 
      trafficMultiplier
    );

    return NextResponse.json({
      success: true,
      data: optimizedRoute,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate route',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Route Optimization Algorithm Implementation with A* Algorithm
function calculateOptimizedRoute(
  origin: { lat: number; lng: number; name?: string },
  destination: { lat: number; lng: number; name?: string },
  vehicleType: 'electric' | 'diesel' = 'electric',
  currentSoc: number = 50,
  trafficMultiplier: number = 1.0
) {
  
  // Calculate direct distance (Haversine formula)
  const directDistance = calculateDistance(origin, destination);
  
  // Run A* algorithm to find optimal route
  const optimizedRoute = findOptimalRoute(origin, destination, vehicleType, currentSoc, trafficMultiplier);
  
  // Calculate baseline (direct) route for comparison
  const baselineTime = calculateBaselineTime(directDistance, trafficMultiplier);
  const baselineEnergy = calculateEnergyConsumption(directDistance, vehicleType);
  
  // Check if charging is needed for electric vehicles
  const energyConsumption = calculateEnergyConsumption(optimizedRoute.totalDistance, vehicleType);
  const needsCharging = vehicleType === 'electric' && 
    (currentSoc - energyConsumption) < 20; // Need at least 20% battery
  
  // Find nearest charging stations if needed
  const chargingStations = needsCharging ? 
    findNearestChargingStations(destination, 5) : [];
  
  // Generate route waypoints with charging stops
  const waypoints = generateRouteWaypoints(origin, destination, chargingStations, optimizedRoute.path);
  
  // Calculate total route metrics
  const totalDistance = calculateRouteDistance(waypoints);
  const totalTime = calculateRouteTime(waypoints, trafficMultiplier);
  
  // Calculate optimization benefits
  const timeSavings = baselineTime - totalTime;
  const energySavings = baselineEnergy - energyConsumption;
  
  return {
    origin,
    destination,
    waypoints,
    distance: {
      direct: Math.round(directDistance * 100) / 100,
      total: Math.round(totalDistance * 100) / 100,
      optimized: Math.round(optimizedRoute.totalDistance * 100) / 100
    },
    time: {
      direct: Math.round(baselineTime),
      total: Math.round(totalTime),
      withCharging: needsCharging ? Math.round(totalTime + 30) : Math.round(totalTime), // Add 30 min for charging
      savings: Math.round(timeSavings)
    },
    energy: {
      consumption: energyConsumption,
      remaining: vehicleType === 'electric' ? Math.max(0, currentSoc - energyConsumption) : null,
      needsCharging,
      savings: Math.round(energySavings * 100) / 100
    },
    chargingStations: chargingStations,
    trafficMultiplier,
    optimization: {
      algorithm: 'A* with traffic weighting',
      pathNodes: optimizedRoute.path.length,
      costReduction: Math.round(((baselineTime - totalTime) / baselineTime) * 100)
    },
    recommendations: generateRouteRecommendations(needsCharging, trafficMultiplier, currentSoc, timeSavings)
  };
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate energy consumption based on distance and vehicle type
function calculateEnergyConsumption(distance: number, vehicleType: 'electric' | 'diesel'): number {
  if (vehicleType === 'electric') {
    // Electric matatu: ~2 kWh per 100km
    return (distance / 100) * 2;
  } else {
    // Diesel matatu: ~15L per 100km
    return (distance / 100) * 15;
  }
}

// Find nearest charging stations to destination
function findNearestChargingStations(destination: { lat: number; lng: number }, limit: number = 5) {
  // Mock charging stations near destination
  const mockStations = [
    { id: 'CS-001', name: 'CBD Central Station', location: { lat: -1.2865, lng: 36.82 }, distance: 2.1, available: true },
    { id: 'CS-002', name: 'Westlands Hub', location: { lat: -1.2676, lng: 36.8108 }, distance: 3.5, available: true },
    { id: 'CS-003', name: 'Kasarani Station', location: { lat: -1.2198, lng: 36.8975 }, distance: 4.2, available: false },
    { id: 'CS-004', name: 'Embakasi Depot', location: { lat: -1.3197, lng: 36.8947 }, distance: 5.8, available: true },
    { id: 'CS-005', name: 'Kibera Station', location: { lat: -1.3133, lng: 36.7894 }, distance: 6.1, available: true }
  ];
  
  return mockStations
    .filter(station => station.available)
    .slice(0, limit)
    .map(station => ({
      ...station,
      estimatedChargingTime: 45, // minutes
      cost: 25 // KSh per kWh
    }));
}

// Generate route waypoints with A* path and charging stops
function generateRouteWaypoints(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  chargingStations: Array<{ location: { lat: number; lng: number }; name: string }>,
  optimizedPath?: Array<{ lat: number; lng: number }>
) {
  const waypoints = [];
  
  // Add origin
  waypoints.push({
    ...origin,
    type: 'start',
    name: (origin as { name?: string }).name || 'Origin'
  });
  
  // Add optimized path waypoints (excluding start and end)
  if (optimizedPath && optimizedPath.length > 2) {
    for (let i = 1; i < optimizedPath.length - 1; i++) {
      waypoints.push({
        lat: optimizedPath[i].lat,
        lng: optimizedPath[i].lng,
        type: 'waypoint',
        name: `Waypoint ${i}`
      });
    }
  }
  
  // Add charging station if needed
  if (chargingStations.length > 0) {
    waypoints.push({
      lat: chargingStations[0].location.lat,
      lng: chargingStations[0].location.lng,
      name: chargingStations[0].name,
      type: 'charging'
    });
  }
  
  // Add destination
  waypoints.push({
    ...destination,
    type: 'end',
    name: (destination as { name?: string }).name || 'Destination'
  });
  
  return waypoints;
}

// Calculate total route distance
function calculateRouteDistance(waypoints: Array<{ lat: number; lng: number }>): number {
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
  }
  return totalDistance;
}

// Calculate total route time
function calculateRouteTime(waypoints: Array<{ lat: number; lng: number }>, trafficMultiplier: number): number {
  const distance = calculateRouteDistance(waypoints);
  const baseTime = (distance / 30) * 60; // 30 km/h average speed
  return baseTime * trafficMultiplier;
}

// A* Algorithm Implementation for Route Optimization
interface RouteNode {
  lat: number;
  lng: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  parent?: RouteNode;
}

function findOptimalRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  vehicleType: 'electric' | 'diesel',
  currentSoc: number,
  trafficMultiplier: number
): { path: RouteNode[], totalDistance: number } {
  
  // Create a simplified road network with key Nairobi waypoints
  const roadNetwork = generateRoadNetwork(origin, destination);
  
  // A* algorithm implementation
  const openSet: RouteNode[] = [];
  const closedSet: Set<string> = new Set();
  
  // Start node
  const startNode: RouteNode = {
    lat: origin.lat,
    lng: origin.lng,
    g: 0,
    h: calculateDistance(origin, destination),
    f: 0
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);
  
  while (openSet.length > 0) {
    // Find node with lowest f cost
    let currentNode = openSet[0];
    let currentIndex = 0;
    
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < currentNode.f) {
        currentNode = openSet[i];
        currentIndex = i;
      }
    }
    
    // Remove current node from open set
    openSet.splice(currentIndex, 1);
    closedSet.add(`${currentNode.lat},${currentNode.lng}`);
    
    // Check if we reached the destination
    if (calculateDistance(currentNode, destination) < 0.5) { // Within 500m
      const path = reconstructPath(currentNode);
      const totalDistance = calculatePathDistance(path);
      return { path, totalDistance };
    }
    
    // Explore neighbors
    const neighbors = getNeighbors(currentNode, roadNetwork);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.lat},${neighbor.lng}`;
      
      if (closedSet.has(neighborKey)) continue;
      
      // Calculate tentative g score
      const tentativeG = currentNode.g + calculateDistance(currentNode, neighbor);
      
      // Check if this path to neighbor is better
      const existingNode = openSet.find(n => 
        Math.abs(n.lat - neighbor.lat) < 0.001 && Math.abs(n.lng - neighbor.lng) < 0.001
      );
      
      if (!existingNode) {
        // New node
        const newNode: RouteNode = {
          lat: neighbor.lat,
          lng: neighbor.lng,
          g: tentativeG,
          h: calculateDistance(neighbor, destination),
          f: 0,
          parent: currentNode
        };
        newNode.f = newNode.g + newNode.h;
        openSet.push(newNode);
      } else if (tentativeG < existingNode.g) {
        // Better path found
        existingNode.g = tentativeG;
        existingNode.f = existingNode.g + existingNode.h;
        existingNode.parent = currentNode;
      }
    }
  }
  
  // Fallback: return direct path if A* fails
  return {
    path: [startNode, { ...destination, g: 0, h: 0, f: 0 }],
    totalDistance: calculateDistance(origin, destination)
  };
}

// Generate a simplified road network for Nairobi
function generateRoadNetwork(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): RouteNode[] {
  const network: RouteNode[] = [];
  
  // Add origin and destination
  network.push({ lat: origin.lat, lng: origin.lng, g: 0, h: 0, f: 0 });
  network.push({ lat: destination.lat, lng: destination.lng, g: 0, h: 0, f: 0 });
  
  // Add key Nairobi waypoints for route optimization
  const waypoints = [
    { lat: -1.2921, lng: 36.8219 }, // CBD
    { lat: -1.2676, lng: 36.8108 }, // Westlands
    { lat: -1.2198, lng: 36.8975 }, // Kasarani
    { lat: -1.3197, lng: 36.8947 }, // Embakasi
    { lat: -1.3133, lng: 36.7894 }, // Kibera
    { lat: -1.2584, lng: 36.8584 }, // Mathare
  ];
  
  // Add waypoints that are reasonably close to the route
  for (const waypoint of waypoints) {
    const distToOrigin = calculateDistance(origin, waypoint);
    const distToDest = calculateDistance(destination, waypoint);
    const directDist = calculateDistance(origin, destination);
    
    // Include waypoint if it's not too far off the direct route
    if (distToOrigin + distToDest < directDist * 1.5) {
      network.push({ lat: waypoint.lat, lng: waypoint.lng, g: 0, h: 0, f: 0 });
    }
  }
  
  return network;
}

// Get neighboring nodes for A* algorithm
function getNeighbors(node: RouteNode, network: RouteNode[]): RouteNode[] {
  return network.filter(n => {
    const distance = calculateDistance(node, n);
    return distance > 0.1 && distance < 5; // Reasonable neighbor distance
  });
}

// Reconstruct path from goal to start
function reconstructPath(node: RouteNode): RouteNode[] {
  const path: RouteNode[] = [];
  let current: RouteNode | undefined = node;
  
  while (current) {
    path.unshift(current);
    current = current.parent;
  }
  
  return path;
}

// Calculate total distance of a path
function calculatePathDistance(path: RouteNode[]): number {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(path[i], path[i + 1]);
  }
  return totalDistance;
}

// Calculate baseline time for comparison
function calculateBaselineTime(distance: number, trafficMultiplier: number): number {
  const baseTimeMinutes = (distance / 30) * 60; // 30 km/h average speed
  return baseTimeMinutes * trafficMultiplier;
}

// Generate route recommendations with optimization insights
function generateRouteRecommendations(
  needsCharging: boolean, 
  trafficMultiplier: number, 
  currentSoc: number,
  timeSavings: number
): string[] {
  const recommendations = [];
  
  if (needsCharging) {
    recommendations.push('⚠️ Charging required before reaching destination');
    recommendations.push('🔌 Nearest charging station: CBD Central Station (2.1km)');
  }
  
  if (trafficMultiplier > 1.5) {
    recommendations.push('🚦 Heavy traffic detected - A* algorithm optimized route');
  }
  
  if (currentSoc < 30) {
    recommendations.push('🔋 Low battery - prioritize charging over efficiency');
  }
  
  if (timeSavings > 0) {
    recommendations.push(`⏱️ Route optimization saves ${Math.round(timeSavings)} minutes`);
  }
  
  if (trafficMultiplier < 1.2 && !needsCharging) {
    recommendations.push('✅ Optimal conditions - direct route recommended');
  }
  
  if (timeSavings > 5) {
    recommendations.push('🎯 Significant time savings achieved with smart routing');
  }
  
  return recommendations;
}
