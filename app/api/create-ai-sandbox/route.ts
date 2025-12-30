import { NextResponse } from 'next/server';
import { sandboxService } from '@/lib/sandbox-service';

export async function POST() {
  try {
    console.log('[create-ai-sandbox] Creating sandbox...');
    
    const result = await sandboxService.createSandbox();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create sandbox' },
        { status: 500 }
      );
    }
    
    console.log('[create-ai-sandbox] Sandbox created successfully:', result.sandboxId);
    
    return NextResponse.json({
      success: true,
      sandboxId: result.sandboxId,
      url: result.url,
      structure: result.structure,
      message: 'Sandbox created successfully'
    });
  } catch (error) {
    console.error('[create-ai-sandbox] Error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create sandbox',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}