// Service class for conversation management
import { ConversationState, ConversationContext } from '@/types/conversation';

export class ConversationService {
  private static instance: ConversationService;
  private conversationState: ConversationState | null = null;
  
  private constructor() {}

  static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  initializeConversation(): ConversationState {
    this.conversationState = {
      conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      startedAt: Date.now(),
      lastUpdated: Date.now(),
      context: {
        messages: [],
        edits: [],
        currentTopic: undefined,
        projectEvolution: {
          initialState: undefined,
          majorChanges: [],
        },
        userPreferences: {
          editStyle: undefined,
          commonRequests: [],
          packagePreferences: [],
        },
      }
    };
    
    return this.conversationState;
  }

  getConversationState(): ConversationState | null {
    return this.conversationState;
  }

  updateConversationState(newState: Partial<ConversationState>): ConversationState | null {
    if (!this.conversationState) {
      return null;
    }
    
    this.conversationState = {
      ...this.conversationState,
      ...newState,
      lastUpdated: Date.now()
    };
    
    return this.conversationState;
  }

  addMessage(role: 'user' | 'assistant', content: string, metadata?: any): void {
    if (!this.conversationState) {
      this.initializeConversation();
    }
    
    if (this.conversationState) {
      this.conversationState.context.messages.push({
        id: Date.now().toString(),
        role,
        content,
        timestamp: Date.now(),
        metadata
      });
      this.conversationState.lastUpdated = Date.now();
    }
  }

  addEdit(edit: {
    timestamp: number;
    userRequest: string;
    editType: string;
    targetFiles: string[];
    confidence: number;
    outcome: 'success' | 'partial' | 'failed';
    errorMessage?: string;
  }): void {
    if (!this.conversationState) {
      this.initializeConversation();
    }
    
    if (this.conversationState) {
      this.conversationState.context.edits.push(edit);
      this.conversationState.lastUpdated = Date.now();
    }
  }

  clearOldConversation(): void {
    this.conversationState = null;
  }

  updateProjectEvolution(description: string, filesAffected: string[]): void {
    if (!this.conversationState) {
      this.initializeConversation();
    }
    
    if (this.conversationState) {
      this.conversationState.context.projectEvolution.majorChanges.push({
        timestamp: Date.now(),
        description,
        filesAffected
      });
      this.conversationState.lastUpdated = Date.now();
    }
  }

  updateUserPreferences(preferences: {
    editStyle?: 'targeted' | 'comprehensive';
    commonRequests?: string[];
    packagePreferences?: string[];
  }): void {
    if (!this.conversationState) {
      this.initializeConversation();
    }
    
    if (this.conversationState) {
      this.conversationState.context.userPreferences = {
        ...this.conversationState.context.userPreferences,
        ...preferences
      };
      this.conversationState.lastUpdated = Date.now();
    }
  }

  getCurrentTopic(): string | undefined {
    return this.conversationState?.context.currentTopic;
  }

  setCurrentTopic(topic: string): void {
    if (!this.conversationState) {
      this.initializeConversation();
    }
    
    if (this.conversationState) {
      this.conversationState.context.currentTopic = topic;
      this.conversationState.lastUpdated = Date.now();
    }
  }
}

export const conversationService = ConversationService.getInstance();