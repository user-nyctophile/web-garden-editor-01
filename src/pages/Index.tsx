
import { useState, useEffect, useRef } from "react";
import CodeEditor from "../components/CodeEditor";
import Preview from "../components/Preview";
import Console from "../components/Console";
import Navbar from "../components/Navbar";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { defaultCode } from "../utils/defaultCode";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  // Editor tab styling
  const getTabStyle = (tab: "html" | "css" | "js") => {
    return activeTab === tab 
      ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" 
      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300";
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
      
      <ResizablePanelGroup
        direction={layout === "horizontal" ? "horizontal" : "vertical"}
        className="flex-1 overflow-hidden"
      >
        {/* Editor Panel */}
        <ResizablePanel 
          defaultSize={50} 
          minSize={20}
          className="bg-white dark:bg-gray-900 overflow-hidden"
        >
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-thin">
            {(["html", "css", "js"] as const).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${getTabStyle(tab)}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
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
        </ResizablePanel>
        
        {/* Resize Handle */}
        <ResizableHandle withHandle />
        
        {/* Preview Panel */}
        <ResizablePanel defaultSize={50} minSize={20} className="flex flex-col bg-gray-100 dark:bg-gray-800 overflow-hidden">
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
