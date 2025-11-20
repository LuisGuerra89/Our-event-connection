#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if .env.local exists
if [ ! -f "$SCRIPTS_DIR/../.env.local" ]; then
    echo -e "${RED}Error: .env.local not found${NC}"
    echo "Please create .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Load environment variables
export $(cat "$SCRIPTS_DIR/../.env.local" | grep -v '#' | xargs)

# Check required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local${NC}"
    exit 1
fi

TOTAL_SCRIPTS=$(ls -1 "$SCRIPTS_DIR"/*.sql 2>/dev/null | wc -l)
COMPLETED=0
FAILED=0
FAILED_FILES=()

echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}Database Migration Runner${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "Supabase URL: ${BLUE}$SUPABASE_URL${NC}"
echo -e "Total scripts to run: ${YELLOW}$TOTAL_SCRIPTS${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Run all SQL scripts in order
for sql_file in "$SCRIPTS_DIR"/*.sql; do
    if [ -f "$sql_file" ]; then
        filename=$(basename "$sql_file")
        script_num=$((COMPLETED + FAILED + 1))
        
        echo -n "[$script_num/$TOTAL_SCRIPTS] Running ${YELLOW}$filename${NC}... "
        
        # Read the SQL file content
        sql_content=$(cat "$sql_file")
        
        # Execute using psql via Supabase connection string
        # Note: You need to have the SUPABASE_DB_URL in your .env.local
        # Format: postgresql://postgres:PASSWORD@REGION.pooler.supabase.com:6543/postgres
        if [ -n "$SUPABASE_DB_URL" ]; then
            if psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$sql_file" &>/dev/null; then
                echo -e "${GREEN}✓${NC}"
                ((COMPLETED++))
            else
                echo -e "${RED}✗${NC}"
                ((FAILED++))
                FAILED_FILES+=("$filename")
            fi
        else
            echo -e "${YELLOW}⚠${NC} (SUPABASE_DB_URL not set)"
        fi
    fi
done

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}Migration Summary${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "Completed: ${GREEN}$COMPLETED/$TOTAL_SCRIPTS${NC}"
echo -e "Failed: ${RED}$FAILED/$TOTAL_SCRIPTS${NC}"

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed scripts:${NC}"
    for failed_file in "${FAILED_FILES[@]}"; do
        echo -e "  ${RED}✗${NC} $failed_file"
    done
fi

echo -e "${BLUE}================================================${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All migrations completed successfully!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some migrations failed. Check the errors above.${NC}"
    exit 1
fi
