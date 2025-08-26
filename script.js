// Global state
let messages = [];
let isProcessing = false;
let currentConfig = {};

// Provider presets
const providerPresets = {
    openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        authType: 'bearer',
        requestFormat: 'openai',
        defaultModel: 'gpt-4'
    },
    anthropic: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        authType: 'api-key',
        authHeader: 'x-api-key',
        requestFormat: 'anthropic',
        defaultModel: 'claude-3-5-sonnet-20241022'
    },
    gemini: {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/MODEL_NAME:generateContent',
        authType: 'none',
        requestFormat: 'gemini',
        defaultModel: 'gemini-1.5-pro',
        urlTemplate: true
    },
    azure: {
        endpoint: 'https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT/chat/completions?api-version=2024-02-01',
        authType: 'api-key',
        authHeader: 'api-key',
        requestFormat: 'openai',
        defaultModel: 'gpt-4'
    },
    ollama: {
        endpoint: 'http://localhost:11434/v1/chat/completions',
        authType: 'none',
        requestFormat: 'openai',
        defaultModel: 'llama3.1'
    },
    together: {
        endpoint: 'https://api.together.xyz/v1/chat/completions',
        authType: 'bearer',
        requestFormat: 'openai',
        defaultModel: 'meta-llama/Llama-2-70b-chat-hf'
    },
    perplexity: {
        endpoint: 'https://api.perplexity.ai/chat/completions',
        authType: 'bearer',
        requestFormat: 'openai',
        defaultModel: 'llama-3.1-sonar-small-128k-online'
    },
    groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        authType: 'bearer',
        requestFormat: 'openai',
        defaultModel: 'mixtral-8x7b-32768'
    },
    cohere: {
        endpoint: 'https://api.cohere.ai/v1/chat',
        authType: 'bearer',
        requestFormat: 'custom',
        defaultModel: 'command-r-plus'
    },
    mistral: {
        endpoint: 'https://api.mistral.ai/v1/chat/completions',
        authType: 'bearer',
        requestFormat: 'openai',
        defaultModel: 'mistral-large-latest'
    }
};

