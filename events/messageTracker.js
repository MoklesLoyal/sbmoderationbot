const { EmbedBuilder } = require('discord.js');
const { logChannelId, enabledChannels } = require('../config/logchannel.json');
const fs = require('fs');const levelsPath = './data/levels.json';
let levels = {};

if (fs.existsSync(levelsPath)) {
    levels = JSON.parse(fs.readFileSync(levelsPath));
}

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;
        
        const userId = message.author.id;
        if (!levels[userId]) {
            levels[userId] = { xp: 0, level: 1, messages: 0 };
        }
        
        // Update message count
        levels[userId].messages = (levels[userId].messages || 0) + 1;
        
        // Add XP (random between 15-25)
        levels[userId].xp += Math.floor(Math.random() * 10) + 15;
        
        // Calculate level up
        const xpNeeded = levels[userId].level * 100;
        
        if (levels[userId].xp >= xpNeeded) {
            levels[userId].level++;
            levels[userId].xp = 0;
            
            // const levelUpEmbed = new EmbedBuilder()
            //     .setTitle('Level Up! 🎉')
            //     .setColor('#00FF00')
            //     .setDescription(`Congratulations ${message.author}!\nYou've reached level ${levels[userId].level}!`)
            //     .setFields([
            //         { name: 'Messages Sent', value: levels[userId].messages.toString() },
            //         { name: 'Next Level', value: `${levels[userId].xp}/${(levels[userId].level + 1) * 100} XP` }
            //     ]);
            
            // message.channel.send({ embeds: [levelUpEmbed] });
        }
        
        // Save data
        fs.writeFileSync(levelsPath, JSON.stringify(levels, null, 2));
    }
};
