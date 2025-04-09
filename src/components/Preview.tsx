
import React, { useRef, useEffect, useState } from 'react';
import { Maximize2, Minimize2, RefreshCw, Loader2, ArrowDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { executeCode } from '../utils/codeExecutor';
import { useIsMobile } from '@/hooks/use-mobile';

interface PreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  autoRun?: boolean;
  onConsoleOutput?: (output: {type: string; message: string}) => void;
  isConsoleVisible?: boolean;
}

const Preview: React.FC<PreviewProps> = ({ 
  htmlCode, 
  cssCode, 
  jsCode, 
  autoRun = false,
  onConsoleOutput,
  isConsoleVisible = false
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<Array<{type: string; message: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMobile = useIsMobile();
  
  const handleConsoleOutput = (output: {type: string; message: string}) => {
    setConsoleMessages(prev => [...prev, output]);
    if (onConsoleOutput) {
      onConsoleOutput(output);
    }
  };
  
  const runCode = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    
    setIsLoading(true);
    setLoadingProgress(10);
    
    let progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 15);
      });
    }, 200);
    
    setConsoleMessages([]);
    setTimeout(() => {
      const cleanup = executeCode(htmlCode, cssCode, jsCode, handleConsoleOutput);
      cleanupRef.current = cleanup;
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }, 800);
  };
  
  useEffect(() => {
    if (autoRun) {
      runCode();
    } else {
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.srcdoc = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100%;
                  margin: 0;
                  color: #666;
                  text-align: center;
                  background-color: #f9f9f9;
                }
                .preview-message {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 80%;
                  max-width: 500px;
                }
                .title {
                  font-size: 1.5rem;
                  margin-bottom: 1rem;
                  color: #333;
                }
                button {
                  padding: 0.75rem 1.5rem;
                  background-color: #4CAF50;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  margin-top: 1rem;
                  font-size: 1rem;
                  transition: background-color 0.2s;
                }
                button:hover {
                  background-color: #3e8e41;
                }
              </style>
            </head>
            <body>
              <div class="preview-message">
                <div class="title">Code Playground Preview</div>
                <p>Click the Run button to execute your code and see the results.</p>
                <p>Create, test, and share your web projects in this interactive environment.</p>
              </div>
            </body>
          </html>
        `;
      }
    }
    
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [autoRun]);
  
  const handleRefresh = () => {
    runCode();
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className={`flex flex-col flex-1 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Live Preview
          </h2>
          {isLoading && (
            <Badge variant="outline" className="animate-pulse flex items-center space-x-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading</span>
            </Badge>
          )}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1"
            title="Run code"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className={isMobile ? "sr-only" : "ml-1"}>Run</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="sr-only">
              {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            </span>
          </Button>
        </div>
      </div>
      
      {isLoading && <Progress value={loadingProgress} className="h-1" />}
      
      <div className={`flex-1 bg-white dark:bg-gray-950 overflow-hidden relative ${isConsoleVisible ? 'pb-[2.5rem+64px]' : ''}`}>
        <iframe
          ref={iframeRef}
          title="preview"
          sandbox="allow-scripts allow-modals"
          className="w-full h-full border-none"
        />
        
        {isMobile && !isLoading && !isFullscreen && (
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleRefresh}
              size="icon"
              className="rounded-full h-12 w-12 bg-green-600 hover:bg-green-700 shadow-lg"
            >
              <Play className="h-6 w-6 text-white" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
