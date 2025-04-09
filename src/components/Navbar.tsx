
import React from "react";
import { Play, RotateCcw, Save, Share2, Download, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onRun: () => void;
  onReset: () => void;
  onSave: () => void;
  onShare: () => void;
  onDownload: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isLoading: boolean;
  toggleLayout: () => void;
  layout: "horizontal" | "vertical";
}

const Navbar: React.FC<NavbarProps> = ({
  onRun,
  onReset,
  onSave,
  onShare,
  onDownload,
  isDarkMode,
  toggleTheme,
  isLoading,
  toggleLayout,
  layout
}) => {
  return (
    <header className="flex justify-between items-center p-2 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 ml-2">
          <span className="text-blue-600 dark:text-blue-400">Code</span>Playground
        </h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex"
          onClick={toggleLayout}
          title={`Switch to ${layout === "horizontal" ? "vertical" : "horizontal"} layout`}
        >
          <Monitor className="h-4 w-4 mr-1" />
          {layout === "horizontal" ? "Vertical" : "Horizontal"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="hidden sm:flex"
          title={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        
        <div className="hidden sm:block border-r border-gray-300 dark:border-gray-700 h-6 mx-2" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          className="hidden sm:flex"
          title="Save code (Ctrl+S)"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="hidden sm:flex"
          title="Share code"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          className="hidden sm:flex"
          title="Download as ZIP"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="hidden sm:flex"
          title="Reset code"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={onRun}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
          title="Run code (Ctrl+Enter)"
        >
          <Play className="h-4 w-4 mr-1" />
          Run
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
