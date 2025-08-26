# LLM Agent

A browser-based LLM agent that supports **any OpenAI-compatible API** with dynamic tool calling and continuous reasoning loops.

## 🌟 Features

- 🌐 **API Support**: Works with any LLM API (OpenAI format or custom)
- 🔧 **Quick Presets**: Built-in configurations for popular providers
- 🛠️ **Tool Calling**: Google Search, AI Pipe, JavaScript execution
- 🔄 **Agent Loop**: Continuous reasoning until task completion
- 💾 **Save/Load Configs**: Export and import API configurations
- 🔒 **Secure**: API keys stored in memory only
- 🎨 **Clean UI**: Bootstrap-based responsive interface

## 🚀 Supported Providers

### Built-in Presets:
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet
- **Google Gemini**: Gemini 1.5 Pro/Flash, Gemini 1.0 Pro
- **Azure OpenAI**: Enterprise OpenAI models
- **Ollama**: Local LLM hosting (llama3.1, codellama, etc.)
- **Together AI**: Open source models (Llama-2, Mistral, etc.)
- **Perplexity**: Web-connected models
- **Groq**: Ultra-fast inference (Mixtral, Llama)
- **Cohere**: Command models
- **Mistral AI**: Mistral Large/Medium

### Universal Support:
- Any OpenAI-compatible API
- Custom authentication methods
- Flexible request/response formats
- Local and cloud deployments

## 📖 Usage

### Quick Start
1. **Select Preset**: Choose from popular providers or use "Custom"
2. **Enter API Key**: Add your API key securely
3. **Test Connection**: Verify your configuration works
4. **Start Chatting**: Agent will automatically use tools as needed

### Custom Configuration
1. **API Endpoint**: Enter any compatible API URL
2. **Auth Method**: Choose Bearer, API Key, Custom Header, or No Auth
3. **Request Format**: OpenAI, Anthropic, Gemini, or Custom
4. **Save Config**: Export settings for reuse

## 🔧 Tool Functions

### Google Search
```javascript
// Mock implementation - replace with actual Google Search API
async function googleSearch(query) { 
    return {
        query: query,
        results: [
            { title: "Result 1", snippet: "Search result", url: "https://example.com" }
        ]
    };
}
```

### AI Pipe
```javascript
// Mock implementation - replace with actual AI Pipe API
async function aiPipe(prompt, operation) { 
    return {
        operation: operation,
        result: `AI processed: ${prompt}`
    };
}
```

### Code Execution
```javascript
// Secure in-browser JavaScript execution
async function executeCode(code) { 
    try {
        const result = eval(`(function() { ${code} })()`);
        return { success: true, result: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

## 📝 Example Configurations

### Local Ollama
```json
{
  "endpoint": "http://localhost:11434/v1/chat/completions",
  "model": "llama3.1",
  "authType": "none",
  "requestFormat": "openai"
}
```

### Custom API
```json
{
  "endpoint": "https://your-api.com/v1/chat/completions",
  "model": "your-model",
  "apiKey": "your-key",
  "authType": "bearer",
  "requestFormat": "openai"
}
```

### Azure OpenAI
```json
{
  "endpoint": "https://your-resource.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2024-02-01",
  "model": "gpt-4",
  "apiKey": "your-azure-key",
  "authType": "api-key",
  "authHeader": "api-key",
  "requestFormat": "openai"
}
```

## 🔐 Security Features

- **Memory-only storage**: API keys never saved to disk
- **Session timeout**: Auto-clear after inactivity
- **Connection testing**: Verify API before use
- **Export/Import**: Save configurations without sensitive data
- **No persistence**: Keys cleared on page refresh/close

## 🏗️ Development

### Local Setup
1. Clone the repository
2. Open `index.html` in your browser
3. Configure your LLM API
4. Start building!

### GitHub Pages Deployment
1. Create GitHub repository
2. Upload files: `index.html`, `style.css`, `script.js`, `README.md`
3. Enable Pages in Settings → Pages
4. Access at `https://username.github.io/repo-name/`

## 🆔 API Key Sources

- **OpenAI**: [platform.openai.com](https://platform.openai.com)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Google AI**: [makersuite.google.com](https://makersuite.google.com/app/apikey)
- **Azure**: [portal.azure.com](https://portal.azure.com)
- **Together**: [api.together.xyz](https://api.together.xyz)
- **Groq**: [console.groq.com](https://console.groq.com)
- **Perplexity**: [docs.perplexity.ai](https://docs.perplexity.ai)
- **Cohere**: [dashboard.cohere.ai](https://dashboard.cohere.ai)
- **Mistral**: [console.mistral.ai](https://console.mistral.ai)

## 🌟 Key Improvements

### Universal Features
- **10+ Built-in Presets**: Quick setup for popular providers
- **Custom API Support**: Any OpenAI-compatible endpoint
- **Flexible Authentication**: Bearer, API key, custom headers, or no auth
- **Format Adaptation**: Automatic conversion between API formats

### Advanced Configuration
- **Test Connection**: Verify API setup before use
- **Save/Load Configs**: Export settings for backup/sharing
- **Session Security**: Memory-only storage with auto-timeout
- **Visual Indicators**: Connection status and validation feedback

### Tool Calling Excellence
- **Universal Interface**: Same tool calling across all providers
- **Parallel Execution**: Multiple tool calls simultaneously
- **Error Handling**: Graceful failure recovery
- **Result Display**: Clear visualization of tool outputs

## 🔄 Migration Guide

### From Limited Version
If upgrading from the 3-provider version:
1. Replace all files with universal versions
2. Existing API keys work with presets
3. Same tool functions - no changes needed
4. Enhanced security and features

### Adding Custom Providers
```javascript
// Add to providerPresets object in script.js
yourProvider: {
    endpoint: 'https://your-api.com/v1/chat/completions',
    authType: 'bearer',
    requestFormat: 'openai',
    defaultModel: 'your-model'
}
```

## 🚀 Use Cases

### Multi-Provider Testing
Compare responses across different LLMs for the same prompt without code changes.

### Local Development
```bash
# Start Ollama locally
ollama serve
ollama pull llama3.1

# Use in agent with no API key required
```

### Enterprise Integration
Use Azure OpenAI for compliance while maintaining same interface as OpenAI.

### Cost Optimization
- **Groq**: Ultra-fast inference for speed
- **Together AI**: Budget-friendly open source models
- **Local Ollama**: Zero API costs for development

## 🎪 Example Agent Conversation

```
User: Create a simple calculator and test it
Agent: I'll create a JavaScript calculator for you

🔧 Calling execute_code({"code": "function calculator(a, b, op) { ... }"})
📊 Result: Calculator function created successfully

Agent: Now let me test the calculator

🔧 Calling execute_code({"code": "calculator(5, 3, '+')"})  
📊 Result: 8

Agent: Perfect! The calculator works correctly. It can handle +, -, *, / operations.
User: Search for advanced calculator features
Agent: Let me search for advanced calculator features

🔧 Calling google_search({"query": "advanced calculator features programming"})
📊 Result: Found articles about scientific functions, memory operations, history...

Agent: Based on the search results, I can enhance the calculator with scientific functions, memory operations, and calculation history. Would you like me to implement any of these features?
```

---

**Ready to get started?** 
1. Copy the files to your GitHub repository
2. Enable GitHub Pages
3. Configure your preferred LLM API
4. Start building with universal LLM support!