// Tool definitions (universal format)
const tools = [
    {
        type: "function",
        function: {
            name: "google_search",
            description: "Search Google and return snippet results",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The search query" }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function", 
        function: {
            name: "ai_pipe",
            description: "Call AI Pipe proxy API for flexible dataflows",
            parameters: {
                type: "object",
                properties: {
                    prompt: { type: "string", description: "The prompt to send to AI Pipe" },
                    operation: { type: "string", description: "The operation type" }
                },
                required: ["prompt"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "execute_code",
            description: "Execute JavaScript code in the browser",
            parameters: {
                type: "object",
                properties: {
                    code: { type: "string", description: "The JavaScript code to execute" }
                },
                required: ["code"]
            }
        }
    }
];

// UI Functions
function showAlert(message, type = 'danger') {
    const alertsContainer = document.getElementById('alerts');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    alertsContainer.appendChild(alertDiv);
    setTimeout(() => alertDiv?.remove(), 5000);
}

function addMessage(content, type, isToolCall = false) {
    const chatContainer = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    if (isToolCall) {
        messageDiv.className = type === 'tool-call' ? 'tool-call' : 'tool-result';
    }
    
    messageDiv.innerHTML = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Configuration Management
function applyPreset() {
    const presetName = document.getElementById('provider-preset').value;
    if (presetName === 'custom') return;
    
    const preset = providerPresets[presetName];
    if (!preset) return;
    
    document.getElementById('api-endpoint').value = preset.endpoint;
    document.getElementById('model-name').value = preset.defaultModel;
    document.getElementById('auth-type').value = preset.authType;
    document.getElementById('auth-header').value = preset.authHeader || '';
    document.getElementById('request-format').value = preset.requestFormat;
    
    updateAuthFields();
}

function updateAuthFields() {
    const authType = document.getElementById('auth-type').value;
    const authHeaderField = document.getElementById('auth-header');
    
    authHeaderField.disabled = authType !== 'custom';
    
    if (authType === 'bearer') {
        authHeaderField.value = 'Authorization';
    } else if (authType === 'api-key') {
        authHeaderField.value = 'x-api-key';
    }
}

function getCurrentConfig() {
    return {
        endpoint: document.getElementById('api-endpoint').value,
        model: document.getElementById('model-name').value,
        apiKey: document.getElementById('api-key').value,
        authType: document.getElementById('auth-type').value,
        authHeader: document.getElementById('auth-header').value,
        requestFormat: document.getElementById('request-format').value
    };
}

// Universal LLM API Call
async function callLLM(messages) {
    const config = getCurrentConfig();
    
    if (!config.endpoint || !config.model) {
        throw new Error('Please configure API endpoint and model');
    }

    const headers = { 'Content-Type': 'application/json' };
    
    // Add authentication
    if (config.authType === 'bearer' && config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else if (config.authType === 'api-key' && config.apiKey) {
        headers[config.authHeader || 'x-api-key'] = config.apiKey;
    } else if (config.authType === 'custom' && config.apiKey) {
        headers[config.authHeader] = config.apiKey;
    }

    let endpoint = config.endpoint;
    let requestBody;

    // Format request based on provider type
    switch (config.requestFormat) {
        case 'openai':
            requestBody = {
                model: config.model,
                messages: messages,
                tools: tools,
                tool_choice: "auto"
            };
            break;
            
        case 'anthropic':
            const systemMsg = messages.find(m => m.role === 'system');
            const userMsgs = messages.filter(m => m.role !== 'system');
            requestBody = {
                model: config.model,
                messages: userMsgs,
                system: systemMsg?.content || '',
                max_tokens: 4096,
                tools: tools.map(t => t.function)
            };
            headers['anthropic-version'] = '2023-06-01';
            break;
            
        case 'gemini':
            if (config.apiKey) {
                endpoint = endpoint.replace('MODEL_NAME', config.model) + `?key=${config.apiKey}`;
            }
            requestBody = {
                contents: convertMessagesToGemini(messages),
                tools: convertToGeminiTools(),
                tool_config: { function_calling_config: { mode: "AUTO" } }
            };
            break;
            
        case 'custom':
            // Use custom template if provided
            requestBody = {
                model: config.model,
                messages: messages,
                tools: tools
            };
            break;
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return formatResponse(result, config.requestFormat);
}

// Response formatting
function formatResponse(result, format) {
    switch (format) {
        case 'openai':
            return result;
            
        case 'anthropic':
            return {
                choices: [{
                    message: {
                        role: 'assistant',
                        content: result.content[0]?.text || '',
                        tool_calls: result.content.filter(c => c.type === 'tool_use').map(c => ({
                            id: c.id,
                            type: 'function',
                            function: { name: c.name, arguments: JSON.stringify(c.input) }
                        }))
                    }
                }]
            };
            
        case 'gemini':
            const candidate = result.candidates[0];
            const part = candidate.content.parts[0];
            return {
                choices: [{
                    message: {
                        role: 'assistant',
                        content: part.text || '',
                        tool_calls: part.functionCall ? [{
                            id: `call_${Date.now()}`,
                            type: 'function',
                            function: { name: part.functionCall.name, arguments: JSON.stringify(part.functionCall.args) }
                        }] : []
                    }
                }]
            };
            
        default:
            return result;
    }
}

// Tool execution
async function executeToolCall(toolCall) {
    const { name, arguments: args } = toolCall.function;
    const parsedArgs = JSON.parse(args);

    addMessage(`🔧 Calling ${name}(${JSON.stringify(parsedArgs)})`, 'tool-call', true);

    try {
        let result;
        switch (name) {
            case 'google_search':
                result = await googleSearch(parsedArgs.query);
                break;
            case 'ai_pipe':
                result = await aiPipe(parsedArgs.prompt, parsedArgs.operation);
                break;
            case 'execute_code':
                result = await executeCode(parsedArgs.code);
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }

        const resultStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        addMessage(`📊 Result: <pre>${resultStr}</pre>`, 'tool-result', true);

        return {
            tool_call_id: toolCall.id,
            role: "tool",
            name: name,
            content: resultStr
        };
    } catch (error) {
        const errorMsg = `❌ Tool ${name} failed: ${error.message}`;
        addMessage(errorMsg, 'tool-result', true);
        return {
            tool_call_id: toolCall.id,
            role: "tool",
            name: name,
            content: errorMsg
        };
    }
}

// Tool implementations
async function googleSearch(query) {
    return {
        query: query,
        results: [
            { title: "Sample Result 1", snippet: `Mock search result for: ${query}`, url: "https://example.com/1" },
            { title: "Sample Result 2", snippet: `Another mock result for: ${query}`, url: "https://example.com/2" }
        ]
    };
}

async function aiPipe(prompt, operation = 'generate') {
    return {
        operation: operation,
        prompt: prompt,
        result: `AI Pipe processed: "${prompt}" with operation "${operation}". Mock response.`
    };
}

async function executeCode(code) {
    try {
        const result = eval(`(function() { ${code} })()`);
        return { success: true, result: result, code: code };
    } catch (error) {
        return { success: false, error: error.message, code: code };
    }
}

// Helper functions
function convertMessagesToGemini(messages) {
    return messages.filter(m => m.role !== 'tool').map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
    }));
}

function convertToGeminiTools() {
    return tools.map(tool => ({
        function_declarations: [{
            name: tool.function.name,
            description: tool.function.description,
            parameters: tool.function.parameters
        }]
    }));
}

// Main agent loop
async function agentLoop() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        while (true) {
            const response = await callLLM(messages);
            const message = response.choices[0].message;

            if (message.content) {
                addMessage(`🤖 ${message.content}`, 'agent');
            }

            messages.push(message);

            if (message.tool_calls && message.tool_calls.length > 0) {
                const toolResults = await Promise.all(message.tool_calls.map(executeToolCall));
                messages.push(...toolResults);
            } else {
                break;
            }
        }
    } catch (error) {
        showAlert(`Agent error: ${error.message}`);
        console.error('Agent loop error:', error);
    } finally {
        isProcessing = false;
    }
}

// User interface handlers
async function sendMessage() {
    const input = document.getElementById('user-input');
    const userMessage = input.value.trim();
    
    if (!userMessage || isProcessing) return;

    input.value = '';
    addMessage(`👤 ${userMessage}`, 'user');
    messages.push({ role: "user", content: userMessage });

    await agentLoop();
}

async function testConnection() {
    try {
        const testMessages = [{ role: "user", content: "Hello! Please respond with just 'Connection successful'" }];
        await callLLM(testMessages);
        showAlert('✅ Connection successful!', 'success');
    } catch (error) {
        showAlert(`❌ Connection failed: ${error.message}`, 'danger');
    }
}

function saveConfiguration() {
    const config = getCurrentConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llm-agent-config.json';
    a.click();
    URL.revokeObjectURL(url);
    showAlert('Configuration saved!', 'success');
}

function loadConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                document.getElementById('api-endpoint').value = config.endpoint || '';
                document.getElementById('model-name').value = config.model || '';
                document.getElementById('api-key').value = config.apiKey || '';
                document.getElementById('auth-type').value = config.authType || 'bearer';
                document.getElementById('auth-header').value = config.authHeader || '';
                document.getElementById('request-format').value = config.requestFormat || 'openai';
                updateAuthFields();
                showAlert('Configuration loaded!', 'success');
            } catch (error) {
                showAlert('Failed to load configuration: ' + error.message, 'danger');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('provider-preset').addEventListener('change', applyPreset);
    document.getElementById('auth-type').addEventListener('change', updateAuthFields);
    
    updateAuthFields();
    showAlert('LLM Agent ready! Configure your API and start chatting.', 'info');
});
