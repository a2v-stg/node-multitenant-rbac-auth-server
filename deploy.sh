#!/bin/bash

# Admin UI Single Container Deployment Script
set -e

echo "🚀 Admin UI Single Container Deployment"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  build     Build the Docker image"
    echo "  start     Start the application"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      Show application logs"
    echo "  clean     Clean up containers and images"
    echo "  full      Build and start the application"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 full          # Build and start everything"
    echo "  $0 start         # Start existing containers"
    echo "  $0 logs          # Show logs"
    echo "  $0 stop          # Stop containers"
}

# Function to build the application
build_app() {
    echo "🔨 Building Admin UI application..."
    docker-compose build --no-cache
    echo "✅ Build completed successfully!"
}

# Function to start the application
start_app() {
    echo "🚀 Starting Admin UI application..."
    docker-compose up -d
    echo "✅ Application started!"
    echo ""
    echo "📱 Access your application at:"
    echo "   • Main App: http://localhost:3000"
    echo "   • Login: http://localhost:3000/login"
    echo "   • Dashboard: http://localhost:3000/dashboard"
    echo ""
    echo "📊 View logs with: $0 logs"
    echo "🛑 Stop with: $0 stop"
}

# Function to stop the application
stop_app() {
    echo "🛑 Stopping Admin UI application..."
    docker-compose down
    echo "✅ Application stopped!"
}

# Function to restart the application
restart_app() {
    echo "🔄 Restarting Admin UI application..."
    docker-compose restart
    echo "✅ Application restarted!"
}

# Function to show logs
show_logs() {
    echo "📊 Showing Admin UI application logs..."
    docker-compose logs -f
}

# Function to clean up
clean_up() {
    echo "🧹 Cleaning up containers and images..."
    docker-compose down -v --rmi all
    docker system prune -f
    echo "✅ Cleanup completed!"
}

# Function to run full deployment
full_deploy() {
    build_app
    start_app
}

# Main script logic
case "${1:-help}" in
    build)
        build_app
        ;;
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_up
        ;;
    full)
        full_deploy
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo "❌ Unknown option: $1"
        show_usage
        exit 1
        ;;
esac 