'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { appConfig } from '@/config/app.config';
import { ConversationContext } from '@/types/conversation';

export interface SandboxData {
  sandboxId: string;
  url: string;
  [key: string]: any;
}

export interface ChatMessage {
  content: string;
  type: 'user' | 'ai' | 'system' | 'file-update' | 'command' | 'error';
  timestamp: Date;
  metadata?: {
    scrapedUrl?: string;
    scrapedContent?: any;
    generatedCode?: string;
    appliedFiles?: string[];
    commandType?: 'input' | 'output' | 'error' | 'success';
  };
}

export interface CodeApplicationState {
  stage: 'idle' | 'preparing' | 'validating' | 'applying' | 'restarting' | 'completed' | null;
  currentFile?: string;
  totalFiles?: number;
  appliedCount?: number;
  error?: string;
}

export interface GenerationProgress {
  isGenerating: boolean;
  status: string;
  components: Array<{ name: string; path: string; completed: boolean }>;
  currentComponent: number;
  streamedCode: string;
  isStreaming: boolean;
  isThinking: boolean;
  thinkingText?: string;
  thinkingDuration?: number;
  currentFile?: { path: string; content: string; type: string };
  files: Array<{ path: string; content: string; type: string; completed: boolean }>;
  lastProcessedPosition: number;
  isEdit?: boolean;
}

export interface Status {
  text: string;
  active: boolean;
}

export interface LoadingStage {
  gathering: boolean;
  planning: boolean;
  generating: boolean;
}

interface SandboxContextType {
  sandboxData: SandboxData | null;
  setSandboxData: Dispatch<SetStateAction<SandboxData | null>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  status: Status;
  setStatus: Dispatch<SetStateAction<Status>>;
  responseArea: string[];
  setResponseArea: Dispatch<SetStateAction<string[]>>;
  structureContent: string;
  setStructureContent: Dispatch<SetStateAction<string>>;
  promptInput: string;
  setPromptInput: Dispatch<SetStateAction<string>>;
  chatMessages: ChatMessage[];
  setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  aiChatInput: string;
  setAiChatInput: Dispatch<SetStateAction<string>>;
  aiEnabled: boolean;
  aiModel: string;
  setAiModel: Dispatch<SetStateAction<string>>;
  urlOverlayVisible: boolean;
  setUrlOverlayVisible: Dispatch<SetStateAction<boolean>>;
  urlInput: string;
  setUrlInput: Dispatch<SetStateAction<string>>;
  urlStatus: string[];
  setUrlStatus: Dispatch<SetStateAction<string[]>>;
  showHomeScreen: boolean;
  setShowHomeScreen: Dispatch<SetStateAction<boolean>>;
  expandedFolders: Set<string>;
  setExpandedFolders: Dispatch<SetStateAction<Set<string>>>;
  selectedFile: string | null;
  setSelectedFile: Dispatch<SetStateAction<string | null>>;
  homeScreenFading: boolean;
  setHomeScreenFading: Dispatch<SetStateAction<boolean>>;
  homeUrlInput: string;
  setHomeUrlInput: Dispatch<SetStateAction<string>>;
  homeContextInput: string;
  setHomeContextInput: Dispatch<SetStateAction<string>>;
  activeTab: 'generation' | 'preview';
  setActiveTab: Dispatch<SetStateAction<'generation' | 'preview'>>;
  showStyleSelector: boolean;
  setShowStyleSelector: Dispatch<SetStateAction<boolean>>;
  selectedStyle: string | null;
  setSelectedStyle: Dispatch<SetStateAction<string | null>>;
  showLoadingBackground: boolean;
  setShowLoadingBackground: Dispatch<SetStateAction<boolean>>;
  urlScreenshot: string | null;
  setUrlScreenshot: Dispatch<SetStateAction<string | null>>;
  isCapturingScreenshot: boolean;
  setIsCapturingScreenshot: Dispatch<SetStateAction<boolean>>;
  screenshotError: string | null;
  setScreenshotError: Dispatch<SetStateAction<string | null>>;
  isPreparingDesign: boolean;
  setIsPreparingDesign: Dispatch<SetStateAction<boolean>>;
  targetUrl: string;
  setTargetUrl: Dispatch<SetStateAction<string>>;
  loadingStage: 'gathering' | 'planning' | 'generating' | null;
  setLoadingStage: Dispatch<SetStateAction<'gathering' | 'planning' | 'generating' | null>>;
  sandboxFiles: Record<string, string>;
  setSandboxFiles: Dispatch<SetStateAction<Record<string, string>>>;
  fileStructure: string;
  setFileStructure: Dispatch<SetStateAction<string>>;
  conversationContext: ConversationContext;
  setConversationContext: Dispatch<SetStateAction<ConversationContext>>;
  codeApplicationState: CodeApplicationState;
  setCodeApplicationState: Dispatch<SetStateAction<CodeApplicationState>>;
  generationProgress: GenerationProgress;
  setGenerationProgress: Dispatch<SetStateAction<GenerationProgress>>;
  router: any;
  searchParams: any;
}

