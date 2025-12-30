#!/bin/bash

# Script to migrate the refactored code to replace the original files

echo "Starting migration of refactored code..."

# Backup original files
echo "Creating backups of original files..."
cp /workspace/app/page.tsx /workspace/app/page.tsx.backup
cp /workspace/app/api/create-ai-sandbox/route.ts /workspace/app/api/create-ai-sandbox/route.ts.backup
cp /workspace/app/api/conversation-state/route.ts /workspace/app/api/conversation-state/route.ts.backup

# Replace original files with refactored versions
echo "Replacing original files with refactored versions..."
cp /workspace/app/page-new.tsx /workspace/app/page.tsx
cp /workspace/app/api/create-ai-sandbox/route-new.ts /workspace/app/api/create-ai-sandbox/route.ts
cp /workspace/app/api/conversation-state/route-new.ts /workspace/app/api/conversation-state/route.ts

# Update the page.tsx to use the new MainApp component
echo "Updating page.tsx to use new structure..."
cat > /workspace/app/page.tsx << 'EOF'
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SandboxProvider } from '@/lib/sandbox-context';
import { MainApp } from './MainApp';

export default function AISandboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <SandboxProvider router={router} searchParams={searchParams}>
      <MainApp />
    </SandboxProvider>
  );
}
EOF

echo "Migration completed successfully!"
echo ""
echo "Summary of changes:"
echo "1. Backed up original files with .backup extension"
echo "2. Replaced main page with context provider and MainApp component"
echo "3. Updated create-ai-sandbox API route to use SandboxService"
echo "4. Updated conversation-state API route to use ConversationService"
echo ""
echo "To rollback, run: ./rollback-migration.sh"