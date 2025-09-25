#!/usr/bin/env node

/**
 * MatatuMind Route Optimization Demo
 * Demonstrates before/after route optimization for judges
 * 
 * Usage: node scripts/demo-optimization.mjs
 */

import { performance } from 'perf_hooks';

// Configuration
const API_BASE = 'http://localhost:3000/api';

// Demo scenarios
const demoScenarios = [
  {
    name: "CBD to Kasarani - Normal Traffic",
    origin: { lat: -1.2921, lng: 36.8219, name: "CBD" },
    destination: { lat: -1.2198, lng: 36.8975, name: "Kasarani" },
    vehicleType: "electric",
    currentSoc: 45,
    trafficMultiplier: 1.0
  },
  {
    name: "Westlands to Embakasi - Heavy Traffic",
    origin: { lat: -1.2676, lng: 36.8108, name: "Westlands" },
    destination: { lat: -1.3197, lng: 36.8947, name: "Embakasi" },
    vehicleType: "electric",
    currentSoc: 25,
    trafficMultiplier: 2.5
  },
  {
    name: "Kibera to CBD - Low Battery Scenario",
    origin: { lat: -1.3133, lng: 36.7894, name: "Kibera" },
    destination: { lat: -1.2921, lng: 36.8219, name: "CBD" },
    vehicleType: "electric",
    currentSoc: 15,
    trafficMultiplier: 1.8
  }
];

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    demo: '🎯',
    route: '🗺️',
    charging: '🔌'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    log(`Request failed: ${error.message}`, 'error');
    throw error;
  }
}

function formatTime(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }
}

function formatDistance(km) {
  return `${Math.round(km * 100) / 100} km`;
}

function formatEnergy(kwh) {
  return `${Math.round(kwh * 100) / 100} kWh`;
}

async function runRouteOptimizationDemo() {
  log('🚀 Starting MatatuMind Route Optimization Demo', 'demo');
  log('', 'info');
  
  for (const scenario of demoScenarios) {
    log(`🎯 Scenario: ${scenario.name}`, 'demo');
    log(`   From: ${scenario.origin.name} to ${scenario.destination.name}`, 'info');
    log(`   Vehicle: ${scenario.vehicleType} (${scenario.currentSoc}% battery)`, 'info');
    log(`   Traffic: ${scenario.trafficMultiplier}x normal`, 'info');
    log('', 'info');
    
    try {
      const startTime = performance.now();
      
      // Get optimized route
      const routeResponse = await makeRequest('/route', {
        method: 'POST',
        body: JSON.stringify(scenario)
      });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      if (routeResponse.success) {
        const route = routeResponse.data;
        
        // Display results
        log('📊 Route Optimization Results:', 'route');
        log(`   Direct Distance: ${formatDistance(route.distance.direct)}`, 'info');
        log(`   Optimized Distance: ${formatDistance(route.distance.total)}`, 'info');
        log(`   Direct Time: ${formatTime(route.time.direct)}`, 'info');
        log(`   Optimized Time: ${formatTime(route.time.total)}`, 'info');
        
        if (route.time.savings > 0) {
          log(`   ⏱️ Time Savings: ${formatTime(route.time.savings)} (${route.optimization.costReduction}% improvement)`, 'success');
        } else {
          log(`   ⏱️ Time Impact: +${formatTime(Math.abs(route.time.savings))}`, 'warning');
        }
        
        if (route.energy.savings > 0) {
          log(`   🔋 Energy Savings: ${formatEnergy(route.energy.savings)}`, 'success');
        }
        
        if (route.energy.needsCharging) {
          log(`   🔌 Charging Required: ${route.chargingStations.length} stations found`, 'charging');
          route.chargingStations.forEach((station, index) => {
            log(`      ${index + 1}. ${station.name} (${station.distance}km away)`, 'info');
          });
        }
        
        log(`   🧠 Algorithm: ${route.optimization.algorithm}`, 'info');
        log(`   📍 Waypoints: ${route.waypoints.length} stops`, 'info');
        
        // Display recommendations
        if (route.recommendations.length > 0) {
          log('💡 Recommendations:', 'info');
          route.recommendations.forEach(rec => {
            log(`   ${rec}`, 'info');
          });
        }
        
        log(`   ⚡ Response Time: ${responseTime}ms`, 'info');
        
      } else {
        log(`❌ Route optimization failed: ${routeResponse.error}`, 'error');
      }
      
    } catch (error) {
      log(`❌ Demo failed: ${error.message}`, 'error');
    }
    
    log('', 'info');
    log('─'.repeat(80), 'info');
    log('', 'info');
  }
}

