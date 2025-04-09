
import React, { useRef, useEffect } from 'react';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { executeCode } from '../utils/codeExecutor';

interface PreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  autoRun?: boolean;
  onConsoleOutput?: (output: {type: string; message: string}) => void;
}

const Preview: React.FC<PreviewProps> = ({ 
  htmlCode, 
  cssCode, 
  jsCode, 
  autoRun = false,
  onConsoleOutput 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [consoleMessages, setConsoleMessages] = React.useState<Array<{type: string; message: string}>>([]);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  // Handle console output from the iframe
  const handleConsoleOutput = (output: {type: string; message: string}) => {
    setConsoleMessages(prev => [...prev, output]);
    if (onConsoleOutput) {
      onConsoleOutput(output);
    }
  };
  
  // Run the code when explicitly requested
  const runCode = () => {
    // Clean up previous execution if any
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    
    setConsoleMessages([]);
    const cleanup = executeCode(htmlCode, cssCode, jsCode, handleConsoleOutput);
    cleanupRef.current = cleanup;
  };
  
  // Initial execution only if autoRun is true
  useEffect(() => {
    if (autoRun) {
      runCode();
    } else {
      // Just show an empty iframe with a message
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.srcdoc = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  color: #666;
                  text-align: center;
                  background-color: #f9f9f9;
                }
                button {
                  padding: 8px 16px;
                  background-color: #4CAF50;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  margin-top: 16px;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div>
                <p>Click the Run button to execute your code.</p>
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
    // Re-execute code to refresh the preview
    runCode();
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className={`flex flex-col flex-1 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Live Preview
        </h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            title="Run code"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="ml-1">Run</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-gray-950 overflow-auto">
        <iframe
          ref={iframeRef}
          title="preview"
          sandbox="allow-scripts allow-modals"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};

export default Preview;
