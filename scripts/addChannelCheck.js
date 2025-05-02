const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '..', 'events');
const checkCode = `const { enabledChannels } = require('../config/logchannel.json');

    // Check if channel is enabled
    if (!enabledChannels.includes(message.channelId)) return;
`;

fs.readdirSync(eventsPath).forEach(file => {
    if (!file.endsWith('.js')) return;
    
    const filePath = path.join(eventsPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add imports if needed
    if (!content.includes('logchannel.json')) {
        content = content.replace(
            /const {([^}]+)} = require\('discord\.js'\);/,
            `const {$1} = require('discord.js');\nconst { enabledChannels } = require('../config/logchannel.json');`
        );
    }
    
    // Add channel check after execute declaration
    content = content.replace(
        /async execute\([^)]+\) {/,
        `async execute($&\n    // Check if channel is enabled\n    if (!enabledChannels.includes(message.channelId)) return;\n`
    );
    
    fs.writeFileSync(filePath, content);
});
