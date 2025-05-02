const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'messageReactionRemoveAll',
    async execute(message) {
        try {
            if (message.guild?.id !== '374971715626991626') return;

            const logChannel = message.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('All Reactions Removed')
                .setAuthor({ 
                    name: message.author?.tag || 'Unknown', 
                    iconURL: message.author?.displayAvatarURL() 
                })
                .addFields(
                    { name: 'Channel', value: message.channel.name },
                    { name: 'Message Link', value: `[Jump to Message](${message.url})` },
                    { name: 'Message Content', value: message.content?.slice(0, 1024) || 'No content' }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in messageReactionRemoveAll event:', error);
        }
    }
};
