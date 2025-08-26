// Global state
let messages = [];
let isProcessing = false;

// Tool definitions for function calling (OpenAI/Gemini format)
const tools = [
    {
        type: "function",
        function: {
            name: "google_search",
            description: "Search Google and return snippet results",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query"
                    }
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
                    prompt: {
                        type: "string",
                        description: "The prompt to send to AI Pipe"
                    },
                    operation: {
                        type: "string",
                        description: "The operation type (e.g., 'generate', 'analyze', 'transform')"
                    }
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
                    code: {
                        type: "string",
                        description: "The JavaScript code to execute"
                    }
                },
                required: ["code"]
            }
        }
    }
];

// Convert tools to Gemini format
function convertToGeminiTools() {
    return tools.map(tool => ({
        function_declarations: [{
            name: tool.function.name,
            description: tool.function.description,
            parameters: tool.function.parameters
        }]
    }));
}

// UI Functions
function showAlert(message, type = 'danger') {
    const alertsContainer = document.getElementById('alerts');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertsContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
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

// Tool Implementation
async function executeToolCall(toolCall, provider = 'openai') {
    let name, args;
    
    // Handle different provider formats
    if (provider === 'gemini') {
        name = toolCall.function_call.name;
        args = toolCall.function_call.args;
    } else {
        name = toolCall.function.name;
        args = typeof toolCall.function.arguments === 'string' 
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function.arguments;
    }

    addMessage(`🔧 Calling ${name}(${JSON.stringify(args)})`, 'tool-call', true);

    try {
        let result;
        switch (name) {
            case 'google_search':
                result = await googleSearch(args.query);
                break;
            case 'ai_pipe':
                result = await aiPipe(args.prompt, args.operation);
                break;
            case 'execute_code':
                result = await executeCode(args.code);
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }

        const resultStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        addMessage(`📊 ${name} result: ${resultStr}`, 'tool-result', true);

        // Return format based on provider
        if (provider === 'gemini') {
            return {
                function_response: {
                    name: name,
                    response: { result: resultStr }
                }
            };
        } else {
            return {
                tool_call_id: toolCall.id,
                role: "tool",
                name: name,
                content: resultStr
            };
        }
    } catch (error) {
        const errorMsg = `❌ Tool ${name} failed: ${error.message}`;
        addMessage(errorMsg, 'tool-result', true);
        
        if (provider === 'gemini') {
            return {
                function_response: {
                    name: name,
                    response: { error: errorMsg }
                }
            };
        } else {
            return {
                tool_call_id: toolCall.id,
                role: "tool",
                name: name,
                content: errorMsg
            };
        }
    }
}

// Tool Functions
async function googleSearch(query) {
    // Mock implementation - replace with actual Google Search API
    return {
        query: query,
        results: [
            {
                title: "Sample Result 1",
                snippet: "This is a mock search result for: " + query,
                url: "https://example.com/1"
            },
            {
                title: "Sample Result 2", 
                snippet: "Another mock result showing information about: " + query,
                url: "https://example.com/2"
            }
        ]
    };
}

async function aiPipe(prompt, operation = 'generate') {
    // Mock implementation - replace with actual AI Pipe API
    return {
        operation: operation,
        prompt: prompt,
        result: `AI Pipe processed: "${prompt}" with operation "${operation}". This is a mock response.`
    };
}

async function executeCode(code) {
    try {
        const result = eval(`(function() { ${code} })()`);
        return {
            success: true,
            result: result,
            code: code
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            code: code
        };
    }
}

// LLM API Call
async function callLLM(messages) {
    const provider = document.getElementById('provider').value;
    const model = document.getElementById('model').value;
    const apiKey = document.getElementById('apiKey').value;

    if (!apiKey) {
        throw new Error('API key is required');
    }

    if (provider === 'gemini') {
        return await callGemini(messages, model, apiKey);
    } else if (provider === 'anthropic') {
        return await callAnthropic(messages, model, apiKey);
    } else {
        return await callOpenAI(messages, model, apiKey);
    }
}

// OpenAI API Call
async function callOpenAI(messages, model, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            tools: tools,
            tool_choice: "auto"
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API call failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

// Anthropic API Call
async function callAnthropic(messages, model, apiKey) {
    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: model,
            messages: userMessages,
            system: systemMessage?.content || '',
            max_tokens: 4096,
            tools: tools.map(t => t.function)
        })
    });

    if (!response.ok) {
        throw new Error(`Anthropic API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Convert Anthropic response to OpenAI format
    return {
        choices: [{
            message: {
                role: 'assistant',
                content: result.content[0]?.text || '',
                tool_calls: result.content.filter(c => c.type === 'tool_use').map(c => ({
                    id: c.id,
                    type: 'function',
                    function: {
                        name: c.name,
                        arguments: JSON.stringify(c.input)
                    }
                }))
            }
        }]
    };
}

// Gemini API Call
async function callGemini(messages, model, apiKey) {
    // Convert messages to Gemini format
    const geminiMessages = convertMessagesToGemini(messages);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: geminiMessages,
            tools: convertToGeminiTools(),
            tool_config: {
                function_calling_config: {
                    mode: "AUTO"
                }
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Gemini API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Convert Gemini response to OpenAI format
    const candidate = result.candidates[0];
    const part = candidate.content.parts[0];
    
    let tool_calls = [];
    if (part.functionCall) {
        tool_calls = [{
            id: `call_${Date.now()}`,
            type: 'function',
            function_call: {
                name: part.functionCall.name,
                args: part.functionCall.args
            }
        }];
    }

    return {
        choices: [{
            message: {
                role: 'assistant',
                content: part.text || '',
                tool_calls: tool_calls
            }
        }]
    };
}

// Convert messages to Gemini format
function convertMessagesToGemini(messages) {
    return messages.filter(m => m.role !== 'tool').map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
    }));
}

// Main Agent Loop
async function agentLoop() {
    if (isProcessing) return;
    isProcessing = true;

    const provider = document.getElementById('provider').value;

    try {
        while (true) {
            const response = await callLLM(messages);
            const message = response.choices[0].message;

            if (message.content) {
                addMessage(`🤖 ${message.content}`, 'agent');
            }

            messages.push(message);

            if (message.tool_calls && message.tool_calls.length > 0) {
                const toolResults = await Promise.all(
                    message.tool_calls.map(tc => executeToolCall(tc, provider))
                );
                
                // Handle different response formats
                if (provider === 'gemini') {
                    // For Gemini, add function responses to the conversation
                    messages.push({
                        role: 'function',
                        parts: toolResults.map(tr => tr.function_response)
                    });
                } else {
                    messages.push(...toolResults);
                }
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

// User Input Handler
async function sendMessage() {
    const input = document.getElementById('user-input');
    const userMessage = input.value.trim();
    
    if (!userMessage || isProcessing) return;

    input.value = '';

    addMessage(`👤 ${userMessage}`, 'user');
    messages.push({
        role: "user",
        content: userMessage
    });

    await agentLoop();
}

// Model change handler
document.getElementById('provider').addEventListener('change', function() {
    const provider = this.value;
    const modelSelect = document.getElementById('model');
    
    if (provider === 'openai') {
        modelSelect.innerHTML = `
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        `;
    } else if (provider === 'anthropic') {
        modelSelect.innerHTML = `
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
        `;
    } else if (provider === 'gemini') {
        modelSelect.innerHTML = `
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
        `;
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    showAlert('Welcome! Enter your API key and start chatting with the LLM agent.', 'info');
});
