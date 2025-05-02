const { fetch } = require('undici');

// Function to interact with local Llama model via Ollama
async function generateWithLlama(prompt) {
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama2", // You can change this to any model you have installed in Ollama
                prompt: prompt,
                stream: false // Important: set to false to get a complete response
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        let result;
        
        try {
            result = JSON.parse(text);
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            console.error('Raw response:', text);
            throw new Error('Invalid JSON response from Ollama');
        }

        return result.response || "No response generated";
    } catch (error) {
        console.error('Error generating with Llama:', error);
        return "I couldn't process this request. My local AI model might be offline.";
    }
}

// Specific function for rating messages
async function rateMessage(content) {
    const prompt = `You are a humorous message rater. Rate the following message on a scale of 1-10 and provide a brief, witty comment about it. Keep your response under 100 characters.

Message: "${content}"

Your rating:`;

    try {
        const rating = await generateWithLlama(prompt);
        return rating.trim();
    } catch (error) {
        console.error('Error rating message:', error);
        return "I tried to rate this message, but my circuits got overloaded! 🤖💥";
    }
}

module.exports = { generateWithLlama, rateMessage };
