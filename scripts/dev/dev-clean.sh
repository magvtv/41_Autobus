#!/bin/bash
set -e

PROJECT_NAME=$(basename "$PWD")
LOCKFILE="/tmp/nextjs-dev-${PROJECT_NAME}.lock"
PIDFILE="/tmp/nextjs-dev-${PROJECT_NAME}.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Function to kill existing dev servers
kill_dev_servers() {
    log_info "Checking for existing Next.js dev servers..."
    
    # Kill by process name
    if pgrep -f "next dev" > /dev/null; then
        log_warn "Found running Next.js dev processes. Terminating..."
        pkill -f "next dev" || true
        sleep 2
    fi
    
    # Kill by port (common Next.js ports)
    for port in 3000 3001 3002 3003 3004 3005; do
        if lsof -ti:$port > /dev/null 2>&1; then
            log_warn "Port $port is in use. Terminating process..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    done
    
    # Kill turbopack processes specifically
    if pgrep -f "turbo" > /dev/null; then
        log_warn "Found turbo processes. Terminating..."
        pkill -f "turbo" || true
    fi
    
    # Clean up lock and pid files
    rm -f "$LOCKFILE" "$PIDFILE"
    
    log_info "Process cleanup completed"
}

# Function to clean caches
clean_caches() {
    log_info "Cleaning Next.js caches and build artifacts..."
    
    # Remove build artifacts and caches
    local cache_dirs=(".next" ".turbo" "node_modules/.cache" ".swc" ".eslintcache" "coverage")
    
    for dir in "${cache_dirs[@]}"; do
        if [ -d "$dir" ]; then
            log_debug "Removing $dir"
            rm -rf "$dir"
        fi
    done
    
    # Clean Next.js cache explicitly
    if command -v npx >/dev/null 2>&1; then
        npx next clean 2>/dev/null || true
    fi
    
    # Clean temporary files
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    
    log_info "Cache cleanup completed"
}

# Function to ensure single instance
ensure_single_instance() {
    if [ -f "$LOCKFILE" ]; then
        local existing_pid=$(cat "$PIDFILE" 2>/dev/null || echo "")
        if [ -n "$existing_pid" ] && ps -p "$existing_pid" > /dev/null 2>&1; then
            log_error "Another dev server is already running (PID: $existing_pid)"
            log_info "Use 'npm run dev:kill' to stop it, or wait for it to finish"
            exit 1
        else
            log_warn "Stale lock file found. Cleaning up..."
            rm -f "$LOCKFILE" "$PIDFILE"
        fi
    fi
    
    # Create lock file
    echo $$ > "$PIDFILE"
    touch "$LOCKFILE"
}

# Function to start dev server
start_dev_server() {
    local mode=${1:-"stable"}
    
    log_info "Starting Next.js dev server in $mode mode..."
    
    # Trap to cleanup on exit
    trap 'rm -f "$LOCKFILE" "$PIDFILE"; exit' INT TERM EXIT
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "No package.json found. Are you in a Next.js project directory?"
        exit 1
    fi
    
    # Check if Next.js is installed
    if ! grep -q '"next"' package.json; then
        log_error "Next.js not found in package.json dependencies"
        exit 1
    fi
    
    # Set environment variables based on mode
    export FORCE_COLOR=1
    export CI=false
    
    # Check if package.json dev script already has turbopack
    local has_turbopack=false
    if grep -q '"dev".*--turbopack' package.json; then
        has_turbopack=true
    fi
    
    if [ "$mode" = "stable" ]; then
        log_info "Running with Turbopack disabled for stability"
        export TURBO_CI=0
        export NEXT_TELEMETRY_DISABLED=1
        
        if [ "$has_turbopack" = true ]; then
            # Project has turbopack in dev script, run without it
            log_info "Project has Turbopack enabled, running without for stability"
            next dev -H 0.0.0.0
        else
            # Run normal dev script
            npm run dev
        fi
    else
        log_info "Running with default Next.js settings"
        npm run dev
    fi
}

# Function to check system requirements
check_requirements() {
    # Check Node version
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node -v | cut -d'v' -f2)
        local major_version=$(echo $node_version | cut -d'.' -f1)
        
        if [ "$major_version" -lt 18 ]; then
            log_warn "Node.js version $node_version detected. Recommended: Node 20 LTS"
            log_info "Consider running: nvm install 20 && nvm use 20"
        else
            log_info "Node.js version: $node_version ✓"
        fi
    else
        log_error "Node.js not found. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        log_error "npm not found. Please install npm first."
        exit 1
    fi
    
    # Check available disk space (warn if less than 1GB)
    local available_space=$(df . | tail -1 | awk '{print $4}')
    if [ "$available_space" -lt 1048576 ]; then
        log_warn "Low disk space detected (< 1GB). This might cause build issues."
    fi
    
    # Check file watcher limits
    local max_user_watches=$(cat /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo "unknown")
    if [ "$max_user_watches" != "unknown" ] && [ "$max_user_watches" -lt 524288 ]; then
        log_warn "File watcher limit is low ($max_user_watches). Consider running optimize-system.sh"
    fi
}

# Function to show project info
show_project_info() {
    log_info "Project: $PROJECT_NAME"
    log_info "Location: $PWD"
    
    if [ -f "package.json" ]; then
        local next_version=$(grep '"next"' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/' || echo "unknown")
        log_info "Next.js version: $next_version"
        
        # Check if using Turbopack
        if grep -q "turbo" package.json; then
            log_info "Turbopack: Available"
        fi
    fi
}

# Main execution
main() {
    local command=${1:-"clean-start"}
    
    case $command in
        "kill")
            kill_dev_servers
            log_info "All Next.js dev servers stopped"
            ;;
        "clean")
            kill_dev_servers
            clean_caches
            log_info "Cleanup completed"
            ;;
        "clean-start")
            show_project_info
            check_requirements
            kill_dev_servers
            clean_caches
            ensure_single_instance
            start_dev_server "stable"
            ;;
        "start")
            show_project_info
            ensure_single_instance
            start_dev_server "normal"
            ;;
        "start-stable")
            show_project_info
            ensure_single_instance
            start_dev_server "stable"
            ;;
        "info")
            show_project_info
            check_requirements
            ;;
        *)
            echo "Next.js Dev Server Management Script"
            echo "Usage: $0 {kill|clean|clean-start|start|start-stable|info}"
            echo ""
            echo "Commands:"
            echo "  kill         - Stop all Next.js dev servers"
            echo "  clean        - Kill servers and clean caches"
            echo "  clean-start  - Full cleanup and start stable dev server (default)"
            echo "  start        - Start dev server with normal settings"
            echo "  start-stable - Start dev server with Turbopack disabled"
            echo "  info         - Show project and system information"
            echo ""
            echo "Examples:"
            echo "  $0 clean-start    # Recommended for daily development"
            echo "  $0 kill          # Stop all dev servers quickly"
            echo "  $0 info          # Check system requirements"
            exit 1
            ;;
    esac
}

main "$@"
