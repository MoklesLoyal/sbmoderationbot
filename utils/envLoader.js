const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load OpenAI API key from env/openaikey.env
function loadOpenAIKey() {
    try {
        const envPath = path.join(__dirname, '..', 'env', 'openaikey.env');
        
        if (fs.existsSync(envPath)) {
            const envConfig = dotenv.parse(fs.readFileSync(envPath));
            
            if (!envConfig.OPENAI_API_KEY) {
                console.error('OPENAI_API_KEY not found in env file');
                return null;
            }
            
            // Set the environment variable
            process.env.OPENAI_API_KEY = envConfig.OPENAI_API_KEY;
            
            return envConfig.OPENAI_API_KEY;
        } else {
            console.error('OpenAI API key file not found at:', envPath);
            return null;
        }
    } catch (error) {
        console.error('Error loading OpenAI API key:', error);
        return null;
    }
}

module.exports = { loadOpenAIKey };
