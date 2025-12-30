import { useState, useRef, useEffect } from 'react';
import { useSandbox } from './sandbox-context';

interface SandboxOperations {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  chatMessagesRef: React.RefObject<HTMLDivElement>;
  codeDisplayRef: React.RefObject<HTMLDivElement>;
  updateStatus: (text: string, active: boolean) => void;
  log: (message: string, type?: 'info' | 'error' | 'command') => void;
  addChatMessage: (content: string, type: 'user' | 'ai' | 'system' | 'file-update' | 'command' | 'error', metadata?: any) => void;
  checkAndInstallPackages: () => Promise<void>;
  handleSurfaceError: (errors: any[]) => void;
  installPackages: (packages: string[]) => Promise<void>;
  checkSandboxStatus: () => Promise<void>;
  createSandbox: (fromHomeScreen?: boolean) => Promise<void>;
  killSandbox: () => Promise<void>;
  fetchSandboxFiles: () => Promise<void>;
  captureUrlScreenshot: (url: string) => Promise<void>;
  displayStructure: (structure: string) => void;
  toggleFolder: (folderPath: string) => void;
  selectFile: (filePath: string) => void;
  handlePromptSubmit: (e: React.FormEvent) => Promise<void>;
  handleAiChatSubmit: (e: React.FormEvent) => Promise<void>;
  handleUrlSubmit: (e: React.FormEvent) => Promise<void>;
  applyGeneratedCode: (code: string) => Promise<void>;
  handleFileSelect: (filePath: string) => void;
  handleStyleSelect: (style: string) => void;
  handleModelChange: (model: string) => void;
  handleTabChange: (tab: 'generation' | 'preview') => void;
  handleEditIntent: (userRequest: string) => Promise<void>;
  handleFileSearch: (query: string) => Promise<void>;
  handleCodeGeneration: (prompt: string, context?: string) => Promise<void>;
  handleCodeApplication: (code: string) => Promise<void>;
}

