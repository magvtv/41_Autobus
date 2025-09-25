#!/usr/bin/env node

/**
 * MatatuMind API Test Suite
 * Comprehensive testing script for all backend API endpoints
 * 
 * Usage: node scripts/test-api.mjs [--port=3000] [--verbose]
 */

import { performance } from 'perf_hooks';

// Configuration
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = 'localhost';

// Parse command line arguments
const args = process.argv.slice(2);
const port = args.find(arg => arg.startsWith('--port='))?.split('=')[1] || DEFAULT_PORT;
const verbose = args.includes('--verbose') || args.includes('-v');
const host = args.find(arg => arg.startsWith('--host='))?.split('=')[1] || DEFAULT_HOST;

const baseUrl = `http://${host}:${port}/api`;

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logVerbose(message) {
  if (verbose) {
    log(message, 'info');
  }
}

async function makeRequest(endpoint, options = {}) {
  const startTime = performance.now();
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid JSON response' };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data,
      responseTime,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    return {
      success: false,
      status: 0,
      data: { error: error.message },
      responseTime,
      headers: {}
    };
  }
}

async function runTest(testName, testFunction) {
  totalTests++;
  log(`Running: ${testName}`, 'test');
  
  try {
    const result = await testFunction();
    if (result.success) {
      passedTests++;
      log(`PASSED: ${testName} (${result.responseTime}ms)`, 'success');
      if (verbose && result.data) {
        logVerbose(`Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    } else {
      failedTests++;
      log(`FAILED: ${testName} - ${result.data?.error || 'Unknown error'}`, 'error');
      if (verbose) {
        logVerbose(`Status: ${result.status}`);
        logVerbose(`Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    }
    
    testResults.push({
      name: testName,
      success: result.success,
      responseTime: result.responseTime,
      status: result.status,
      error: result.data?.error
    });
    
    return result;
  } catch (error) {
    failedTests++;
    log(`ERROR: ${testName} - ${error.message}`, 'error');
    testResults.push({
      name: testName,
      success: false,
      responseTime: 0,
      status: 0,
      error: error.message
    });
    return { success: false, data: { error: error.message } };
  }
}

// Test functions
async function testVehiclesAPI() {
  log('\n🚐 Testing Vehicles API', 'info');
  
  // Test GET /api/vehicles
  await runTest('GET /api/vehicles', async () => {
    const result = await makeRequest('/vehicles');
    if (!result.success) return result;
    
    const { data } = result.data;
    if (!Array.isArray(data) || data.length === 0) {
      return { ...result, success: false, data: { error: 'Expected array of vehicles' } };
    }
    
    // Validate vehicle structure
    const vehicle = data[0];
    const requiredFields = ['id', 'plate', 'type', 'status', 'driver'];
    for (const field of requiredFields) {
      if (!vehicle[field]) {
        return { ...result, success: false, data: { error: `Missing field: ${field}` } };
      }
    }
    
    return result;
  });
  
  // Test GET /api/vehicles with filters
  await runTest('GET /api/vehicles?status=in-route', async () => {
    const result = await makeRequest('/vehicles?status=in-route');
    if (!result.success) return result;
    
    const { data } = result.data;
    const allInRoute = data.every(v => v.status === 'in-route');
    if (!allInRoute) {
      return { ...result, success: false, data: { error: 'Filter not working correctly' } };
    }
    
    return result;
  });
  
  // Test GET /api/vehicles/[id]
  await runTest('GET /api/vehicles/[id]', async () => {
    const vehiclesResult = await makeRequest('/vehicles');
    if (!vehiclesResult.success) return vehiclesResult;
    
    const vehicleId = vehiclesResult.data.data[0].id;
    const result = await makeRequest(`/vehicles/${vehicleId}`);
    if (!result.success) return result;
    
    if (result.data.data.id !== vehicleId) {
      return { ...result, success: false, data: { error: 'Vehicle ID mismatch' } };
    }
    
    return result;
  });
  
  // Test POST /api/vehicles
  await runTest('POST /api/vehicles', async () => {
    const newVehicle = {
      plate: 'TEST-001',
      type: 'electric',
      capacity: 14,
      driver: 'Test Driver'
    };
    
    const result = await makeRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(newVehicle)
    });
    
    if (!result.success) return result;
    
    const { data } = result.data;
    if (data.plate !== newVehicle.plate) {
      return { ...result, success: false, data: { error: 'Vehicle creation failed' } };
    }
    
    return result;
  });
}

