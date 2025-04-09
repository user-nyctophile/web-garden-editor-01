
import React, { useRef, useEffect } from 'react';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { executeCode } from '../utils/codeExecutor';

interface PreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

const Preview: React.FC<PreviewProps> = ({ htmlCode, cssCode, jsCode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [consoleMessages, setConsoleMessages] = React.useState<Array<{type: string; message: string}>>([]);
  
  useEffect(() => {
    // Use the codeExecutor utility to safely update the iframe content
    const cleanup = executeCode(htmlCode, cssCode, jsCode, (output) => {
      // Handle console output from the iframe
      setConsoleMessages(prev => [...prev, output]);
    });
    
    // Cleanup function
    return cleanup;
  }, [htmlCode, cssCode, jsCode]);
  
  const handleRefresh = () => {
    // Re-execute code to refresh the preview
    setConsoleMessages([]);
    executeCode(htmlCode, cssCode, jsCode, (output) => {
      setConsoleMessages(prev => [...prev, output]);
    });
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
            title="Refresh preview"
          >
            <RefreshCw className="h-4 w-4" />
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
