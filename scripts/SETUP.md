# MatatuMind Scripts

This directory contains utility scripts for the MatatuMind project.

## Available Scripts

### 🧪 API Testing (`test-api.mjs`)

Comprehensive test suite for all backend API endpoints.

**Usage:**
```bash
# Basic test run
npm run test:api

# Verbose output (shows response data)
npm run test:api:verbose

# Test against different port
npm run test:api:port

# Custom options
node scripts/test-api.mjs --port=3002 --verbose
node scripts/test-api.mjs --host=192.168.1.100 --port=3000
```

**Features:**
- ✅ Tests all API endpoints (vehicles, chargers, scheduler, route, simulation)
- ✅ Validates response structure and data integrity
- ✅ Tests error handling and edge cases
- ✅ Performance benchmarking
- ✅ Detailed reporting with success rates
- ✅ Configurable host/port for different environments

**Test Coverage:**
- **Vehicles API**: GET, POST, filtering, individual vehicle lookup
- **Chargers API**: GET, filtering by availability
- **Fleet Stats**: Basic and detailed statistics
- **Scheduler**: Charging optimization with grid constraints
- **Route API**: Route calculation with battery considerations
- **Simulation**: Scenario execution and event generation
- **Error Handling**: Invalid requests, missing fields, 404s

### 🗂️ Cache Management (`cache-manager.mjs`)

Manages build cache and temporary files.

**Usage:**
```bash
# Clean all caches and builds
npm run clean

# Clean only cache directories
npm run clean:cache

# Clean only build directories  
npm run clean:build

# Check cache size
npm run cache:check

# Show detailed cache sizes
npm run cache:size
```

**Features:**
- 🧹 Cleans `.next`, `.swc`, `.eslintcache`, `coverage` directories
- 📊 Shows cache sizes and usage statistics
- ⚠️ Warns when cache exceeds 500MB
- 🔍 Finds generated CSS files after build
- 📁 Manages build artifacts

## Script Options

### test-api.mjs Options

| Option | Description | Default |
|--------|-------------|---------|
| `--port=PORT` | Port number to test | 3000 |
| `--host=HOST` | Host address to test | localhost |
| `--verbose`, `-v` | Enable verbose output | false |
| `--help`, `-h` | Show help message | - |

### cache-manager.mjs Commands

| Command | Description |
|---------|-------------|
| `clean` | Clean all cache and build directories |
| `clean-cache` | Clean only cache directories |
| `clean-build` | Clean only build directories |
| `check` | Check cache size and warn if too large |
| `size` | Show detailed cache sizes |
| `css` | Find generated CSS files after build |

## Examples

### Testing API Endpoints
```bash
# Quick test
npm run test:api

# Detailed test with verbose output
npm run test:api:verbose

# Test against production server
node scripts/test-api.mjs --host=api.matatumind.com --port=443
```

### Managing Cache
```bash
# Before deployment
npm run clean

# Check if cache is getting too large
npm run cache:check

# See what's taking up space
npm run cache:size
```

## Integration

These scripts are integrated into the main `package.json` for easy access:

```json
{
  "scripts": {
    "test:api": "node scripts/test-api.mjs",
    "test:api:verbose": "node scripts/test-api.mjs --verbose", 
    "test:api:port": "node scripts/test-api.mjs --port=3002",
    "clean": "node scripts/cache-manager.mjs clean",
    "clean:cache": "node scripts/cache-manager.mjs clean-cache",
    "clean:build": "node scripts/cache-manager.mjs clean-build",
    "cache:check": "node scripts/cache-manager.mjs check",
    "cache:size": "node scripts/cache-manager.mjs size"
  }
}
```

## Requirements

- Node.js 18+ (for ES modules support)
- Next.js development server running for API tests
- No additional dependencies required
