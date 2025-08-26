# Minimal JavaScript LLM Agent

A browser-based LLM agent that can dynamically trigger tool calls based on LLM-chosen actions, implementing a reasoning loop until tasks are complete.

## Features

- 🤖 **LLM Integration**: Support for OpenAI, Anthropic, and Google Gemini models
- 🛠️ **Tool Calling**: Google Search, AI Pipe, and JavaScript execution
- 🔄 **Agent Loop**: Continuous reasoning until task completion
- 🎨 **Clean UI**: Bootstrap-based responsive interface
- 🚀 **Zero Dependencies**: Pure JavaScript, no build process

## Live Demo

Access the live app at: 

## Usage

1. **Setup**: Enter your API key (OpenAI, Anthropic, or Google AI Studio)
2. **Select Model**: Choose your preferred LLM provider and model
3. **Chat**: Start conversing - the agent will automatically call tools as needed

## Tool Functions

### Google Search
```javascript
// Mock implementation - replace with actual Google Search API
async function googleSearch(query) { /* ... */ }

### AI Pipe
```javascript
// Mock implementation - replace with actual AI Pipe API  
async function aiPipe(prompt, operation) { /* ... */ }

### Code Execution
```javascript
// Secure in-browser JavaScript execution
async function executeCode(code) { /* ... */ }
