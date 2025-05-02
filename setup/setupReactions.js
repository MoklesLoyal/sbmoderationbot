const fs = require('fs');
const path = require('path');
const { fetch } = require('undici');

// Path to store reaction data
const dataPath = path.join(__dirname, '..', 'data');
const reactionsFilePath = path.join(dataPath, 'reactions.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
    console.log('Created data directory');
}

// Initialize reactions data file if it doesn't exist
if (!fs.existsSync(reactionsFilePath)) {
    const defaultData = { messages: [] };
    fs.writeFileSync(reactionsFilePath, JSON.stringify(defaultData, null, 2));
    console.log('Initialized reactions data file');
}

// Check if Ollama is running
async function checkOllamaStatus() {
    try {
        // Simple test request to Ollama
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama2",
                prompt: "Say hello",
                stream: false
            }),
        });
        
        if (response.ok) {
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                console.log('Ollama test response:', data.response);
                return true;
            } catch (error) {
                console.error('Error parsing Ollama response:', error);
                console.error('Raw response:', text);
                return false;
            }
        } else {
            console.error(`Ollama returned status: ${response.status}`);
            const text = await response.text();
            console.error('Error response:', text);
            return false;
        }
    } catch (error) {
        console.error('Ollama is not running or not accessible:', error.message);
        console.error('Please start Ollama to enable AI message rating.');
        console.error('You can download Ollama from: https://ollama.com/');
        console.error('After installing, run: ollama pull llama2');
        return false;
    }
}

// Run the check
checkOllamaStatus()
    .then(isRunning => {
        if (isRunning) {
            console.log('Reaction tracking system with AI rating is ready');
        } else {
            console.log('Reaction tracking system is ready (AI rating disabled)');
        }
    });
