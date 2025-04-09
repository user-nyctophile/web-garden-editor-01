
export const defaultCode = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Playground</title>
</head>
<body>
  <div class="container">
    <h1>Welcome to Code Playground</h1>
    <p>Start editing to see your changes come to life!</p>
    <button id="demo-button">Click me!</button>
    <div id="output" class="output"></div>
  </div>
</body>
</html>`,

  css: `/* Basic styling */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
  padding: 20px;
  margin: 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2563eb;
  margin-top: 0;
}

button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #1d4ed8;
}

.output {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 4px;
  min-height: 50px;
}`,

  js: `// Add your JavaScript code here
console.log("Script loaded!");

document.getElementById("demo-button").addEventListener("click", function() {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "Button clicked at " + new Date().toLocaleTimeString();
  console.log("Button clicked!");
});

// Example of different console methods
console.log("This is a regular log message");
console.info("This is an informational message");
console.warn("This is a warning message");
console.error("This will appear as an error");

// Demonstrating a simple calculation
function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 10);
console.log("Sum result:", result);`
};
