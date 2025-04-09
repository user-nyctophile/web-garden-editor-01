
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { editor } from 'monaco-editor';

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
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      // Initialize the editor
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
      });
      
      // Set up change event handler
      editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current?.getValue();
        if (newValue !== undefined) {
          onChange(newValue);
        }
      });
      
      // Clean up editor on component unmount
      return () => {
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
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);
  
  return (
    <div ref={containerRef} className="w-full h-full" />
  );
};

export default CodeEditor;
