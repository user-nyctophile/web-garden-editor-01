
interface ConsoleOutput {
  type: string;
  message: string;
}

export const executeCode = (
  html: string, 
  css: string, 
  js: string, 
  onConsoleOutput: (output: ConsoleOutput) => void
) => {
  // Get the iframe element
  const iframe = document.querySelector('iframe');
  if (!iframe) return () => {};
  
  // Create a combined HTML document
  const combinedCode = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
        <script>
          // Override console methods to send them to parent
          const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
          };
          
          // Redirect all console methods to send messages to parent
          console.log = (...args) => {
            originalConsole.log(...args);
            window.parent.postMessage({
              type: 'log',
              message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ')
            }, '*');
          };
          
          console.warn = (...args) => {
            originalConsole.warn(...args);
            window.parent.postMessage({
              type: 'warn',
              message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ')
            }, '*');
          };
          
          console.error = (...args) => {
            originalConsole.error(...args);
            window.parent.postMessage({
              type: 'error',
              message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ')
            }, '*');
          };
          
          console.info = (...args) => {
            originalConsole.info(...args);
            window.parent.postMessage({
              type: 'info',
              message: args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ')
            }, '*');
          };
          
          // Catch global errors
          window.onerror = (message, source, lineno, colno, error) => {
            window.parent.postMessage({
              type: 'error',
              message: \`\${message} (line \${lineno}, col \${colno})\`
            }, '*');
            return true; // Prevent default handling
          };
        </script>
      </head>
      <body>${html}
        <script>
          try {
            ${js}
          } catch (error) {
            console.error(error.message);
          }
        </script>
      </body>
    </html>
  `;
  
  // Set up message event listener for console output from iframe
  const messageHandler = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object' && 'type' in event.data && 'message' in event.data) {
      const { type, message } = event.data;
      onConsoleOutput({ type, message });
    }
  };

  // Add event listener
  window.addEventListener('message', messageHandler);
  
  // Set the iframe content using srcdoc attribute instead of directly manipulating the document
  if (iframe) {
    iframe.srcdoc = combinedCode;
  }

  // Return a cleanup function to remove the event listener
  return () => {
    window.removeEventListener('message', messageHandler);
  };
};
