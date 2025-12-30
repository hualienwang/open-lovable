import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/conversation-service';

// GET: Retrieve current conversation state
export async function GET() {
  try {
    const state = conversationService.getConversationState();
    
    if (!state) {
      return NextResponse.json({
        success: true,
        state: null,
        message: 'No active conversation'
      });
    }
    
    return NextResponse.json({
      success: true,
      state
    });
  } catch (error) {
    console.error('[conversation-state] Error getting state:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// POST: Reset or update conversation state
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    switch (action) {
      case 'reset':
        const newState = conversationService.initializeConversation();
        
        console.log('[conversation-state] Reset conversation state');
        
        return NextResponse.json({
          success: true,
          message: 'Conversation state reset',
          state: newState
        });
        
      case 'clear-old':
        conversationService.clearOldConversation();
        
        console.log('[conversation-state] Cleared old conversation data');
        
        return NextResponse.json({
          success: true,
          message: 'Old conversation data cleared'
        });
        
      case 'update':
        const currentState = conversationService.getConversationState();
        if (!currentState) {
          return NextResponse.json({
            success: false,
            error: 'No active conversation to update'
          }, { status: 400 });
        }
        
        // Update specific fields if provided
        if (data) {
          if (data.currentTopic) {
            conversationService.setCurrentTopic(data.currentTopic);
          }
          if (data.userPreferences) {
            conversationService.updateUserPreferences(data.userPreferences);
          }
        }
        
        const updatedState = conversationService.getConversationState();
        
        return NextResponse.json({
          success: true,
          message: 'Conversation state updated',
          state: updatedState
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "reset", "clear-old", or "update"'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('[conversation-state] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// DELETE: Clear conversation state
export async function DELETE() {
  try {
    conversationService.clearOldConversation();
    
    console.log('[conversation-state] Cleared conversation state');
    
    return NextResponse.json({
      success: true,
      message: 'Conversation state cleared'
    });
  } catch (error) {
    console.error('[conversation-state] Error clearing state:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}