#!/bin/bash

###############################################################################
# SX-HRIS Backend - Health Check Script
# 
# This script performs comprehensive health checks on the backend application.
# Can be used for monitoring, alerting, or load balancer health checks.
#
# Usage:
#   chmod +x scripts/health-check.sh
#   ./scripts/health-check.sh
#
# Exit Codes:
#   0 - All checks passed
#   1 - Health check failed
###############################################################################

set -u  # Exit on undefined variable

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
HEALTH_ENDPOINT="${API_URL}/api/health"
TIMEOUT=10

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Status tracking
CHECKS_PASSED=0
CHECKS_FAILED=0

# Check function
check() {
    local name=$1
    local command=$2
    
    echo -n "Checking $name... "
    
    if eval $command > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    fi
}

# Detailed check function with output
check_detailed() {
    local name=$1
    local command=$2
    
    echo -e "${YELLOW}Checking $name...${NC}"
    
    if result=$(eval $command 2>&1); then
        echo -e "${GREEN}✓ PASS${NC}"
        echo "$result"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "$result"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
        return 1
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SX-HRIS Backend Health Check"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Check if application is listening on port
check "Port 3000 listening" "netstat -tuln | grep -q ':3000'"

# 2. Check HTTP endpoint
if command -v curl > /dev/null; then
    check "HTTP endpoint responding" "curl -f -s -m $TIMEOUT $HEALTH_ENDPOINT"
    
    # Get detailed health response
    echo ""
    echo "Health Endpoint Response:"
    curl -s -m $TIMEOUT $HEALTH_ENDPOINT | python3 -m json.tool 2>/dev/null || curl -s -m $TIMEOUT $HEALTH_ENDPOINT
    echo ""
else
    echo -e "${YELLOW}curl not installed, skipping HTTP check${NC}"
fi

# 3. Check PM2 process status
if command -v pm2 > /dev/null; then
    check_detailed "PM2 process status" "pm2 jlist | grep -q 'sx-hris-backend'"
fi

# 4. Check disk space
check_detailed "Disk space" "df -h | grep -E '^/dev/'"

# 5. Check memory usage
check_detailed "Memory usage" "free -h"

# 6. Check Node.js process
check "Node.js process running" "pgrep -f 'node.*dist/main.js'"

# 7. Check CPU load
if [ -f /proc/loadavg ]; then
    echo -e "${YELLOW}System Load:${NC}"
    cat /proc/loadavg
    echo ""
fi

# 8. Check log files for errors
if [ -d "/home/ec2-user/sx-hris-backend/logs" ]; then
    echo -e "${YELLOW}Recent Errors (last 10):${NC}"
    tail -20 /home/ec2-user/sx-hris-backend/logs/*.log 2>/dev/null | grep -i error | tail -10 || echo "No errors found"
    echo ""
fi

# 9. Check database connectivity (if psql available)
if command -v psql > /dev/null && [ -n "${DB_HOST:-}" ]; then
    check "Database connectivity" "timeout 5 psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME -c 'SELECT 1' > /dev/null 2>&1"
fi

# 10. Check SSL certificate expiry (if HTTPS)
if [[ $API_URL == https://* ]]; then
    echo -e "${YELLOW}SSL Certificate:${NC}"
    echo | openssl s_client -servername ${API_URL#https://} -connect ${API_URL#https://}:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Unable to check SSL certificate"
    echo ""
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Health Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo "  Checks Failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    exit 1
fi
