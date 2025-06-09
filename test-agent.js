// Quick test script to verify agent functionality
console.log("Testing calculator functionality...");

// Test basic calculator
function testCalculator(expression) {
  console.log(`Testing: ${expression}`);
  try {
    // Only allow basic math operations
    if (!/^[\d+\-*/().\s]+$/.test(expression)) {
      return "Error: Invalid characters in expression";
    }
    const result = eval(expression);
    return `${expression} = ${result}`;
  } catch (error) {
    return `Error calculating ${expression}: ${error.message}`;
  }
}

// Test text utility
function testTextUtility(operation, text) {
  console.log(`Testing text operation: ${operation} on "${text}"`);
  
  if (operation === "count") {
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    return `Word count: ${words}, Character count: ${chars}`;
  } else if (operation === "uppercase") {
    return text.toUpperCase();
  } else if (operation === "lowercase") {
    return text.toLowerCase();
  } else if (operation === "reverse") {
    return text.split('').reverse().join('');
  }
  
  return "Unknown text operation";
}

// Run tests
console.log(testCalculator("2 + 3 * 4"));
console.log(testCalculator("(10 + 5) / 3"));
console.log(testTextUtility("count", "Hello world this is a test"));
console.log(testTextUtility("uppercase", "hello world"));
console.log(testTextUtility("reverse", "hello"));

console.log("Agent functionality test complete!");
