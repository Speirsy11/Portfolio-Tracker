#!/bin/bash

# Portfolio Tracker - Development PostgreSQL Database
# This script manages a local PostgreSQL container for development

set -e

CONTAINER_NAME="portfolio-dev-db"
PORTFOLIO_DB_NAME="portfolio_dev"
PORTFOLIO_DB_USER="portfolio"
PORTFOLIO_DB_PASSWORD="portfolio_secret"
PORTFOLIO_DB_PORT="5432"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not available in this environment."
    echo ""
    echo "👉 If you are using WSL 2 on Windows:"
    echo "   1. Open Docker Desktop settings"
    echo "   2. Go to 'Resources' > 'WSL Integration'"
    echo "   3. Enable integration for your specific distro"
    echo "   4. Click 'Apply & Restart'"
    exit 1
fi

start_db() {
    echo "🚀 Starting Portfolio Tracker development database..."
    
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            print_status "Database container is already running"
        else
            print_warning "Container exists but is stopped. Starting..."
            docker start "$CONTAINER_NAME"
            print_status "Database container started"
        fi
    else
        # Create and start new container
        docker run -d \
            --name "$CONTAINER_NAME" \
            -e POSTGRES_DB="$PORTFOLIO_DB_NAME" \
            -e POSTGRES_USER="$PORTFOLIO_DB_USER" \
            -e POSTGRES_PASSWORD="$PORTFOLIO_DB_PASSWORD" \
            -p "${PORTFOLIO_DB_PORT}:5432" \
            postgres:16-alpine
        
        print_status "Database container created and started"
        
        # Wait for PostgreSQL to be ready
        echo "⏳ Waiting for PostgreSQL to be ready..."
        sleep 3
        
        until docker exec "$CONTAINER_NAME" pg_isready -U "$PORTFOLIO_DB_USER" -d "$PORTFOLIO_DB_NAME" > /dev/null 2>&1; do
            sleep 1
        done
        
        print_status "PostgreSQL is ready!"
    fi
    
    echo ""
    echo "📝 Connection details:"
    echo "   Host: localhost"
    echo "   Port: $PORTFOLIO_DB_PORT"
    echo "   Database: $PORTFOLIO_DB_NAME"
    echo "   User: $PORTFOLIO_DB_USER"
    echo "   Password: $PORTFOLIO_DB_PASSWORD"
    echo ""
    echo "🔗 Connection URL:"
    echo "   PORTFOLIO_DATABASE_URL=\"postgresql://${PORTFOLIO_DB_USER}:${PORTFOLIO_DB_PASSWORD}@localhost:${PORTFOLIO_DB_PORT}/${PORTFOLIO_DB_NAME}\""
}

stop_db() {
    echo "🛑 Stopping Portfolio Tracker development database..."
    
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker stop "$CONTAINER_NAME"
        print_status "Database container stopped"
    else
        print_warning "Database container is not running"
    fi
}

destroy_db() {
    echo "💥 Destroying Portfolio Tracker development database..."
    
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker rm -f "$CONTAINER_NAME"
        print_status "Database container removed"
    else
        print_warning "Database container does not exist"
    fi
}

status_db() {
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_status "Database container is running"
        docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_warning "Database container exists but is stopped"
    else
        print_error "Database container does not exist"
    fi
}

logs_db() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker logs -f "$CONTAINER_NAME"
    else
        print_error "Database container does not exist"
    fi
}

psql_db() {
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker exec -it "$CONTAINER_NAME" psql -U "$PORTFOLIO_DB_USER" -d "$PORTFOLIO_DB_NAME"
    else
        print_error "Database container is not running"
        exit 1
    fi
}

# Main command handler
case "${1:-start}" in
    start)
        start_db
        ;;
    stop)
        stop_db
        ;;
    restart)
        stop_db
        start_db
        ;;
    destroy)
        destroy_db
        ;;
    status)
        status_db
        ;;
    logs)
        logs_db
        ;;
    psql)
        psql_db
        ;;
    *)
        echo "Portfolio Tracker Development Database"
        echo ""
        echo "Usage: $0 {start|stop|restart|destroy|status|logs|psql}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the development database (default)"
        echo "  stop     - Stop the development database"
        echo "  restart  - Restart the development database"
        echo "  destroy  - Remove the development database container"
        echo "  status   - Show the status of the database container"
        echo "  logs     - Follow the database logs"
        echo "  psql     - Open a psql shell to the database"
        exit 1
        ;;
esac
