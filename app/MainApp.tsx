'use client';

import { useEffect } from 'react';
import { useSandbox } from '@/lib/sandbox-context';
import { useSandboxOperations } from '../lib/use-sandbox-operations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  FiFile, 
  FiChevronRight, 
  FiChevronDown,
  FiGithub,
  BsFolderFill, 
  BsFolder2Open,
  SiJavascript, 
  SiReact, 
  SiCss3, 
  SiJson 
} from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import CodeApplicationProgress from '@/components/CodeApplicationProgress';
import HomeScreen from '@/components/HomeScreen';
import CodeGenerationDisplay from '@/components/CodeGenerationDisplay';
import ChatMessages from '@/components/ChatMessages';
import SandboxPreview from '@/components/SandboxPreview';

export function MainApp() {
  const {
    loading,
    status,
    promptInput,
    setPromptInput,
    aiChatInput,
    setAiChatInput,
    aiEnabled,
    aiModel,
    setAiModel,
    showHomeScreen,
    setShowHomeScreen,
    homeScreenFading,
    setHomeScreenFading,
    homeUrlInput,
    setHomeUrlInput,
    homeContextInput,
    setHomeContextInput,
    activeTab,
    setActiveTab,
    showLoadingBackground,
    urlScreenshot,
    isCapturingScreenshot,
    screenshotError,
    expandedFolders,
    selectedFile,
    chatMessages,
    codeApplicationState,
    generationProgress,
    conversationContext,
    router,
    searchParams,
  } = useSandbox();

  const {
    chatMessagesRef,
    updateStatus,
    addChatMessage,
    checkSandboxStatus,
    createSandbox,
    fetchSandboxFiles,
    toggleFolder,
    selectFile,
    handlePromptSubmit,
    handleAiChatSubmit,
    handleFileSelect,
    handleTabChange,
    captureUrlScreenshot
  } = useSandboxOperations();

  // Clear old conversation data on component mount and create/restore sandbox
  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
      // Clear old conversation
      try {
        await fetch('/api/conversation-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear-old' })
        });
        console.log('[home] Cleared old conversation data on mount');
      } catch (error) {
        console.error('[ai-sandbox] Failed to clear old conversation:', error);
        if (isMounted) {
          addChatMessage('Failed to clear old conversation data.', 'error');
        }
      }
      
      if (!isMounted) return;

      // Check if sandbox ID is in URL
      const sandboxIdParam = searchParams.get('sandbox');
      
      // setLoading(true);
      try {
        if (sandboxIdParam) {
          console.log('[home] Attempting to restore sandbox:', sandboxIdParam);
          // For now, just create a new sandbox - you could enhance this to actually restore
          // the specific sandbox if your backend supports it
          await createSandbox(true);
        } else {
          console.log('[home] No sandbox in URL, creating new sandbox automatically...');
          await createSandbox(true);
        }
      } catch (error) {
        console.error('[ai-sandbox] Failed to create or restore sandbox:', error);
        if (isMounted) {
          addChatMessage('Failed to create or restore sandbox.', 'error');
        }
      } finally {
        if (isMounted) {
          // setLoading(false);
        }
      }
    };
    
    initializePage();

    return () => {
      isMounted = false;
    };
  }, []); // Run only on mount

  useEffect(() => {
    // Handle Escape key for home screen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHomeScreen) {
        setHomeScreenFading(true);
        setTimeout(() => {
          setShowHomeScreen(false);
          setHomeScreenFading(false);
        }, 500);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHomeScreen]);

  // Start capturing screenshot if URL is provided on mount (from home screen)
  useEffect(() => {
    if (!showHomeScreen && homeUrlInput && !urlScreenshot && !isCapturingScreenshot) {
      let screenshotUrl = homeUrlInput.trim();
      if (!screenshotUrl.match(/^https?:\/\//i)) {
        screenshotUrl = 'https://' + screenshotUrl;
      }
      captureUrlScreenshot(screenshotUrl);
    }
  }, [showHomeScreen, homeUrlInput]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Only check sandbox status on mount and when user navigates to the page
    checkSandboxStatus();
    
    // Optional: Check status when window regains focus
    const handleFocus = () => {
      checkSandboxStatus();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Render the UI based on current state
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading overlay */}
      <AnimatePresence>
        {showLoadingBackground && (
          <motion.div
            className="fixed inset-0 bg-white z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg text-gray-700">Creating your AI sandbox...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main application */}
      <div className="flex h-screen">
        {/* Sidebar - File explorer */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Files</h2>
            <p className="text-sm text-gray-500">Sandbox ID: {status.active ? 'Active' : 'Inactive'}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Project Structure
            </div>
            <div className="text-sm text-gray-700 font-mono">
              {/* This would be replaced with actual file structure */}
              <div className="mb-1 text-blue-600">/app</div>
              <div className="ml-4 mb-1 text-blue-600">page.tsx</div>
              <div className="ml-4 mb-1 text-blue-600">layout.tsx</div>
              <div className="mb-1 text-blue-600">/components</div>
              <div className="ml-4 mb-1 text-gray-700">ChatMessages.tsx</div>
              <div className="ml-4 mb-1 text-gray-700">CodeGenerationDisplay.tsx</div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center ${status.active ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${status.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">{status.text}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant={activeTab === 'preview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTabChange('preview')}
                  >
                    Preview
                  </Button>
                  <Button
                    variant={activeTab === 'generation' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTabChange('generation')}
                  >
                    Code Generation
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-3">Claude 3</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHomeScreen(true)}
                >
                  New Project
                </Button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Preview pane */}
            <div className="flex-1 border-r border-gray-200">
              <SandboxPreview />
            </div>

            {/* Chat and code generation pane */}
            <div className="w-96 flex flex-col border-l border-gray-200">
              <div className="flex-1 overflow-y-auto" ref={chatMessagesRef}>
                <ChatMessages 
                  chatMessages={chatMessages}
                  codeApplicationState={codeApplicationState}
                  generationProgress={generationProgress}
                  conversationContext={conversationContext}
                  chatMessagesRef={chatMessagesRef}
                />
              </div>

              {/* Input area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <form onSubmit={handleAiChatSubmit} className="space-y-3">
                  <Textarea
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder="Ask AI to generate or modify code..."
                    className="w-full min-h-[100px]"
                    disabled={!aiEnabled || loading}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!aiEnabled || loading || !aiChatInput.trim()}
                  >
                    {loading ? 'Processing...' : 'Send to AI'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Home screen overlay */}
      <AnimatePresence>
        {showHomeScreen && (
          <HomeScreen 
            visible={showHomeScreen} 
            fading={homeScreenFading}
            onClose={() => {
              setHomeScreenFading(true);
              setTimeout(() => {
                setShowHomeScreen(false);
                setHomeScreenFading(false);
              }, 500);
            }}
            onUrlChange={(url) => setHomeUrlInput(url)}
            onContextChange={(context) => setHomeContextInput(context)}
          />
        )}
      </AnimatePresence>

      {/* Code generation display */}
      <AnimatePresence>
        {generationProgress.isGenerating && (
          <CodeGenerationDisplay 
            progress={generationProgress}
            onClose={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Code application progress */}
      <AnimatePresence>
        {codeApplicationState.stage && (
          <CodeApplicationProgress state={codeApplicationState} />
        )}
      </AnimatePresence>
    </div>
  );
}