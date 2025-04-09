
import { useState, useEffect, useRef } from "react";
import CodeEditor from "../components/CodeEditor";
import Preview from "../components/Preview";
import Console from "../components/Console";
import Navbar from "../components/Navbar";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { defaultCode } from "../utils/defaultCode";
import { executeCode } from "../utils/codeExecutor";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [htmlCode, setHtmlCode] = useLocalStorage("playground-html", defaultCode.html);
  const [cssCode, setCssCode] = useLocalStorage("playground-css", defaultCode.css);
  const [jsCode, setJsCode] = useLocalStorage("playground-js", defaultCode.js);
  const [isConsoleVisible, setIsConsoleVisible] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<Array<{type: string; message: string}>>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [layout, setLayout] = useState<"vertical" | "horizontal">("horizontal");
  const resizeRef = useRef<HTMLDivElement>(null);
  const [splitPosition, setSplitPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleRun = () => {
    setIsLoading(true);
    setConsoleOutput([]);
    
    try {
      // This will now be handled by the Preview component
      toast({
        title: "Code executed",
        description: "Your code has been executed successfully.",
      });
    } catch (error) {
      if (error instanceof Error) {
        setConsoleOutput(prev => [...prev, { type: "error", message: error.message }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all code? This action cannot be undone.")) {
      setHtmlCode(defaultCode.html);
      setCssCode(defaultCode.css);
      setJsCode(defaultCode.js);
      setConsoleOutput([]);
      toast({
        title: "Code reset",
        description: "All code has been reset to default.",
      });
    }
  };

  const handleSave = () => {
    // This is already handled by useLocalStorage
    toast({
      title: "Code saved",
      description: "Your code has been saved to local storage.",
    });
  };

  const handleShare = () => {
    const data = {
      html: htmlCode,
      css: cssCode,
      js: jsCode
    };
    
    // Create a shareable URL by encoding the data
    const encoded = btoa(JSON.stringify(data));
    const shareableUrl = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "Shareable URL has been copied to clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy URL. Please try again.",
          variant: "destructive"
        });
      });
  };

  const handleDownload = () => {
    const zip = require('jszip')();
    zip.file("index.html", htmlCode);
    zip.file("styles.css", cssCode);
    zip.file("script.js", jsCode);
    
    zip.generateAsync({ type: "blob" }).then((content: Blob) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'code-playground.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startPosition = layout === "horizontal" 
      ? e.clientX 
      : e.clientY;
    const startSize = splitPosition;
    
    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = layout === "horizontal"
        ? ((e.clientX - containerRect.left) / containerRect.width) * 100
        : ((e.clientY - containerRect.top) / containerRect.height) * 100;
      
      setSplitPosition(Math.min(Math.max(newPosition, 20), 80)); // Constrain between 20% and 80%
    };
    
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const toggleLayout = () => {
    setLayout(prev => prev === "horizontal" ? "vertical" : "horizontal");
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle("dark");
  };

  // Handle URL params for shared code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get("code");
    
    if (sharedCode) {
      try {
        const decoded = JSON.parse(atob(sharedCode));
        if (decoded.html) setHtmlCode(decoded.html);
        if (decoded.css) setCssCode(decoded.css);
        if (decoded.js) setJsCode(decoded.js);
        
        // Clean up URL after loading
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Failed to parse shared code:", error);
      }
    }
  }, []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'enter':
            e.preventDefault();
            handleRun();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [htmlCode, cssCode, jsCode]);

  const handleConsoleOutput = (output: {type: string; message: string}) => {
    setConsoleOutput(prev => [...prev, output]);
    if (output.type === 'error') {
      setIsConsoleVisible(true);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Navbar 
        onRun={handleRun} 
        onReset={handleReset}
        onSave={handleSave}
        onShare={handleShare}
        onDownload={handleDownload}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        isLoading={isLoading}
        toggleLayout={toggleLayout}
        layout={layout}
      />
      
      <div
        ref={containerRef}
        className={`flex flex-1 ${layout === "horizontal" ? "flex-row" : "flex-col"} overflow-hidden`}
      >
        {/* Editor Section */}
        <div 
          className="bg-white dark:bg-gray-900 overflow-hidden"
          style={{ 
            flex: `0 0 ${splitPosition}%`,
            maxWidth: layout === "horizontal" ? `${splitPosition}%` : "100%",
            maxHeight: layout === "vertical" ? `${splitPosition}%` : "100%"
          }}
        >
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "html" ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "text-gray-600 dark:text-gray-400"}`}
              onClick={() => setActiveTab("html")}
            >
              HTML
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "css" ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "text-gray-600 dark:text-gray-400"}`}
              onClick={() => setActiveTab("css")}
            >
              CSS
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "js" ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "text-gray-600 dark:text-gray-400"}`}
              onClick={() => setActiveTab("js")}
            >
              JavaScript
            </button>
          </div>
          
          <div className="h-[calc(100%-2.5rem)] overflow-hidden">
            {activeTab === "html" && (
              <CodeEditor
                value={htmlCode}
                onChange={setHtmlCode}
                language="html"
                isDarkMode={isDarkMode}
              />
            )}
            {activeTab === "css" && (
              <CodeEditor
                value={cssCode}
                onChange={setCssCode}
                language="css"
                isDarkMode={isDarkMode}
              />
            )}
            {activeTab === "js" && (
              <CodeEditor
                value={jsCode}
                onChange={setJsCode}
                language="javascript"
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
        
        {/* Resizer */}
        <div
          ref={resizeRef}
          className={`flex-none cursor-${layout === "horizontal" ? "col" : "row"}-resize bg-gray-200 dark:bg-gray-700 hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors ${layout === "horizontal" ? "w-1" : "h-1"}`}
          onMouseDown={startResize}
        />
        
        {/* Preview Section */}
        <div className="flex flex-col flex-1 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <Preview
            htmlCode={htmlCode}
            cssCode={cssCode}
            jsCode={jsCode}
            autoRun={false}
            onConsoleOutput={handleConsoleOutput}
          />
          
          <Console
            isVisible={isConsoleVisible}
            setIsVisible={setIsConsoleVisible}
            output={consoleOutput}
          />
        </div>
      </div>
      
      {/* Floating Action Button (Mobile) */}
      <div className="md:hidden fixed right-6 bottom-6 flex flex-col gap-2">
        <button
          onClick={handleRun}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
        >
          Run
        </button>
      </div>
    </div>
  );
};

export default Index;
