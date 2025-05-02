const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add the config import if it doesn't exist
    if (!content.includes('logchannel.json')) {
        content = `const { logChannelId } = require('../config/logchannel.json');\n${content}`;
    }
    
    // Replace the hardcoded channel ID with the config variable
    content = content.replace(/'LOG_CHANNEL_ID'/g, 'logChannelId');
    
    fs.writeFileSync(filePath, content);
}

console.log('Successfully updated all event files!');