async function testChargersAPI() {
  log('\n🔌 Testing Chargers API', 'info');
  
  // Test GET /api/chargers
  await runTest('GET /api/chargers', async () => {
    const result = await makeRequest('/chargers');
    if (!result.success) return result;
    
    const { data } = result.data;
    if (!Array.isArray(data) || data.length === 0) {
      return { ...result, success: false, data: { error: 'Expected array of chargers' } };
    }
    
    // Validate charger structure
    const charger = data[0];
    const requiredFields = ['id', 'name', 'location', 'plugsTotal', 'status'];
    for (const field of requiredFields) {
      if (!charger[field]) {
        return { ...result, success: false, data: { error: `Missing field: ${field}` } };
      }
    }
    
    return result;
  });
  
  // Test GET /api/chargers with filters
  await runTest('GET /api/chargers?available=true', async () => {
    const result = await makeRequest('/chargers?available=true');
    if (!result.success) return result;
    
    const { data } = result.data;
    const allAvailable = data.every(c => c.plugsAvailable > 0);
    if (!allAvailable) {
      return { ...result, success: false, data: { error: 'Filter not working correctly' } };
    }
    
    return result;
  });
}

async function testFleetStatsAPI() {
  log('\n📊 Testing Fleet Stats API', 'info');
  
  await runTest('GET /api/fleet/stats', async () => {
    const result = await makeRequest('/fleet/stats');
    if (!result.success) return result;
    
    const { data } = result.data;
    const requiredFields = ['totalVehicles', 'evVehicles', 'activeVehicles', 'totalRevenue'];
    for (const field of requiredFields) {
      if (typeof data[field] !== 'number') {
        return { ...result, success: false, data: { error: `Missing or invalid field: ${field}` } };
      }
    }
    
    return result;
  });
  
  await runTest('GET /api/fleet/stats?details=true', async () => {
    const result = await makeRequest('/fleet/stats?details=true');
    if (!result.success) return result;
    
    const { data } = result.data;
    if (!data.details) {
      return { ...result, success: false, data: { error: 'Details not included' } };
    }
    
    return result;
  });
}

async function testSchedulerAPI() {
  log('\n⚡ Testing Scheduler API', 'info');
  
  await runTest('POST /api/scheduler', async () => {
    const result = await makeRequest('/scheduler', {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    if (!result.success) return result;
    
    const { data } = result.data;
    if (!data.schedule || !Array.isArray(data.schedule)) {
      return { ...result, success: false, data: { error: 'Expected schedule array' } };
    }
    
    if (!data.summary) {
      return { ...result, success: false, data: { error: 'Expected summary object' } };
    }
    
    return result;
  });
  
  await runTest('POST /api/scheduler with grid brownout', async () => {
    const result = await makeRequest('/scheduler', {
      method: 'POST',
      body: JSON.stringify({
        gridStatus: 'brownout'
      })
    });
    
    if (!result.success) return result;
    
    const { data } = result.data;
    if (data.summary.gridStatus !== 'brownout') {
      return { ...result, success: false, data: { error: 'Grid status not applied' } };
    }
    
    return result;
  });
}

async function testRouteAPI() {
  log('\n🗺️ Testing Route API', 'info');
  
  await runTest('POST /api/route', async () => {
    const routeRequest = {
      origin: { lat: -1.2921, lng: 36.8219, name: 'CBD' },
      destination: { lat: -1.2198, lng: 36.8975, name: 'Kasarani' },
      vehicleType: 'electric',
      currentSoc: 25
    };
    
    const result = await makeRequest('/route', {
      method: 'POST',
      body: JSON.stringify(routeRequest)
    });
    
    if (!result.success) return result;
    
    const { data } = result.data;
    if (!data.distance || !data.time || !data.waypoints) {
      return { ...result, success: false, data: { error: 'Missing route data' } };
    }
    
    if (data.distance.total <= 0) {
      return { ...result, success: false, data: { error: 'Invalid distance calculation' } };
    }
    
    return result;
  });
  
  await runTest('POST /api/route with low battery', async () => {
    const routeRequest = {
      origin: { lat: -1.2921, lng: 36.8219, name: 'CBD' },
      destination: { lat: -1.2198, lng: 36.8975, name: 'Kasarani' },
      vehicleType: 'electric',
      currentSoc: 10 // Low battery
    };
    
    const result = await makeRequest('/route', {
      method: 'POST',
      body: JSON.stringify(routeRequest)
    });
    
    if (!result.success) return result;
    
    const { data } = result.data;
    if (!data.energy.needsCharging) {
      return { ...result, success: false, data: { error: 'Should detect charging need' } };
    }
    
    return result;
  });
}

async function testSimulationAPI() {
  log('\n🎮 Testing Simulation API', 'info');
  
  await runTest('GET /api/simulation', async () => {
    const result = await makeRequest('/simulation');
    if (!result.success) return result;
    
    const { data } = result.data;
    if (!data.scenarios || !Array.isArray(data.scenarios)) {
      return { ...result, success: false, data: { error: 'Expected scenarios array' } };
    }
    
    if (data.scenarios.length === 0) {
      return { ...result, success: false, data: { error: 'No scenarios available' } };
    }
    
    return result;
  });
  
  await runTest('POST /api/simulation', async () => {
    const result = await makeRequest('/simulation', {
      method: 'POST',
      body: JSON.stringify({
        scenario: 'rush-hour-brownout',
        duration: 1,
        timeStep: 0.5
      })
    });
    
    if (!result.success) return result;
    
    const { data } = result.data;
    if (!data.result || !data.result.events) {
      return { ...result, success: false, data: { error: 'Expected simulation result' } };
    }
    
    return result;
  });
}

async function testErrorHandling() {
  log('\n🚨 Testing Error Handling', 'info');
  
  await runTest('GET /api/vehicles/invalid-id', async () => {
    const result = await makeRequest('/vehicles/invalid-id');
    // Should return 404
    if (result.status === 404) {
      return { ...result, success: true };
    }
    return { ...result, success: false, data: { error: 'Expected 404 for invalid ID' } };
  });
  
  await runTest('POST /api/vehicles with missing fields', async () => {
    const result = await makeRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify({}) // Missing required fields
    });
    
    // Should return 400
    if (result.status === 400) {
      return { ...result, success: true };
    }
    return { ...result, success: false, data: { error: 'Expected 400 for missing fields' } };
  });
}