export function useSandboxOperations(): SandboxOperations {
  const {
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
    aiModel,
    setAiModel,
    urlInput,
    setUrlInput,
    showHomeScreen,
    setShowHomeScreen,
    expandedFolders,
    setExpandedFolders,
    selectedFile,
    setSelectedFile,
    activeTab,
    setActiveTab,
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
  } = useSandbox();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const codeDisplayRef = useRef<HTMLDivElement>(null);

  const updateStatus = (text: string, active: boolean) => {
    setStatus({ text, active });
  };

  const log = (message: string, type: 'info' | 'error' | 'command' = 'info') => {
    setResponseArea(prev => [...prev, `[${type}] ${message}`]);
  };

  const addChatMessage = (content: string, type: 'user' | 'ai' | 'system' | 'file-update' | 'command' | 'error', metadata?: any) => {
    setChatMessages(prev => {
      // Skip duplicate consecutive system messages
      if (type === 'system' && prev.length > 0) {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.type === 'system' && lastMessage.content === content) {
          return prev; // Skip duplicate
        }
      }
      return [...prev, { content, type, timestamp: new Date(), metadata }];
    });
  };

  const checkAndInstallPackages = async () => {
    if (!sandboxData) {
      addChatMessage('No active sandbox. Create a sandbox first!', 'system');
      return;
    }

    // Vite error checking removed - handled by template setup
    addChatMessage('Sandbox is ready. Vite configuration is handled by the template.', 'system');
  };

  const handleSurfaceError = (errors: any[]) => {
    // Function kept for compatibility but Vite errors are now handled by template

    // Focus the input
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  };

  const installPackages = async (packages: string[]) => {
    if (!sandboxData) {
      addChatMessage('No active sandbox. Create a sandbox first!', 'system');
      return;
    }

    try {
      const response = await fetch('/api/install-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages })
      });

      if (!response.ok) {
        throw new Error(`Failed to install packages: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'command':
                  // Don't show npm install commands - they're handled by info messages
                  if (!data.command.includes('npm install')) {
                    addChatMessage(data.command, 'command', { commandType: 'input' });
                  }
                  break;
                case 'output':
                  addChatMessage(data.message, 'command', { commandType: 'output' });
                  break;
                case 'error':
                  if (data.message && data.message !== 'undefined') {
                    addChatMessage(data.message, 'command', { commandType: 'error' });
                  }
                  break;
                case 'warning':
                  addChatMessage(data.message, 'command', { commandType: 'output' });
                  break;
                case 'success':
                  addChatMessage(`${data.message}`, 'system');
                  break;
                case 'status':
                  addChatMessage(data.message, 'system');
                  break;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      addChatMessage(`Failed to install packages: ${error.message}`, 'system');
    }
  };

  const checkSandboxStatus = async () => {
    try {
      const response = await fetch('/api/sandbox-status');
      const data = await response.json();

      if (data.active && data.healthy && data.sandboxData) {
        setSandboxData(data.sandboxData);
        updateStatus('Sandbox active', true);
      } else if (data.active && !data.healthy) {
        // Sandbox exists but not responding
        updateStatus('Sandbox not responding', false);
        // Optionally try to create a new one
      } else {
        setSandboxData(null);
        updateStatus('No sandbox', false);
      }
    } catch (error) {
      console.error('Failed to check sandbox status:', error);
      setSandboxData(null);
      updateStatus('Error', false);
    }
  };

  const createSandbox = async (fromHomeScreen = false) => {
    console.log('[createSandbox] Starting sandbox creation...');
    setLoading(true);
    setShowLoadingBackground(true);
    updateStatus('Creating sandbox...', false);
    setResponseArea([]);
    setScreenshotError(null);

    try {
      const response = await fetch('/api/create-ai-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      console.log('[createSandbox] Response data:', data);

      if (data.success) {
        setSandboxData(data);
        updateStatus('Sandbox active', true);
        log('Sandbox created successfully!');
        log(`Sandbox ID: ${data.sandboxId}`);
        log(`URL: ${data.url}`);

        // Update URL with sandbox ID
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('sandbox', data.sandboxId);
        newParams.set('model', aiModel);
        router.push(`/?${newParams.toString()}`, { scroll: false });

        // Fade out loading background after sandbox loads
        setTimeout(() => {
          setShowLoadingBackground(false);
        }, 3000);

        if (data.structure) {
          displayStructure(data.structure);
        }

        // Fetch sandbox files after creation
        setTimeout(fetchSandboxFiles, 1000);

        // Restart Vite server to ensure it's running
        setTimeout(async () => {
          try {
            console.log('[createSandbox] Ensuring Vite server is running...');
            const restartResponse = await fetch('/api/restart-vite', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });

            if (restartResponse.ok) {
              const restartData = await restartResponse.json();
              if (restartData.success) {
                console.log('[createSandbox] Vite server started successfully');
              }
            }
          } catch (error) {
            console.error('[createSandbox] Error starting Vite server:', error);
          }
        }, 2000);

        // Only add welcome message if not coming from home screen
        if (!fromHomeScreen) {
          addChatMessage(`Sandbox created! ID: ${data.sandboxId}`, 'system');
        }
      } else {
        throw new Error(data.error || 'Failed to create sandbox');
      }
    } catch (error: any) {
      console.error('[createSandbox] Error:', error);
      addChatMessage(`Failed to create sandbox: ${error.message}`, 'error');
      updateStatus('Failed to create sandbox', false);
    } finally {
      setLoading(false);
    }
  };

  const killSandbox = async () => {
    if (!sandboxData) return;

    try {
      await fetch('/api/kill-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxId: sandboxData.sandboxId })
      });

      setSandboxData(null);
      updateStatus('Sandbox killed', false);
      addChatMessage('Sandbox has been terminated.', 'system');
    } catch (error) {
      console.error('Failed to kill sandbox:', error);
      addChatMessage('Failed to kill sandbox.', 'error');
    }
  };

  const fetchSandboxFiles = async () => {
    if (!sandboxData) return;

    try {
      const response = await fetch(`/api/get-sandbox-files?sandboxId=${sandboxData.sandboxId}`);
      const data = await response.json();

      if (data.success) {
        setSandboxFiles(data.files);
        setFileStructure(data.structure);
      }
    } catch (error) {
      console.error('Failed to fetch sandbox files:', error);
    }
  };

  const captureUrlScreenshot = async (url: string) => {
    if (!url || isCapturingScreenshot) return;

    setIsCapturingScreenshot(true);
    setScreenshotError(null);

    try {
      const response = await fetch('/api/scrape-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`Failed to capture screenshot: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.screenshot) {
        setUrlScreenshot(data.screenshot);
      } else {
        throw new Error(data.error || 'No screenshot returned');
      }
    } catch (error: any) {
      console.error('Screenshot capture failed:', error);
      setScreenshotError(error.message);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const displayStructure = (structure: string) => {
    setStructureContent(structure);
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const selectFile = (filePath: string) => {
    setSelectedFile(filePath);
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || loading) return;

    const currentPrompt = promptInput;
    setPromptInput('');

    addChatMessage(currentPrompt, 'user');

    try {
      // Process the prompt
      addChatMessage('Processing your request...', 'system');
    } catch (error: any) {
      addChatMessage(`Error processing prompt: ${error.message}`, 'error');
    }
  };

  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim() || loading) return;

    const currentInput = aiChatInput;
    setAiChatInput('');

    addChatMessage(currentInput, 'user');

    try {
      // Stream AI response
      const response = await fetch('/api/generate-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentInput,
          sandboxId: sandboxData?.sandboxId,
          model: aiModel,
          conversationContext: conversationContext
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI response: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'message') {
                  aiResponse += data.content;
                  addChatMessage(data.content, 'ai');
                } else if (data.type === 'code') {
                  // Handle code generation
                  setGenerationProgress(prev => ({
                    ...prev,
                    isGenerating: true,
                    status: 'Generating code...',
                    streamedCode: data.code,
                    isStreaming: true
                  }));
                } else if (data.type === 'error') {
                  addChatMessage(data.message, 'error');
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }

      if (aiResponse) {
        addChatMessage(aiResponse, 'ai');
      }
    } catch (error: any) {
      addChatMessage(`Error getting AI response: ${error.message}`, 'error');
    } finally {
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false
      }));
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const currentUrl = urlInput;
    setUrlInput('');

    addChatMessage(`Scraping URL: ${currentUrl}`, 'system');

    try {
      const response = await fetch('/api/scrape-url-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentUrl })
      });

      if (!response.ok) {
        throw new Error(`Failed to scrape URL: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        addChatMessage(`Successfully scraped: ${currentUrl}`, 'system', {
          scrapedUrl: currentUrl,
          scrapedContent: data.content
        });

        // Update conversation context with scraped content
        setConversationContext(prev => ({
          ...prev,
          messages: [...prev.messages, {
            id: Date.now().toString(),
            role: 'user',
            content: `Scraped content from ${currentUrl}: ${JSON.stringify(data.content)}`,
            timestamp: Date.now()
          }]
        }));
      } else {
        throw new Error(data.error || 'Failed to scrape URL');
      }
    } catch (error: any) {
      addChatMessage(`Error scraping URL: ${error.message}`, 'error');
    }
  };

  const applyGeneratedCode = async (code: string) => {
    if (!sandboxData || !code) return;

    try {
      setCodeApplicationState({
        stage: 'preparing',
        currentFile: 'Starting code application',
        totalFiles: 1,
        appliedCount: 0,
        error: undefined
      });

      const response = await fetch('/api/apply-ai-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          sandboxId: sandboxData.sandboxId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to apply code: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setCodeApplicationState({
          stage: 'completed',
          currentFile: 'Code applied successfully',
          totalFiles: 1,
          appliedCount: 1,
          error: undefined
        });

        addChatMessage('Code applied successfully!', 'system', {
          appliedFiles: result.appliedFiles
        });

        // Refresh sandbox files after applying code
        setTimeout(fetchSandboxFiles, 500);
      } else {
        throw new Error(result.error || 'Failed to apply code');
      }
    } catch (error: any) {
      setCodeApplicationState({
        stage: 'completed',
        currentFile: 'Error applying code',
        totalFiles: 1,
        appliedCount: 0,
        error: error.message
      });
      addChatMessage(`Error applying code: ${error.message}`, 'error');
    }
  };

  const handleFileSelect = (filePath: string) => {
    selectFile(filePath);
  };

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
  };

  const handleModelChange = (model: string) => {
    setAiModel(model);
    
    // Update URL with new model
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('model', model);
    router.push(`/?${newParams.toString()}`, { scroll: false });
  };

  const handleTabChange = (tab: 'generation' | 'preview') => {
    setActiveTab(tab);
  };

  const handleEditIntent = async (userRequest: string) => {
    try {
      const response = await fetch('/api/analyze-edit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRequest,
          sandboxFiles,
          fileStructure
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze edit intent: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error analyzing edit intent:', error);
      addChatMessage(`Error analyzing edit intent: ${error.message}`, 'error');
      return null;
    }
  };

  const handleFileSearch = async (query: string) => {
    try {
      const response = await fetch('/api/file-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sandboxFiles })
      });

      if (!response.ok) {
        throw new Error(`Failed to search files: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error searching files:', error);
      addChatMessage(`Error searching files: ${error.message}`, 'error');
      return null;
    }
  };

  const handleCodeGeneration = async (prompt: string, context?: string) => {
    try {
      setGenerationProgress({
        isGenerating: true,
        status: 'Starting generation...',
        components: [],
        currentComponent: 0,
        streamedCode: '',
        isStreaming: false,
        isThinking: true,
        thinkingText: 'Analyzing your request...',
        files: [],
        lastProcessedPosition: 0
      });

      const response = await fetch('/api/generate-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context,
          sandboxId: sandboxData?.sandboxId,
          model: aiModel
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate code: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case 'thinking':
                    setGenerationProgress(prev => ({
                      ...prev,
                      isThinking: true,
                      thinkingText: data.text,
                      thinkingDuration: data.duration
                    }));
                    break;
                  case 'status':
                    setGenerationProgress(prev => ({
                      ...prev,
                      status: data.message
                    }));
                    break;
                  case 'file':
                    setGenerationProgress(prev => ({
                      ...prev,
                      files: [...prev.files, data.file],
                      currentFile: data.file
                    }));
                    break;
                  case 'code':
                    setGenerationProgress(prev => ({
                      ...prev,
                      streamedCode: prev.streamedCode + data.content,
                      isStreaming: true
                    }));
                    break;
                  case 'complete':
                    setGenerationProgress(prev => ({
                      ...prev,
                      isGenerating: false,
                      isStreaming: false,
                      isThinking: false
                    }));
                    break;
                  case 'error':
                    addChatMessage(data.message, 'error');
                    setGenerationProgress(prev => ({
                      ...prev,
                      isGenerating: false,
                      isStreaming: false,
                      isThinking: false
                    }));
                    break;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error generating code:', error);
      addChatMessage(`Error generating code: ${error.message}`, 'error');
      setGenerationProgress(prev => ({
        ...prev,
        isGenerating: false,
        isStreaming: false,
        isThinking: false
      }));
    }
  };

  const handleCodeApplication = async (code: string) => {
    if (!sandboxData || !code) return;

    try {
      setCodeApplicationState({
        stage: 'preparing',
        currentFile: 'Starting code application',
        totalFiles: 1,
        appliedCount: 0,
        error: undefined
      });

      const response = await fetch('/api/apply-ai-code-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          sandboxId: sandboxData.sandboxId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to apply code: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case 'stage':
                    setCodeApplicationState(prev => ({
                      ...prev,
                      stage: data.stage,
                      currentFile: data.currentFile || prev.currentFile
                    }));
                    break;
                  case 'progress':
                    setCodeApplicationState(prev => ({
                      ...prev,
                      appliedCount: data.appliedCount,
                      totalFiles: data.totalFiles
                    }));
                    break;
                  case 'complete':
                    setCodeApplicationState({
                      stage: 'completed',
                      currentFile: 'Code applied successfully',
                      totalFiles: data.totalFiles || 1,
                      appliedCount: data.totalFiles || 1,
                      error: undefined
                    });
                    break;
                  case 'error':
                    setCodeApplicationState(prev => ({
                      ...prev,
                      stage: 'completed',
                      error: data.message
                    }));
                    addChatMessage(data.message, 'error');
                    break;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }

      // Refresh sandbox files after applying code
      setTimeout(fetchSandboxFiles, 500);
    } catch (error: any) {
      setCodeApplicationState({
        stage: 'completed',
        error: error.message
      });
      addChatMessage(`Error applying code: ${error.message}`, 'error');
    }
  };

  return {
    iframeRef,
    chatMessagesRef,
    codeDisplayRef,
    updateStatus,
    log,
    addChatMessage,
    checkAndInstallPackages,
    handleSurfaceError,
    installPackages,
    checkSandboxStatus,
    createSandbox,
    killSandbox,
    fetchSandboxFiles,
    captureUrlScreenshot,
    displayStructure,
    toggleFolder,
    selectFile,
    handlePromptSubmit,
    handleAiChatSubmit,
    handleUrlSubmit,
    applyGeneratedCode,
    handleFileSelect,
    handleStyleSelect,
    handleModelChange,
    handleTabChange,
    handleEditIntent,
    handleFileSearch,
    handleCodeGeneration,
    handleCodeApplication
  };
}