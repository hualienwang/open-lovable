#!/bin/bash

# Script to rollback the migration and restore original files

echo "Starting rollback of migration..."

# Check if backup files exist
if [ ! -f /workspace/app/page.tsx.backup ] || [ ! -f /workspace/app/api/create-ai-sandbox/route.ts.backup ] || [ ! -f /workspace/app/api/conversation-state/route.ts.backup ]; then
    echo "Error: Backup files not found. Cannot rollback."
    exit 1
fi

# Restore original files
echo "Restoring original files from backups..."
cp /workspace/app/page.tsx.backup /workspace/app/page.tsx
cp /workspace/app/api/create-ai-sandbox/route.ts.backup /workspace/app/api/create-ai-sandbox/route.ts
cp /workspace/app/api/conversation-state/route.ts.backup /workspace/app/api/conversation-state/route.ts

# Remove the refactored files
rm -f /workspace/app/page-new.tsx
rm -f /workspace/app/api/create-ai-sandbox/route-new.ts
rm -f /workspace/app/api/conversation-state/route-new.ts

# Remove backup files
rm -f /workspace/app/page.tsx.backup
rm -f /workspace/app/api/create-ai-sandbox/route.ts.backup
rm -f /workspace/app/api/conversation-state/route.ts.backup

echo "Rollback completed successfully!"
echo ""
echo "Original files have been restored."