// Performance testing
async function testPerformance() {
  log('\n⚡ Testing Performance', 'info');
  
  const performanceTests = [
    { name: 'GET /api/vehicles', endpoint: '/vehicles', method: 'GET' },
    { name: 'GET /api/chargers', endpoint: '/chargers', method: 'GET' },
    { name: 'GET /api/fleet/stats', endpoint: '/fleet/stats', method: 'GET' },
    { name: 'POST /api/scheduler', endpoint: '/scheduler', method: 'POST', body: {} },
    { name: 'POST /api/route', endpoint: '/route', method: 'POST', body: {
      origin: { lat: -1.2921, lng: 36.8219 },
      destination: { lat: -1.2198, lng: 36.8975 }
    }}
  ];
  
  for (const test of performanceTests) {
    const times = [];
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      const result = await makeRequest(test.endpoint, {
        method: test.method,
        body: test.body ? JSON.stringify(test.body) : undefined
      });
      if (result.success) {
        times.push(result.responseTime);
      }
    }
    
    if (times.length > 0) {
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      
      log(`Performance: ${test.name} - Avg: ${avgTime}ms, Min: ${minTime}ms, Max: ${maxTime}ms`, 'info');
      
      if (avgTime > 1000) {
        log(`WARNING: ${test.name} is slow (${avgTime}ms average)`, 'warning');
      }
    }
  }
}

// Main test runner
async function runAllTests() {
  const startTime = performance.now();
  
  log('🚀 Starting MatatuMind API Test Suite', 'info');
  log(`Testing against: ${baseUrl}`, 'info');
  log(`Verbose mode: ${verbose ? 'ON' : 'OFF'}`, 'info');
  log('', 'info');
  
  try {
    // Test all API endpoints
    await testVehiclesAPI();
    await testChargersAPI();
    await testFleetStatsAPI();
    await testSchedulerAPI();
    await testRouteAPI();
    await testSimulationAPI();
    await testErrorHandling();
    await testPerformance();
    
    // Generate summary
    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);
    
    log('\n📊 Test Summary', 'info');
    log(`Total Tests: ${totalTests}`, 'info');
    log(`Passed: ${passedTests}`, 'success');
    log(`Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'info');
    log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, 'info');
    log(`Total Time: ${totalTime}ms`, 'info');
    
    if (failedTests > 0) {
      log('\n❌ Failed Tests:', 'error');
      testResults
        .filter(r => !r.success)
        .forEach(r => log(`  - ${r.name}: ${r.error}`, 'error'));
    }
    
    if (verbose) {
      log('\n📋 All Test Results:', 'info');
      testResults.forEach(r => {
        const status = r.success ? '✅' : '❌';
        log(`  ${status} ${r.name} (${r.responseTime}ms)`, 'info');
      });
    }
    
    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
    
  } catch (error) {
    log(`FATAL ERROR: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Handle command line usage
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
MatatuMind API Test Suite

Usage: node scripts/test-api.mjs [options]

Options:
  --port=PORT     Port number (default: 3000)
  --host=HOST     Host address (default: localhost)
  --verbose, -v   Enable verbose output
  --help, -h      Show this help message

Examples:
  node scripts/test-api.mjs
  node scripts/test-api.mjs --port=3002 --verbose
  node scripts/test-api.mjs --host=192.168.1.100
`);
  process.exit(0);
}

// Run the tests
runAllTests().catch(error => {
  log(`FATAL ERROR: ${error.message}`, 'error');
  process.exit(1);
});
