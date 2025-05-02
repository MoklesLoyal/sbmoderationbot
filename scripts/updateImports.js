const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '..', 'events');

fs.readdirSync(eventsPath).forEach(file => {
    if (!file.endsWith('.js')) return;
    
    const filePath = path.join(eventsPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(
        /const { logChannelId } = require\('\.\.\/config\/logchannel\.json'\);/g,
        'const { logChannelId, enabledChannels } = require(\'../config/logchannel.json\');'
    );
    
    fs.writeFileSync(filePath, content);
});