const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export function useSandbox() {
  const context = useContext(SandboxContext);
  if (context === undefined) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
}

interface SandboxProviderProps {
  children: ReactNode;
  router: any;
  searchParams: any;
}

export function SandboxProvider({ children, router, searchParams }: SandboxProviderProps) {
  const [sandboxData, setSandboxData] = useState<SandboxData | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ text: 'Not connected', active: false });
  const [responseArea, setResponseArea] = useState<string[]>([]);
  const [structureContent, setStructureContent] = useState('No sandbox created yet');
  const [promptInput, setPromptInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      content: 'Welcome! I can help you generate code with full context of your sandbox files and structure. Just start chatting - I\'ll automatically create a sandbox for you if needed!\n\nTip: If you see package errors like "react-router-dom not found", just type "npm install" or "check packages" to automatically install missing packages.',
      type: 'system',
      timestamp: new Date()
    }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiEnabled] = useState(true);
  const [aiModel, setAiModel] = useState(() => {
    const modelParam = searchParams.get('model');
    return appConfig.ai.availableModels.includes(modelParam || '') ? modelParam! : appConfig.ai.defaultModel;
  });
  const [urlOverlayVisible, setUrlOverlayVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlStatus, setUrlStatus] = useState<string[]>([]);
  const [showHomeScreen, setShowHomeScreen] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['app', 'src', 'src/components']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [homeScreenFading, setHomeScreenFading] = useState(false);
  const [homeUrlInput, setHomeUrlInput] = useState('');
  const [homeContextInput, setHomeContextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'generation' | 'preview'>('preview');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showLoadingBackground, setShowLoadingBackground] = useState(false);
  const [urlScreenshot, setUrlScreenshot] = useState<string | null>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [isPreparingDesign, setIsPreparingDesign] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [loadingStage, setLoadingStage] = useState<'gathering' | 'planning' | 'generating' | null>(null);
  const [sandboxFiles, setSandboxFiles] = useState<Record<string, string>>({});
  const [fileStructure, setFileStructure] = useState<string>('');
  
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
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
  });
  
  const [codeApplicationState, setCodeApplicationState] = useState<CodeApplicationState>({
    stage: null
  });
  
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    isGenerating: false,
    status: '',
    components: [],
    currentComponent: 0,
    streamedCode: '',
    isStreaming: false,
    isThinking: false,
    files: [],
    lastProcessedPosition: 0
  });

  const value = {
    sandboxData,
    setSandboxData,
    loading,
    setLoading,
    status,
    setStatus,
    responseArea,
    setResponseArea,
    structureContent,
    setStructureContent,
    promptInput,
    setPromptInput,
    chatMessages,
    setChatMessages,
    aiChatInput,
    setAiChatInput,
    aiEnabled,
    aiModel,
    setAiModel,
    urlOverlayVisible,
    setUrlOverlayVisible,
    urlInput,
    setUrlInput,
    urlStatus,
    setUrlStatus,
    showHomeScreen,
    setShowHomeScreen,
    expandedFolders,
    setExpandedFolders,
    selectedFile,
    setSelectedFile,
    homeScreenFading,
    setHomeScreenFading,
    homeUrlInput,
    setHomeUrlInput,
    homeContextInput,
    setHomeContextInput,
    activeTab,
    setActiveTab,
    showStyleSelector,
    setShowStyleSelector,
    selectedStyle,
    setSelectedStyle,
    showLoadingBackground,
    setShowLoadingBackground,
    urlScreenshot,
    setUrlScreenshot,
    isCapturingScreenshot,
    setIsCapturingScreenshot,
    screenshotError,
    setScreenshotError,
    isPreparingDesign,
    setIsPreparingDesign,
    targetUrl,
    setTargetUrl,
    loadingStage,
    setLoadingStage,
    sandboxFiles,
    setSandboxFiles,
    fileStructure,
    setFileStructure,
    conversationContext,
    setConversationContext,
    codeApplicationState,
    setCodeApplicationState,
    generationProgress,
    setGenerationProgress,
    router,
    searchParams,
  };

  return (
    <SandboxContext.Provider value={value}>
      {children}
    </SandboxContext.Provider>
  );
}