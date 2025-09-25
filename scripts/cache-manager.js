#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CACHE_DIRS = [
  '.next/cache',
  '.swc',
  '.eslintcache',
  'coverage'
];

const BUILD_DIRS = [
  '.next',
  'build',
  'out'
];

function log(message) {
  console.log(`[Cache Manager] ${message}`);
}

function cleanCache() {
  log('Cleaning cache directories...');
  CACHE_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      log(`✓ Cleaned ${dir}`);
    }
  });
}

function cleanBuild() {
  log('Cleaning build directories...');
  BUILD_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      log(`✓ Cleaned ${dir}`);
    }
  });
}

function getCacheSize() {
  let totalSize = 0;
  CACHE_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      const size = getDirSize(dir);
      totalSize += size;
      log(`${dir}: ${formatBytes(size)}`);
    }
  });
  return totalSize;
}

function getDirSize(dirPath) {
  let size = 0;
  if (fs.existsSync(dirPath)) {
    const stats = fs.statSync(dirPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        size += getDirSize(path.join(dirPath, file));
      });
    } else {
      size = stats.size;
    }
  }
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkStaleCache() {
  const cacheSize = getCacheSize();
  const maxSize = 500 * 1024 * 1024; // 500MB
  
  if (cacheSize > maxSize) {
    log(`⚠️  Cache size (${formatBytes(cacheSize)}) exceeds ${formatBytes(maxSize)}`);
    log('Consider running: npm run clean:cache');
    return true;
  }
  
  log(`✓ Cache size: ${formatBytes(cacheSize)}`);
  return false;
}

function findGeneratedCSS() {
  const buildDir = '.next';
  const cssFiles = [];
  
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found. Run npm run build first.');
    return [];
  }
  
  function findCSS(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findCSS(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        const relativePath = fullPath.replace('.next', '/_next');
        cssFiles.push(relativePath);
      }
    }
  }
  
  findCSS(path.join(buildDir, 'static'));
  
  if (cssFiles.length > 0) {
    log('✓ Found generated CSS files:');
    cssFiles.forEach(file => log(`  ${file}`));
  } else {
    log('❌ No CSS files found in build');
  }
  
  return cssFiles;
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'clean':
    cleanCache();
    cleanBuild();
    break;
  case 'clean-cache':
    cleanCache();
    break;
  case 'clean-build':
    cleanBuild();
    break;
  case 'check':
    checkStaleCache();
    break;
  case 'size':
    getCacheSize();
    break;
  case 'css':
    findGeneratedCSS();
    break;
  default:
    log('Usage: node scripts/cache-manager.js [clean|clean-cache|clean-build|check|size|css]');
    log('  clean       - Clean all cache and build directories');
    log('  clean-cache - Clean only cache directories');
    log('  clean-build - Clean only build directories');
    log('  check       - Check cache size and warn if too large');
    log('  size        - Show cache sizes');
    log('  css         - Find generated CSS files after build');
    break;
} 