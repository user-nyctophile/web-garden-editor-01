
import React, { useRef, useEffect } from 'react';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

const Preview: React.FC<PreviewProps> = ({ htmlCode, cssCode, jsCode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  useEffect(() => {
    updatePreview();
  }, [htmlCode, cssCode, jsCode]);
  
  const updatePreview = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;
    
    // Clear the document
    iframeDoc.open();
    
    // Write the HTML, CSS and JavaScript to the iframe
    const combinedCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>
            // Capture console output
            const originalConsole = window.console;
            function captureConsole(type) {
              return function(...args) {
                originalConsole[type](...args);
                const message = args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                window.parent.postMessage({ type, message }, '*');
              };
            }
            
            console.log = captureConsole('log');
            console.warn = captureConsole('warn');
            console.error = captureConsole('error');
            console.info = captureConsole('info');
            
            // Catch global errors
            window.onerror = function(message, source, lineno, colno, error) {
              window.parent.postMessage({ 
                type: 'error', 
                message: \`\${message}\nLine: \${lineno}\`
              }, '*');
              return true;
            };
            
            // Run user JavaScript
            try {
              ${jsCode}
            } catch (error) {
              console.error(error.message);
            }
          </script>
        </body>
      </html>
    `;
    
    iframeDoc.write(combinedCode);
    iframeDoc.close();
  };
  
  const handleRefresh = () => {
    updatePreview();
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
