#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, basename, join } from 'path';
import { promisify } from 'util';
import { createRequire } from 'module';

const execAsync = promisify(exec);
const require = createRequire(import.meta.url);

class NextDevManager {
    constructor() {
        this.projectRoot = process.cwd();
        this.projectName = basename(this.projectRoot);
        this.lockFile = `/tmp/nextjs-dev-${this.projectName}.lock`;
        this.pidFile = `/tmp/nextjs-dev-${this.projectName}.pid`;
        
        // Color codes
        this.colors = {
            info: '\x1b[32m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            debug: '\x1b[34m',
            reset: '\x1b[0m'
        };
    }

    log(level, message) {
        const color = this.colors[level] || this.colors.info;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`${color}[${level.toUpperCase()}]${this.colors.reset} ${timestamp} ${message}`);
    }

    async executeCommand(command, options = {}) {
        try {
            const { stdout, stderr } = await execAsync(command, {
                timeout: options.timeout || 30000,
                ...options
            });
            return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
        } catch (error) {
            return { 
                success: false, 
                error: error.message, 
                stdout: error.stdout || '', 
                stderr: error.stderr || '' 
            };
        }
    }

    async killDevServers() {
        this.log('info', 'Checking for existing Next.js dev servers...');
        
        try {
            // Kill Next.js processes
            const nextProcesses = await this.executeCommand('pgrep -f "next dev"');
            if (nextProcesses.success && nextProcesses.stdout) {
                this.log('warn', 'Found running Next.js dev processes. Terminating...');
                await this.executeCommand('pkill -f "next dev"');
                
                // Wait a moment for graceful shutdown
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Kill processes on common ports
            const ports = [3000, 3001, 3002, 3003, 3004, 3005];
            for (const port of ports) {
                const portCheck = await this.executeCommand(`lsof -ti:${port}`);
                if (portCheck.success && portCheck.stdout.trim()) {
                    this.log('warn', `Port ${port} is in use. Terminating process...`);
                    await this.executeCommand(`kill -9 ${portCheck.stdout.trim()}`);
                }
            }
            
            // Kill turbopack processes specifically
            const turboProcesses = await this.executeCommand('pgrep -f "turbo"');
            if (turboProcesses.success && turboProcesses.stdout) {
                this.log('warn', 'Found turbo processes. Terminating...');
                await this.executeCommand('pkill -f "turbo"');
            }
            
            // Cleanup lock files
            await this.cleanupLockFiles();
            
            this.log('info', 'Process cleanup completed');
            
        } catch (error) {
            this.log('warn', `Some processes might still be running: ${error.message}`);
        }
    }

    async cleanupLockFiles() {
        try {
            await fs.unlink(this.lockFile);
        } catch (error) {
            // File doesn't exist, that's fine
        }
        
        try {
            await fs.unlink(this.pidFile);
        } catch (error) {
            // File doesn't exist, that's fine
        }
    }

    async cleanCaches() {
        this.log('info', 'Cleaning Next.js caches and build artifacts...');
        
        const cachePaths = [
            '.next',
            '.turbo', 
            'node_modules/.cache',
            '.swc',
            '.eslintcache',
            'coverage'
        ];
        
        for (const cachePath of cachePaths) {
            try {
                const stats = await fs.stat(cachePath);
                if (stats.isDirectory()) {
                    this.log('debug', `Removing ${cachePath}`);
                    await fs.rm(cachePath, { recursive: true, force: true });
                }
            } catch (error) {
                // Directory doesn't exist, continue
            }
        }
        
        // Run next clean
        const nextClean = await this.executeCommand('npx next clean');
        if (!nextClean.success) {
            this.log('debug', 'Next clean not available or failed, but continuing...');
        }
        
        // Clean temporary files
        try {
            await this.executeCommand('find . -name "*.tmp" -type f -delete');
            await this.executeCommand('find . -name ".DS_Store" -type f -delete');
        } catch (error) {
            // Non-critical, continue
        }
        
        this.log('info', 'Cache cleanup completed');
    }

    async ensureSingleInstance() {
        try {
            const lockExists = await fs.access(this.lockFile).then(() => true).catch(() => false);
            
            if (lockExists) {
                try {
                    const pidContent = await fs.readFile(this.pidFile, 'utf8');
                    const pid = parseInt(pidContent.trim());
                    
                    // Check if process is still running
                    try {
                        process.kill(pid, 0); // Signal 0 just checks if process exists
                        this.log('error', `Another dev server is already running (PID: ${pid})`);
                        this.log('info', 'Use --kill flag or "npm run dev:kill" to stop it');
                        process.exit(1);
                    } catch (error) {
                        this.log('warn', 'Stale lock file found. Cleaning up...');
                        await this.cleanupLockFiles();
                    }
                } catch (error) {
                    await this.cleanupLockFiles();
                }
            }
            
            // Create lock files
            await fs.writeFile(this.pidFile, process.pid.toString());
            await fs.writeFile(this.lockFile, new Date().toISOString());
            
        } catch (error) {
            this.log('error', `Failed to create lock file: ${error.message}`);
            process.exit(1);
        }
    }

    async startDevServer(mode = 'stable') {
        this.log('info', `Starting Next.js dev server in ${mode} mode...`);
        
        // Cleanup on exit
        const cleanup = async () => {
            this.log('info', 'Cleaning up...');
            await this.cleanupLockFiles();
            process.exit(0);
        };
        
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('SIGQUIT', cleanup);
        
        // Check if package.json exists
        try {
            await fs.access('package.json');
        } catch (error) {
            this.log('error', 'No package.json found. Are you in a Next.js project directory?');
            process.exit(1);
        }
        
        // Check if Next.js is installed
        try {
            const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
            const hasNext = packageJson.dependencies?.next || packageJson.devDependencies?.next;
            
            if (!hasNext) {
                this.log('error', 'Next.js not found in package.json dependencies');
                process.exit(1);
            }
            
            this.log('info', `Next.js version: ${hasNext}`);
            
        } catch (error) {
            this.log('error', `Failed to read package.json: ${error.message}`);
            process.exit(1);
        }
        
        const env = { ...process.env };
        
        // Set environment variables
        env.FORCE_COLOR = '1';
        env.CI = 'false';
        
        // Check if project has turbopack in dev script
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        const devScript = packageJson.scripts?.dev || '';
        const hasTurbopack = devScript.includes('--turbopack');
        
        let devArgs = ['run', 'dev'];
        
        if (mode === 'stable') {
            this.log('info', 'Running with Turbopack disabled for stability');
            env.TURBO_CI = '0';
            env.NEXT_TELEMETRY_DISABLED = '1';
            env.NEXT_CACHE_DISABLED = '1';
            
            if (hasTurbopack) {
                this.log('info', 'Project has Turbopack enabled, running without for stability');
                // Run next dev directly without turbopack
                devArgs = ['exec', 'next', 'dev', '-H', '0.0.0.0'];
            }
        } else {
            this.log('info', 'Running with default Next.js settings');
        }
        
        const devProcess = spawn('npm', devArgs, {
            env,
            stdio: 'inherit',
            cwd: this.projectRoot
        });
        
        devProcess.on('error', (error) => {
            this.log('error', `Failed to start dev server: ${error.message}`);
            cleanup();
        });
        
        devProcess.on('exit', async (code) => {
            this.log('info', `Dev server exited with code ${code}`);
            await this.cleanupLockFiles();
            process.exit(code);
        });
    }

    async checkRequirements() {
        // Check Node version
        try {
            const nodeVersion = process.version.replace('v', '');
            const majorVersion = parseInt(nodeVersion.split('.')[0]);
            
            if (majorVersion < 18) {
                this.log('warn', `Node.js version ${nodeVersion} detected. Recommended: Node 20 LTS`);
                this.log('info', 'Consider running: nvm install 20 && nvm use 20');
            } else {
                this.log('info', `Node.js version: ${nodeVersion} ✓`);
            }
        } catch (error) {
            this.log('error', 'Could not check Node.js version');
        }

        // Check npm
        const npmCheck = await this.executeCommand('npm --version');
        if (npmCheck.success) {
            this.log('info', `npm version: ${npmCheck.stdout} ✓`);
        } else {
            this.log('error', 'npm not found. Please install npm first.');
            process.exit(1);
        }

        // Check available disk space
        const dfCheck = await this.executeCommand('df . --output=avail --block-size=1K | tail -1');
        if (dfCheck.success) {
            const availableKB = parseInt(dfCheck.stdout.trim());
            const availableMB = Math.round(availableKB / 1024);
            
            if (availableMB < 1024) {
                this.log('warn', `Low disk space detected (${availableMB}MB). This might cause build issues.`);
            } else {
                this.log('info', `Available disk space: ${availableMB}MB ✓`);
            }
        }

        // Check file watcher limits
        try {
            const watcherLimit = await fs.readFile('/proc/sys/fs/inotify/max_user_watches', 'utf8');
            const limit = parseInt(watcherLimit.trim());
            
            if (limit < 524288) {
                this.log('warn', `File watcher limit is low (${limit}). Consider running optimize-system.sh`);
            } else {
                this.log('info', `File watcher limit: ${limit} ✓`);
            }
        } catch (error) {
            this.log('debug', 'Could not check file watcher limits');
        }
    }

    async showProjectInfo() {
        this.log('info', `Project: ${this.projectName}`);
        this.log('info', `Location: ${this.projectRoot}`);
        
        try {
            const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
            const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next || 'unknown';
            
            this.log('info', `Next.js version: ${nextVersion}`);
            
            // Check package manager
            if (packageJson.packageManager) {
                this.log('info', `Package manager: ${packageJson.packageManager}`);
            }
            
            // Check if using Turbopack
            const scripts = packageJson.scripts || {};
            const hasDevScript = scripts.dev;
            if (hasDevScript && hasDevScript.includes('turbo')) {
                this.log('info', 'Turbopack: Enabled in dev script');
            }
            
        } catch (error) {
            this.log('warn', 'Could not read package.json details');
        }
    }

    async run(command = 'clean-start') {
        switch (command) {
            case 'kill':
                await this.killDevServers();
                this.log('info', 'All Next.js dev servers stopped');
                break;
                
            case 'clean':
                await this.killDevServers();
                await this.cleanCaches();
                this.log('info', 'Cleanup completed');
                break;
                
            case 'clean-start':
                await this.showProjectInfo();
                await this.checkRequirements();
                await this.killDevServers();
                await this.cleanCaches();
                await this.ensureSingleInstance();
                await this.startDevServer('stable');
                break;
                
            case 'start':
                await this.showProjectInfo();
                await this.ensureSingleInstance();
                await this.startDevServer('normal');
                break;
                
            case 'start-stable':
                await this.showProjectInfo();
                await this.ensureSingleInstance();
                await this.startDevServer('stable');
                break;
                
            case 'info':
                await this.showProjectInfo();
                await this.checkRequirements();
                break;
                
            default:
                console.log('Next.js Dev Server Management Script (Node.js version)');
                console.log(`Usage: node ${basename(fileURLToPath(import.meta.url))} {kill|clean|clean-start|start|start-stable|info}`);
                console.log('');
                console.log('Commands:');
                console.log('  kill         - Stop all Next.js dev servers');
                console.log('  clean        - Kill servers and clean caches');
                console.log('  clean-start  - Full cleanup and start stable dev server (default)');
                console.log('  start        - Start dev server with normal settings');
                console.log('  start-stable - Start dev server with Turbopack disabled');
                console.log('  info         - Show project and system information');
                console.log('');
                console.log('Examples:');
                console.log(`  node ${basename(fileURLToPath(import.meta.url))} clean-start    # Recommended for daily development`);
                console.log(`  node ${basename(fileURLToPath(import.meta.url))} kill          # Stop all dev servers quickly`);
                console.log(`  node ${basename(fileURLToPath(import.meta.url))} info          # Check system requirements`);
                process.exit(1);
        }
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the manager
const manager = new NextDevManager();
const command = process.argv[2];
manager.run(command).catch(error => {
    console.error('\x1b[31m[ERROR]\x1b[0m', error.message);
    process.exit(1);
});