async function runChargingSchedulerDemo() {
  log('🔌 Starting Charging Scheduler Demo', 'demo');
  log('', 'info');
  
  try {
    // Test normal grid conditions
    log('📊 Normal Grid Conditions:', 'info');
    const normalResponse = await makeRequest('/scheduler', {
      method: 'POST',
      body: JSON.stringify({ gridStatus: 'normal' })
    });
    
    if (normalResponse.success) {
      const data = normalResponse.data;
      log(`   Total Vehicles: ${data.summary.totalVehicles}`, 'info');
      log(`   Vehicles Needing Charge: ${data.summary.vehiclesNeedingCharge}`, 'info');
      log(`   Available Chargers: ${data.summary.availableChargers}`, 'info');
      log(`   Scheduled: ${data.summary.totalScheduled}`, 'success');
      log(`   Queued: ${data.summary.totalQueued}`, 'warning');
      log(`   Critical Vehicles Scheduled: ${data.summary.criticalVehiclesScheduled}`, 'success');
      log(`   Average Wait Time: ${data.summary.averageWaitTime} minutes`, 'info');
      
      if (data.queue.length > 0) {
        log('   Queue Details:', 'info');
        data.queue.forEach((item, index) => {
          log(`      ${index + 1}. ${item.vehicle.id} - ${item.reason} (${item.waitTime}min wait)`, 'info');
        });
      }
    }
    
    log('', 'info');
    
    // Test brownout conditions
    log('⚠️ Grid Brownout Conditions:', 'warning');
    const brownoutResponse = await makeRequest('/scheduler', {
      method: 'POST',
      body: JSON.stringify({ gridStatus: 'brownout' })
    });
    
    if (brownoutResponse.success) {
      const data = brownoutResponse.data;
      log(`   Scheduled: ${data.summary.totalScheduled} (reduced capacity)`, 'warning');
      log(`   Queued: ${data.summary.totalQueued}`, 'warning');
      log(`   Critical Vehicles Scheduled: ${data.summary.criticalVehiclesScheduled}`, 'success');
      log(`   Average Wait Time: ${data.summary.averageWaitTime} minutes`, 'warning');
    }
    
  } catch (error) {
    log(`❌ Charging scheduler demo failed: ${error.message}`, 'error');
  }
}

async function runSimulationDemo() {
  log('🎮 Starting Simulation Demo', 'demo');
  log('', 'info');
  
  try {
    // Get available scenarios
    const scenariosResponse = await makeRequest('/simulation');
    
    if (scenariosResponse.success) {
      log('📋 Available Scenarios:', 'info');
      scenariosResponse.data.scenarios.forEach(scenario => {
        log(`   • ${scenario.name}: ${scenario.description}`, 'info');
      });
      
      log('', 'info');
      
      // Run rush hour brownout scenario
      log('🚦 Running Rush Hour Brownout Scenario:', 'demo');
      const simulationResponse = await makeRequest('/simulation', {
        method: 'POST',
        body: JSON.stringify({
          scenario: 'rush-hour-brownout',
          duration: 2,
          timeStep: 0.5
        })
      });
      
      if (simulationResponse.success) {
        const data = simulationResponse.data;
        log(`   Duration: ${data.duration} hours`, 'info');
        log(`   Time Step: ${data.timeStep} hours`, 'info');
        log(`   Total Events: ${data.summary.totalEvents}`, 'info');
        log(`   Vehicles Affected: ${data.summary.vehiclesAffected}`, 'info');
        log(`   Chargers Affected: ${data.summary.chargersAffected}`, 'info');
        log(`   Grid Events: ${data.summary.gridEvents}`, 'info');
      }
    }
    
  } catch (error) {
    log(`❌ Simulation demo failed: ${error.message}`, 'error');
  }
}

async function runFullDemo() {
  const startTime = performance.now();
  
  log('🎯 MatatuMind - EV Fleet Management Demo', 'demo');
  log('Demonstrating Route Optimization & Charging Scheduler', 'demo');
  log('', 'info');
  
  try {
    await runRouteOptimizationDemo();
    await runChargingSchedulerDemo();
    await runSimulationDemo();
    
    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);
    
    log('', 'info');
    log('🎉 Demo Complete!', 'success');
    log(`⏱️ Total Demo Time: ${totalTime}ms`, 'info');
    log('', 'info');
    log('Key Features Demonstrated:', 'demo');
    log('✅ A* Route Optimization Algorithm', 'success');
    log('✅ Traffic-Aware Routing', 'success');
    log('✅ EV Charging Station Integration', 'success');
    log('✅ Critical SOC Threshold Prioritization', 'success');
    log('✅ Queue Management System', 'success');
    log('✅ Grid-Aware Charging Scheduler', 'success');
    log('✅ Real-time Simulation Engine', 'success');
    
  } catch (error) {
    log(`❌ Demo failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle command line usage
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
MatatuMind Route Optimization Demo

Usage: node scripts/demo-optimization.mjs

This script demonstrates the key features of MatatuMind:
- Route optimization with A* algorithm
- Charging scheduler with priority management
- Simulation scenarios for different conditions

Make sure the API server is running on localhost:3000
`);
  process.exit(0);
}

// Run the demo
runFullDemo().catch(error => {
  log(`FATAL ERROR: ${error.message}`, 'error');
  process.exit(1);
});
