const { EmbedBuilder } = require('discord.js');

function createLogEmbed(type, data) {
    return new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${type}`)
        .setTimestamp()
        .setFooter({ text: 'SharkBrew Logging System' });
}

module.exports = { createLogEmbed };
