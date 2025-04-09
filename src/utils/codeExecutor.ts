
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
  // Set up message event listener for console output from iframe
  const messageHandler = (event: MessageEvent) => {
    if (event.data && typeof event.data === 'object' && 'type' in event.data && 'message' in event.data) {
      const { type, message } = event.data;
      onConsoleOutput({ type, message });
    }
  };

  // Add event listener
  window.addEventListener('message', messageHandler);

  // Return a cleanup function to remove the event listener
  return () => {
    window.removeEventListener('message', messageHandler);
  };
};
