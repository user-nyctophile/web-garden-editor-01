
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  isDarkMode: boolean;
}

// Function to safely find language ID based on the input
const getLanguageId = (language: string): string => {
  const languageMap: { [key: string]: string } = {
    html: 'html',
    css: 'css',
    javascript: 'javascript',
    js: 'javascript',
  };
  
  return languageMap[language.toLowerCase()] || 'plaintext';
};

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language, isDarkMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const valueRef = useRef<string>(value);
  
  // Update ref when value changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (containerRef.current) {
      // Initialize the editor with performance optimizations
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language: getLanguageId(language),
        theme: isDarkMode ? 'vs-dark' : 'vs',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: 'Fira Code, monospace',
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        lineNumbers: 'on',
        folding: true,
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        formatOnPaste: true,
        formatOnType: true,
        find: {
          addExtraSpaceOnTop: false,
        },
        // Performance optimizations
        renderWhitespace: 'none',
        renderControlCharacters: false,
        renderIndentGuides: false,
        renderValidationDecorations: 'editable',
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: false,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
      });
      
      // Debounced change event handler
      let debounceTimeout: NodeJS.Timeout | null = null;
      
      editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current?.getValue();
        if (newValue !== undefined && newValue !== valueRef.current) {
          if (debounceTimeout) {
            clearTimeout(debounceTimeout);
          }
          
          // Use debounce for performance
          debounceTimeout = setTimeout(() => {
            onChange(newValue);
          }, 300);
        }
      });
      
      // Clean up editor on component unmount
      return () => {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        if (editorRef.current) {
          editorRef.current.dispose();
        }
      };
    }
  }, [containerRef, language, onChange]);
  
  // Update editor theme when isDarkMode changes
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs');
    }
  }, [isDarkMode]);
  
  // Update editor content if value changes externally
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      // Preserve cursor position when updating
      const position = editorRef.current.getPosition();
      editorRef.current.setValue(value);
      if (position) {
        editorRef.current.setPosition(position);
      }
    }
  }, [value]);
  
  return (
    <div ref={containerRef} className="w-full h-full" />
  );
};

export default CodeEditor;
