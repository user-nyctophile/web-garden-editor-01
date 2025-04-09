
import React from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConsoleProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  output: Array<{type: string; message: string}>;
}

const Console: React.FC<ConsoleProps> = ({ isVisible, setIsVisible, output }) => {
  const getLogStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-500 dark:text-red-400 font-medium';
      case 'warn':
        return 'text-orange-500 dark:text-orange-400';
      case 'info':
        return 'text-blue-500 dark:text-blue-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isVisible ? 'h-1/3 max-h-1/3' : 'h-10'}`}>
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-700 dark:text-gray-300 font-medium"
        >
          Console {isVisible ? <ChevronDown className="h-4 w-4 ml-1" /> : <ChevronUp className="h-4 w-4 ml-1" />}
        </Button>
        <div className="flex gap-2">
          {isVisible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {isVisible && (
        <div className="h-[calc(100%-2.5rem)] overflow-y-auto p-2 font-mono text-sm bg-gray-50 dark:bg-gray-950">
          {output.length > 0 ? (
            output.map((log, index) => (
              <div 
                key={index}
                className={`py-1 px-2 border-b border-gray-100 dark:border-gray-800 ${getLogStyle(log.type)}`}
              >
                <span className="mr-2">{getIconForType(log.type)}</span>
                <pre className="whitespace-pre-wrap font-mono text-xs inline">{log.message}</pre>
              </div>
            ))
          ) : (
            <div className="text-gray-400 dark:text-gray-600 italic p-2">
              Console is empty. Run your code to see output here.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Console;
